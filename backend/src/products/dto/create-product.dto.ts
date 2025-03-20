import { IsNotEmpty, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    base_price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    sale_price?: number;

    @IsNotEmpty()
    sku: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock_quantity: number;

    @IsOptional()
    is_featured?: boolean;

    @IsOptional()
    metal_type?: string;

    @IsOptional()
    gemstone_type?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    weight?: number;

    @IsOptional()
    dimensions?: string;

    @IsArray()
    @IsOptional()
    category_ids?: number[];

    @IsArray()
    @IsOptional()
    images?: {
        image_url: string;
        alt_text?: string;
        is_primary?: boolean;
    }[];
} 