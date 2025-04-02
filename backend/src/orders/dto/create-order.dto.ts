import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
    COD = 'COD',
    VIETQR = 'VIETQR',
    MOMO = 'MOMO',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

export interface QRCodeData {
    orderId: number;
    qrCode: string;
    amount: number;
    expiresAt: string; // ISO date string
}

export class OrderItemDto {
    @ApiProperty({ description: 'Product ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ description: 'Product name', example: 'Silver Ring' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Product price', example: 99.99 })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ description: 'Quantity', example: 2 })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @ApiProperty({ description: 'Product image URL', example: 'http://example.com/image.jpg', required: false })
    @IsString()
    @IsOptional()
    image_url?: string;
}

export class OrderDetailsDto {
    @ApiProperty({ description: 'Customer full name', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ description: 'Customer email', example: 'john@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Customer phone', example: '+12345678901' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ description: 'Shipping address', example: '123 Main St' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ description: 'City', example: 'New York' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ description: 'Postal code', example: '10001' })
    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty({ description: 'Additional notes', example: 'Please leave at the door', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UserDto {
    @ApiProperty({ description: 'User first name', example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ description: 'User last name', example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ description: 'User email', example: 'john@example.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'User phone', example: '+12345678901' })
    @IsString()
    @IsNotEmpty()
    phone: string;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({ description: 'Total order amount', example: 199.98 })
    @IsNumber()
    @IsNotEmpty()
    total: number;

    @ApiProperty({ description: 'Order details', type: OrderDetailsDto })
    @IsObject()
    @ValidateNested()
    @Type(() => OrderDetailsDto)
    orderDetails: OrderDetailsDto;

    @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.COD })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @ApiProperty({ description: 'User information', type: UserDto, required: false })
    @IsObject()
    @ValidateNested()
    @Type(() => UserDto)
    @IsOptional()
    user?: UserDto;
} 