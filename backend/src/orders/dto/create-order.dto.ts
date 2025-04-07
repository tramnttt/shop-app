import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsArray, ValidateNested, IsString, IsOptional, IsDate, IsIn } from 'class-validator';
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

export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export interface QRCodeData {
    orderId: number;
    qrCode: string;
    amount: number;
    expiresAt: string; // ISO date string
    paymentUrl?: string; // Optional direct payment URL for mobile/web
    partnerRefId?: string; // Reference ID for MoMo payment tracking
}

export class UpdateOrderStatusDto {
    @ApiProperty({ description: 'Order status', enum: OrderStatus })
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status: OrderStatus;
}

export class UpdatePaymentStatusDto {
    @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
    @IsEnum(PaymentStatus)
    @IsNotEmpty()
    paymentStatus: PaymentStatus;
}

export class GetOrdersFilterDto {
    @ApiProperty({ description: 'Filter by status', enum: OrderStatus, required: false })
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;

    @ApiProperty({ description: 'Filter by payment status', enum: PaymentStatus, required: false })
    @IsEnum(PaymentStatus)
    @IsOptional()
    paymentStatus?: PaymentStatus;

    @ApiProperty({ description: 'Filter by customer ID', required: false })
    @IsNumber()
    @IsOptional()
    customerId?: number;

    @ApiProperty({ description: 'Filter by date from', required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dateFrom?: Date;

    @ApiProperty({ description: 'Filter by date to', required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dateTo?: Date;

    @ApiProperty({ description: 'Page number', default: 1, required: false })
    @IsNumber()
    @IsOptional()
    page?: number = 1;

    @ApiProperty({ description: 'Items per page', default: 10, required: false })
    @IsNumber()
    @IsOptional()
    limit?: number = 10;

    @ApiProperty({ description: 'Sort field', required: false, enum: ['createdAt', 'updatedAt', 'total'] })
    @IsString()
    @IsOptional()
    @IsIn(['createdAt', 'updatedAt', 'total'])
    sortField?: string = 'createdAt';

    @ApiProperty({ description: 'Sort order', required: false, enum: ['ASC', 'DESC'] })
    @IsString()
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
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