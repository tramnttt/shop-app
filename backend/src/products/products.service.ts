import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { Category } from '../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as path from 'path';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,

        @InjectRepository(ProductImage)
        private productImagesRepository: Repository<ProductImage>,

        @InjectRepository(ProductCategory)
        private productCategoriesRepository: Repository<ProductCategory>,

        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>
    ) { }

    async findAll(query: any) {
        const take = query.limit || 10;
        const skip = query.page ? (query.page - 1) * take : 0;

        try {
            // Create query builder for products
            const queryBuilder = this.productsRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.images', 'image')
                .leftJoinAndSelect('product.productCategories', 'productCategory')
                .leftJoinAndSelect('productCategory.category', 'category')
                .where('product.deleted_at IS NULL');

            // Apply filters if provided
            if (query.search) {
                queryBuilder.andWhere('(product.name LIKE :search OR product.description LIKE :search OR product.sku LIKE :search)',
                    { search: `%${query.search}%` });
            }

            if (query.categoryId) {
                queryBuilder.andWhere('category.category_id = :categoryId', { categoryId: query.categoryId });
            }

            if (query.featured !== undefined) {
                queryBuilder.andWhere('product.is_featured = :featured', { featured: query.featured });
            }

            if (query.minPrice !== undefined) {
                queryBuilder.andWhere('(product.sale_price IS NOT NULL AND product.sale_price >= :minPrice) OR (product.sale_price IS NULL AND product.base_price >= :minPrice)',
                    { minPrice: query.minPrice });
            }

            if (query.maxPrice !== undefined) {
                queryBuilder.andWhere('(product.sale_price IS NOT NULL AND product.sale_price <= :maxPrice) OR (product.sale_price IS NULL AND product.base_price <= :maxPrice)',
                    { maxPrice: query.maxPrice });
            }

            // Add pagination and ordering
            queryBuilder
                .orderBy('product.created_at', 'DESC')
                .skip(skip)
                .take(take);

            const [products, total] = await queryBuilder.getManyAndCount();

            // Transform the result to include categories in the expected format
            const transformedProducts = products.map(product => {
                const categories = product.productCategories?.map(pc => ({
                    category_id: pc.category.category_id,
                    name: pc.category.name
                })) || [];

                const { productCategories, ...productData } = product;
                return {
                    ...productData,
                    categories
                };
            });

            return {
                products: transformedProducts,
                totalCount: total,
                currentPage: query.page || 1,
                totalPages: Math.ceil(total / take)
            };
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number) {
        const product = await this.productsRepository.findOne({
            where: { product_id: id },
            relations: ['images', 'productCategories', 'productCategories.category']
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Transform product categories to the expected format
        const categories = product.productCategories?.map(pc => ({
            category_id: pc.category.category_id,
            name: pc.category.name
        })) || [];

        const { productCategories, ...productData } = product;
        return {
            ...productData,
            categories
        };
    }

    async create(createProductDto: CreateProductDto, files: Express.Multer.File[] = []) {
        console.log(`Creating product with data:`, createProductDto);
        console.log('Request type:', files?.length > 0 ? 'multipart/form-data with files' : 'JSON or empty multipart');

        // Handle is_featured explicitly to ensure it's always a boolean
        if ('is_featured' in createProductDto) {
            const rawValue = createProductDto.is_featured;
            console.log('Raw is_featured value for create:', {
                value: rawValue,
                type: typeof rawValue,
                stringValue: rawValue !== undefined ? String(rawValue) : 'undefined'
            });

            // Always convert to boolean, null is not allowed for is_featured in database
            let booleanValue: boolean;

            if (rawValue === null || rawValue === undefined) {
                console.log('is_featured is null/undefined, setting to false');
                booleanValue = false;
            } else if (typeof rawValue === 'boolean') {
                console.log('is_featured is already boolean:', rawValue);
                booleanValue = rawValue;
            } else if (typeof rawValue === 'string') {
                // CRITICAL FIX: Default behavior for 'true'/'false' strings seems broken
                // Explicit check for string value 'false' to convert to boolean false
                if (String(rawValue).toLowerCase() === 'false') {
                    booleanValue = false;
                    console.log(`String "false" explicitly converted to boolean false`);
                } else {
                    const lowerValue = String(rawValue).toLowerCase();
                    booleanValue = lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
                    console.log(`Converting string is_featured "${rawValue}" to boolean:`, booleanValue);
                }
            } else if (rawValue === 1 || rawValue === 0) {
                booleanValue = rawValue === 1;
                console.log(`Converting numeric is_featured ${rawValue} to boolean:`, booleanValue);
            } else {
                console.log('Unexpected is_featured value, defaulting to false:', rawValue);
                booleanValue = false;
            }

            // Set the normalized boolean value
            createProductDto.is_featured = booleanValue;
            console.log('Final is_featured value to save:', booleanValue, typeof booleanValue);
        }

        // Process base64 image uploads if any
        let processedFiles = [...files];
        if (createProductDto.image_uploads && createProductDto.image_uploads.length > 0) {
            console.log(`Processing ${createProductDto.image_uploads.length} base64 encoded images`);

            // Process each base64 image
            const processedBase64Files = await this.processBase64Images(createProductDto.image_uploads);
            processedFiles = [...processedFiles, ...processedBase64Files];

            // Remove the image_uploads from DTO as we've processed them
            delete createProductDto.image_uploads;
        }

        const { category_ids, ...productData } = createProductDto;

        // Create and save the product
        const product = this.productsRepository.create(productData);
        const savedProduct = await this.productsRepository.save(product);

        // Handle product images
        if (processedFiles.length > 0) {
            const productImages = processedFiles.map((file, index) => {
                return this.productImagesRepository.create({
                    image_url: `/uploads/products/${file.filename}`,
                    alt_text: createProductDto.name,
                    is_primary: index === 0,
                    product: savedProduct
                });
            });
            await this.productImagesRepository.save(productImages);
        }

        // Handle product categories
        if (category_ids && category_ids.length > 0) {
            const categories = await this.categoriesRepository.find({
                where: { category_id: In(category_ids) }
            });

            const productCategories = categories.map(category => {
                return this.productCategoriesRepository.create({
                    product: savedProduct,
                    category
                });
            });

            await this.productCategoriesRepository.save(productCategories);
        }

        return this.findOne(savedProduct.product_id);
    }

    // Helper method to process base64 images and save them to the file system
    private async processBase64Images(imageUploads: Array<{
        filename: string;
        mimetype: string;
        base64: string;
        size: number;
    }>): Promise<Express.Multer.File[]> {
        const fs = require('fs');
        const path = require('path');
        const { v4: uuidv4 } = require('uuid');

        // Ensure the upload directory exists
        const uploadDir = path.join(process.cwd(), 'uploads', 'products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Process each image
        const processedFiles: Express.Multer.File[] = [];

        for (const image of imageUploads) {
            try {
                // Extract the base64 data (remove the data:image/jpeg;base64, part)
                const base64Data = image.base64.split(';base64,').pop();
                if (!base64Data) {
                    console.error('Invalid base64 data for file:', image.filename);
                    continue;
                }

                // Generate a unique filename
                const uniqueFilename = `${uuidv4()}-${image.filename}`;
                const filePath = path.join(uploadDir, uniqueFilename);

                // Write the file to disk
                fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });

                // Create a file object similar to what multer would create
                const file = {
                    fieldname: 'images',
                    originalname: image.filename,
                    encoding: '7bit',
                    mimetype: image.mimetype,
                    destination: uploadDir,
                    filename: uniqueFilename,
                    path: filePath,
                    size: image.size
                } as Express.Multer.File;

                processedFiles.push(file);
            } catch (error) {
                console.error('Error processing base64 image:', error);
            }
        }

        return processedFiles;
    }

    async update(id: number, updateProductDto: UpdateProductDto, files: Express.Multer.File[] = []) {
        console.log(`Updating product ${id} with data:`, updateProductDto);
        console.log('Request type:', files?.length > 0 ? 'multipart/form-data with files' : 'JSON or empty multipart');

        // Handle is_featured explicitly to ensure it's always a boolean
        if ('is_featured' in updateProductDto) {
            const rawValue = updateProductDto.is_featured;

            // Always convert to boolean, null is not allowed for is_featured in database
            let booleanValue: boolean;

            if (rawValue === null || rawValue === undefined) {
                booleanValue = false;
            } else if (typeof rawValue === 'boolean') {
                booleanValue = rawValue;
            } else if (typeof rawValue === 'string') {
                // CRITICAL FIX: Default behavior for 'true'/'false' strings seems broken
                // Explicit check for string value 'false' to convert to boolean false
                if (String(rawValue).toLowerCase() === 'false') {
                    booleanValue = false;
                } else {
                    const lowerValue = String(rawValue).toLowerCase();
                    booleanValue = lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
                }
            } else if (rawValue === 1 || rawValue === 0) {
                booleanValue = rawValue === 1;
            } else {
                booleanValue = false;
            }

            // Set the normalized boolean value
            updateProductDto.is_featured = booleanValue;
        }

        const product = await this.findOne(id);

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Process base64 image uploads if any
        let processedFiles = [...files];
        if (updateProductDto.image_uploads && updateProductDto.image_uploads.length > 0) {
            console.log(`Processing ${updateProductDto.image_uploads.length} base64 encoded images for update`);

            // Process each base64 image
            const processedBase64Files = await this.processBase64Images(updateProductDto.image_uploads);
            processedFiles = [...processedFiles, ...processedBase64Files];

            // Remove the image_uploads from DTO as we've processed them
            delete updateProductDto.image_uploads;
        }

        const { category_ids, ...productData } = updateProductDto;

        // Now update the product with all data
        if (Object.keys(productData).length > 0) {
            // FINAL SAFETY CHECK: Force is_featured to be a strict boolean value if present
            if ('is_featured' in productData) {
                // We use double negation to force conversion to boolean
                const strictBoolean = productData.is_featured === true;
                // Check if there's any issue with the type
                if (typeof productData.is_featured !== 'boolean' || productData.is_featured !== strictBoolean) {
                    productData.is_featured = strictBoolean;
                }
            }

            await this.productsRepository.update(id, productData);
        }

        // Handle product images
        // Only update images if files were explicitly provided or files empty array was explicitly provided
        // This allows for keeping existing images when no files are provided
        if (processedFiles.length > 0) {
            // Remove old images
            await this.productImagesRepository.delete({ product: { product_id: id } });

            // Create new images
            const productImages = processedFiles.map((file, index) => {
                return this.productImagesRepository.create({
                    image_url: `/uploads/products/${file.filename}`,
                    alt_text: updateProductDto.name || product.name,
                    is_primary: index === 0,
                    product: { product_id: id }
                });
            });
            await this.productImagesRepository.save(productImages);
        } else if (files && files.length === 0 && !updateProductDto.image_uploads) {
            // If an empty array was explicitly provided (files is an empty array, not undefined),
            // and no base64 images were provided, remove all images
            await this.productImagesRepository.delete({ product: { product_id: id } });
        }

        // Handle product categories
        if (category_ids) {
            // Remove old category relationships
            await this.productCategoriesRepository.delete({ product: { product_id: id } });

            // Create new category relationships
            if (category_ids.length > 0) {
                const categories = await this.categoriesRepository.find({
                    where: { category_id: In(category_ids) }
                });

                const productCategories = categories.map(category => {
                    return this.productCategoriesRepository.create({
                        product: { product_id: id },
                        category
                    });
                });

                await this.productCategoriesRepository.save(productCategories);
            }
        }

        // Fetch and log the updated product to verify changes
        const updatedProduct = await this.findOne(id);
        console.log('Product after update:', {
            id,
            is_featured: updatedProduct.is_featured,
            is_featured_type: typeof updatedProduct.is_featured,
            name: updatedProduct.name
        });

        return updatedProduct;
    }

    async remove(id: number) {
        const product = await this.findOne(id);

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Use soft delete to keep historical data
        return this.productsRepository.softDelete(id);
    }
} 