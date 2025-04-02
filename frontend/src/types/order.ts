import { BasketItem } from './basket';

export interface OrderDetails {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
}

export interface Order {
    id?: number;
    userId?: number;
    orderNumber?: string;
    status: OrderStatus;
    items: BasketItem[];
    total: number;
    orderDetails: OrderDetails;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    createdAt?: string;
    updatedAt?: string;
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    VIETQR = 'vietqr',
    MOMO = 'momo',
    COD = 'cod'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed'
}

export interface VietQRConfig {
    bankId: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
}

export interface QRCodeData {
    qrCodeUrl: string;
    expiresAt: string;
    orderId: number;
    amount: number;
}
