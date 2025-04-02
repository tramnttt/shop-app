import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createReviewDto: CreateReviewDto): Promise<Review> {
        const { product_id } = createReviewDto;

        // Verify the product exists
        const product = await this.productRepository.findOne({ where: { product_id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${product_id} not found`);
        }

        // Check if this is an anonymous review (no customer_id)
        if (!createReviewDto.customer_id) {
            // For anonymous reviews, guest_name and guest_email are required
            if (!createReviewDto.guest_name || !createReviewDto.guest_email) {
                throw new BadRequestException(
                    'Guest name and email are required for anonymous reviews'
                );
            }
        }

        const review = this.reviewRepository.create(createReviewDto);
        return this.reviewRepository.save(review);
    }

    async findAll(): Promise<Review[]> {
        return this.reviewRepository.find({
            relations: ['product'],
            order: { created_at: 'DESC' },
        });
    }

    async findByProductId(product_id: number): Promise<Review[]> {
        return this.reviewRepository.find({
            where: { product_id },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(review_id: number): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { review_id },
            relations: ['product']
        });

        if (!review) {
            throw new NotFoundException(`Review with ID ${review_id} not found`);
        }

        return review;
    }

    async remove(review_id: number): Promise<void> {
        const result = await this.reviewRepository.softDelete(review_id);
        if (result.affected === 0) {
            throw new NotFoundException(`Review with ID ${review_id} not found`);
        }
    }
} 