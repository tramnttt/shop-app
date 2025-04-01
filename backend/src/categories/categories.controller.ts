import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    // Public routes
    @Get()
    async findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(+id);
    }

    // Admin routes
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/categories',
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
        }),
    )
    async create(
        @Body() createCategoryDto: CreateCategoryDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
                ],
            }),
        )
        file?: Express.Multer.File,
    ) {
        if (file) {
            createCategoryDto.image_url = `/uploads/categories/${file.filename}`;
        }
        return this.categoriesService.create(createCategoryDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/categories',
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
        }),
    )
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
                ],
            }),
        )
        file?: Express.Multer.File,
    ) {
        if (file) {
            updateCategoryDto.image_url = `/uploads/categories/${file.filename}`;
        }
        return this.categoriesService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async remove(@Param('id') id: string) {
        await this.categoriesService.remove(+id);
        return { message: 'Category deleted successfully' };
    }
} 