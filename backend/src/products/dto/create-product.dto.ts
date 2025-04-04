import { IsNotEmpty, IsNumber, IsOptional, IsArray, Min, IsBoolean, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @IsOptional()
    @ApiProperty({ description: 'JSON string containing all product data when using FormData', required: false })
    data?: string;

    @IsNotEmpty({ message: 'Product name is required' })
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name: string;

    @IsNotEmpty({ message: 'Description is required' })
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    description: string;

    @IsNumber({
        allowNaN: false,
        allowInfinity: false
    }, { message: 'Base price must be a valid number' })
    @Min(0, { message: 'Base price must be greater than or equal to 0' })
    @Transform(({ value }) => {
        // Extra detailed logging to trace the issue
        console.log('BASE PRICE TRANSFORMER INPUT:', {
            value,
            type: typeof value,
            stringValue: String(value),
            isEmptyString: value === '',
            isNull: value === null,
            isUndefined: value === undefined
        });

        // Handle empty input (string, null, or undefined)
        if (value === '' || value === null || value === undefined) {
            console.log('Empty base_price value detected, returning 0');
            return 0;
        }

        // Convert string to number if needed
        const numValue = typeof value === 'number' ? value : Number(value);

        // Handle NaN cases
        if (isNaN(numValue)) {
            console.log('NaN detected for base_price, returning 0');
            return 0;
        }

        console.log('Base price final value:', numValue);
        return numValue;
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

    @ApiProperty({ description: 'Is this a featured product', required: false, default: false })
    @IsOptional()
    @IsBoolean({ message: 'is_featured must be a boolean value' })
    @Transform(({ value }) => {
        // Handle different forms of truthy/falsy values
        if (typeof value === 'boolean') {
            console.log('is_featured was already a boolean:', value);
            return value;
        }

        if (typeof value === 'string') {
            // CRITICAL FIX: Explicitly check for 'false' string value
            if (String(value).toLowerCase() === 'false') {
                console.log('String "false" explicitly converted to boolean false');
                return false;
            }

            const lowercaseValue = value.toLowerCase();
            const result = lowercaseValue === 'true' || lowercaseValue === '1' || lowercaseValue === 'yes';
            console.log(`is_featured string "${value}" transformed to boolean:`, result);
            return result;
        }

        if (typeof value === 'number') {
            const result = value === 1;
            console.log(`is_featured number ${value} transformed to boolean:`, result);
            return result;
        }

        console.log('is_featured had unexpected type, defaulting to false');
        return false;
    })
    is_featured: boolean;

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

    @IsArray()
    @IsOptional()
    @ApiProperty({
        description: 'Base64 encoded images for upload',
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                filename: { type: 'string' },
                mimetype: { type: 'string' },
                base64: { type: 'string' },
                size: { type: 'number' }
            }
        }
    })
    image_uploads?: Array<{
        filename: string;
        mimetype: string;
        base64: string;
        size: number;
    }>;
} 