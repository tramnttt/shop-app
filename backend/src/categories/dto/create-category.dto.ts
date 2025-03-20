import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    @IsNumber()
    parent_category_id?: number;
} 