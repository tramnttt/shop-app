import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, DefaultValuePipe, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { fileUploadConfig } from '../config/file-upload.config';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // Public routes
    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('categoryId', new DefaultValuePipe(null)) categoryId?: number,
        @Query('featured') featured?: string,
        @Query('search') search?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string
    ) {
        return this.productsService.findAll({
            page,
            limit,
            categoryId,
            featured: featured,
            search,
            minPrice: minPrice ? +minPrice : undefined,
            maxPrice: maxPrice ? +maxPrice : undefined
        });
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    // Admin routes
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(FilesInterceptor('images', 5, fileUploadConfig))
    async create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        if (files && files.length > 5) {
            throw new BadRequestException('Maximum 5 images allowed');
        }

        // Debug: Log the raw request body
        console.log('*** CONTROLLER CREATE REQUEST ***');
        console.log('Request Content-Type:', files?.length ? 'multipart/form-data' : 'application/json');
        console.log('Raw is_featured value:', createProductDto.is_featured);
        console.log('Raw is_featured type:', typeof createProductDto.is_featured);
        console.log('is_featured in body:', 'is_featured' in createProductDto);

        // Detailed DTO inspection
        const dtoProperties = Object.keys(createProductDto);
        console.log('DTO properties:', dtoProperties);

        try {
            const result = await this.productsService.create(createProductDto, files || []);
            console.log('*** CONTROLLER CREATE RESPONSE ***');
            console.log('Response is_featured:', result.is_featured);
            console.log('Response is_featured type:', typeof result.is_featured);
            return result;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(FilesInterceptor('images', 5, fileUploadConfig))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        if (files && files.length > 5) {
            throw new BadRequestException('Maximum 5 images allowed');
        }

        // Debug: Log the raw request body
        console.log('*** CONTROLLER UPDATE REQUEST ***');
        console.log('Request ID:', id);
        console.log('Request Content-Type:', files?.length ? 'multipart/form-data' : 'application/json');
        console.log('Raw is_featured value:', updateProductDto.is_featured);
        console.log('Raw is_featured type:', typeof updateProductDto.is_featured);
        console.log('is_featured in body:', 'is_featured' in updateProductDto);

        // Detailed DTO inspection
        const dtoProperties = Object.keys(updateProductDto);
        console.log('DTO properties:', dtoProperties);

        // Debug: Log key values
        console.log('Update product DTO values:', {
            name: updateProductDto.name,
            price: updateProductDto.base_price,
            is_featured: updateProductDto.is_featured,
            is_featured_type: typeof updateProductDto.is_featured
        });

        try {
            const result = await this.productsService.update(id, updateProductDto, files || []);
            console.log('*** CONTROLLER UPDATE RESPONSE ***');
            console.log('Response is_featured:', result.is_featured);
            console.log('Response is_featured type:', typeof result.is_featured);
            return result;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.productsService.remove(id);
        return { message: 'Product deleted successfully' };
    }
} 