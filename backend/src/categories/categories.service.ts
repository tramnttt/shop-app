import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async findAll() {
        const categories = await this.categoriesRepository.find({
            order: { created_at: 'DESC' }
        });

        return categories.map(category => this.transformCategoryResponse(category));
    }

    async findOne(id: number) {
        const category = await this.categoriesRepository.findOne({
            where: { category_id: id },
            relations: ['parent_category']
        });

        if (!category) {
            return null;
        }

        return this.transformCategoryResponse(category);
    }

    async create(createCategoryDto: CreateCategoryDto) {
        const category = this.categoriesRepository.create({
            name: createCategoryDto.name,
            description: createCategoryDto.description,
            parent_category_id: createCategoryDto.parent_category_id
        });

        const savedCategory = await this.categoriesRepository.save(category);
        return this.transformCategoryResponse(savedCategory);
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        await this.categoriesRepository.update(
            { category_id: id },
            {
                name: updateCategoryDto.name,
                description: updateCategoryDto.description,
                parent_category_id: updateCategoryDto.parent_category_id
            }
        );

        const updatedCategory = await this.findOne(id);
        return updatedCategory;
    }

    async remove(id: number) {
        const category = await this.categoriesRepository.findOne({
            where: { category_id: id }
        });

        if (!category) {
            return null;
        }

        return this.categoriesRepository.softRemove(category);
    }

    // Transform database entity to API response format
    private transformCategoryResponse(category: Category) {
        return {
            id: category.category_id,
            name: category.name,
            description: category.description,
            parent_id: category.parent_category_id,
            created_at: category.created_at,
            updated_at: category.updated_at
        };
    }
} 