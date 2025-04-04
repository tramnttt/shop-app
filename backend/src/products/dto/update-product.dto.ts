import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
    @ApiProperty({ description: 'JSON string containing all product data when using FormData', required: false })
    data?: string;
} 