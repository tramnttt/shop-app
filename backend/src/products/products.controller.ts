import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, DefaultValuePipe, BadRequestException } from '@nestjs/common';
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
    async create(
        @Body() createProductDto: CreateProductDto
    ) {
        // Handle JSON data from FormData
        let productData = createProductDto;
        console.log('*** CONTROLLER CREATE REQUEST ***');

        // Log the entire raw request body for debugging
        console.log('FULL REQUEST BODY:', JSON.stringify(createProductDto, null, 2));

        if (createProductDto.data) {
            try {
                // Parse the JSON data from FormData
                const parsedData = JSON.parse(createProductDto.data);
                console.log('Parsed data from FormData:', parsedData);

                // Merge the parsed data into our DTO
                productData = { ...parsedData };
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                throw new BadRequestException('Invalid product data format');
            }
        }

        // Enhanced debugging for price field
        console.log('📌 PRODUCT CREATE - PRICE DEBUG 📌');
        console.log('Raw base_price:', {
            value: productData.base_price,
            type: typeof productData.base_price,
            asNumber: Number(productData.base_price),
            isNaN: isNaN(Number(productData.base_price)),
            asString: String(productData.base_price),
            valueOf: productData.base_price?.valueOf(),
            typeofValueOf: productData.base_price?.valueOf ? typeof productData.base_price.valueOf() : 'N/A',
            isLessThanOne: productData.base_price < 1 ? true : false
        });

        // Debug: Log the raw request body
        console.log('*** CONTROLLER CREATE REQUEST ***');
        console.log('Request Content-Type:', 'application/json');
        console.log('Raw is_featured value:', productData.is_featured);
        console.log('Raw is_featured type:', typeof productData.is_featured);
        console.log('is_featured in body:', 'is_featured' in productData);

        // Detailed DTO inspection
        const dtoProperties = Object.keys(productData);
        console.log('DTO properties:', dtoProperties);

        try {
            const result = await this.productsService.create(productData, []);
            console.log('*** CONTROLLER CREATE RESPONSE ***');
            console.log('Response is_featured:', result.is_featured);
            console.log('Response is_featured type:', typeof result.is_featured);
            console.log('Response base_price:', result.base_price);
            console.log('Response base_price type:', typeof result.base_price);
            return result;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto
    ) {
        // Handle JSON data from FormData
        let productData = updateProductDto;
        if (updateProductDto.data) {
            try {
                // Parse the JSON data from FormData
                const parsedData = JSON.parse(updateProductDto.data);
                console.log('Parsed data from FormData:', parsedData);

                // Merge the parsed data into our DTO
                productData = { ...parsedData };
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                throw new BadRequestException('Invalid product data format');
            }
        }

        // Debug: Log the raw request body
        console.log('*** CONTROLLER UPDATE REQUEST ***');
        console.log('Request ID:', id);
        console.log('Request Content-Type:', 'application/json');
        console.log('Raw is_featured value:', productData.is_featured);
        console.log('Raw is_featured type:', typeof productData.is_featured);
        console.log('is_featured in body:', 'is_featured' in productData);

        // Detailed DTO inspection
        const dtoProperties = Object.keys(productData);
        console.log('DTO properties:', dtoProperties);

        // Debug: Log key values
        console.log('Update product DTO values:', {
            name: productData.name,
            price: productData.base_price,
            is_featured: productData.is_featured,
            is_featured_type: typeof productData.is_featured
        });

        try {
            const result = await this.productsService.update(id, productData, []);
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