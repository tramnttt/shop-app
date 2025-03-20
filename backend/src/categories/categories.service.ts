import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async findAll() {
        return this.categoriesRepository.find();
    }

    async findOne(id: number) {
        return this.categoriesRepository.findOne({
            where: { category_id: id },
            relations: ['parent_category']
        });
    }

    async create(createCategoryDto: any) {
        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    async update(id: number, updateCategoryDto: any) {
        await this.categoriesRepository.update(id, updateCategoryDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const category = await this.findOne(id);
        return this.categoriesRepository.softRemove(category);
    }
} 