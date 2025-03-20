import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { Category } from '../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

        const [products, total] = await this.productsRepository.findAndCount({
            take,
            skip,
            order: { created_at: 'DESC' },
            relations: ['images']
        });

        return {
            products,
            totalCount: total,
            currentPage: query.page || 1,
            totalPages: Math.ceil(total / take)
        };
    }

    async findOne(id: number) {
        return this.productsRepository.findOne({
            where: { product_id: id },
            relations: ['images']
        });
    }

    async create(createProductDto: any) {
        const product = this.productsRepository.create(createProductDto);
        return this.productsRepository.save(product);
    }

    async update(id: number, updateProductDto: any) {
        await this.productsRepository.update(id, updateProductDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const product = await this.findOne(id);
        return this.productsRepository.softRemove(product);
    }
} 