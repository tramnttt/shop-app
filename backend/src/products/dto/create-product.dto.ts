import { IsNotEmpty, IsNumber, IsOptional, IsArray, Min, IsBoolean, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty({ message: 'Product name is required' })
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name: string;

    @IsNotEmpty({ message: 'Description is required' })
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    description: string;

    @IsNumber()
    @Min(0, { message: 'Base price must be greater than or equal to 0' })
    @Transform(({ value }) => {
        if (value === '') return 0;
        if (value === null || value === undefined) return 0;
        return typeof value === 'string' ? parseFloat(value) : value;
    })
    base_price: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Sale price must be greater than or equal to 0' })
    @Transform(({ value }) => {
        if (value === '') return null;
        if (value === null || value === undefined) return null;
        return typeof value === 'string' ? parseFloat(value) : value;
    })
    sale_price?: number;

    @IsNotEmpty({ message: 'SKU is required' })
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    sku: string;

    @IsNumber()
    @Min(0, { message: 'Stock quantity must be greater than or equal to 0' })
    @Transform(({ value }) => {
        if (value === '') return 0;
        if (value === null || value === undefined) return 0;
        return typeof value === 'string' ? parseInt(value) : value;
    })
    stock_quantity: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return false;
    })
    is_featured?: boolean;

    @IsOptional()
    @IsString()
    metal_type?: string;

    @IsOptional()
    @IsString()
    gemstone_type?: string;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Weight must be greater than or equal to 0' })
    @Transform(({ value }) => {
        if (value === '') return null;
        if (value === null || value === undefined) return null;
        return typeof value === 'string' ? parseFloat(value) : value;
    })
    weight?: number;

    @IsOptional()
    @IsString()
    dimensions?: string;

    @IsArray()
    @IsOptional()
    @Transform(({ value }) => {
        // Handle empty or missing arrays
        if (!value) return [];

        // If it's already an array, return it
        if (Array.isArray(value)) return value.map(v => Number(v));

        // Handle stringified arrays
        if (typeof value === 'string') {
            if (value === '[]') return [];
            if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    return JSON.parse(value).map(v => Number(v));
                } catch (e) {
                    // If JSON parsing fails, continue with other methods
                }
            }

            // Handle comma-separated values
            if (value.includes(',')) {
                return value.split(',').map(v => Number(v.trim()));
            }

            // Handle single value
            return [Number(value)];
        }

        return [];
    })
    category_ids?: number[];

    @IsArray()
    @IsOptional()
    images?: {
        image_url: string;
        alt_text?: string;
        is_primary?: boolean;
    }[];
} 