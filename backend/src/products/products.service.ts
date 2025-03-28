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

    async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
        const { category_ids, ...productData } = createProductDto;

        // Create and save the product
        const product = this.productsRepository.create(productData);
        const savedProduct = await this.productsRepository.save(product);

        // Handle product images
        if (files && files.length > 0) {
            const productImages = files.map((file, index) => {
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

    async update(id: number, updateProductDto: UpdateProductDto, files: Express.Multer.File[]) {
        const product = await this.findOne(id);

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const { category_ids, ...productData } = updateProductDto;

        // Update product data
        if (Object.keys(productData).length > 0) {
            await this.productsRepository.update(id, productData);
        }

        // Handle product images
        // Only update images if files were explicitly provided or files empty array was explicitly provided
        // This allows for keeping existing images when no files are provided
        if (files && files.length > 0) {
            // Remove old images
            await this.productImagesRepository.delete({ product: { product_id: id } });

            // Create new images
            const productImages = files.map((file, index) => {
                return this.productImagesRepository.create({
                    image_url: `/uploads/products/${file.filename}`,
                    alt_text: updateProductDto.name || product.name,
                    is_primary: index === 0,
                    product: { product_id: id }
                });
            });
            await this.productImagesRepository.save(productImages);
        } else if (files && files.length === 0) {
            // If an empty array was explicitly provided (files is an empty array, not undefined),
            // remove all images
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

        return this.findOne(id);
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