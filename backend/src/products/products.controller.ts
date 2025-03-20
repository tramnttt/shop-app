import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // Public routes
    @Get()
    async findAll(
        @Query('categoryId') categoryId?: number,
        @Query('featured') featured?: boolean,
        @Query('search') search?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number
    ) {
        return this.productsService.findAll({
            categoryId,
            featured,
            search,
            minPrice,
            maxPrice
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(+id);
    }

    // Admin routes
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(+id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async remove(@Param('id') id: string) {
        await this.productsService.remove(+id);
        return { message: 'Product deleted successfully' };
    }
} 