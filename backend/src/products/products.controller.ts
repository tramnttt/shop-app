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

        try {
            return await this.productsService.create(createProductDto, files || []);
        } catch (error) {
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

        try {
            return await this.productsService.update(id, updateProductDto, files || []);
        } catch (error) {
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