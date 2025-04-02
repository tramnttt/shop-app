import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from '../entities/review.entity';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
        return this.reviewsService.create(createReviewDto);
    }

    @Get()
    findAll(): Promise<Review[]> {
        return this.reviewsService.findAll();
    }

    @Get('product/:productId')
    findByProductId(@Param('productId') productId: string): Promise<Review[]> {
        return this.reviewsService.findByProductId(+productId);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Review> {
        return this.reviewsService.findOne(+id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string): Promise<void> {
        return this.reviewsService.remove(+id);
    }
} 