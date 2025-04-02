import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsNumber()
    @IsNotEmpty()
    product_id: number;

    @IsOptional()
    @IsNumber()
    customer_id?: number;

    @IsString()
    @IsOptional()
    guest_name?: string;

    @IsEmail()
    @IsOptional()
    guest_email?: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsOptional()
    comment?: string;
} 