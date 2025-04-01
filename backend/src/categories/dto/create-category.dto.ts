import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    @IsNumber()
    parent_category_id?: number;

    @IsOptional()
    @IsString()
    image_url?: string;
} 