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

export interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
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
    user?: UserInfo;
}

// Alias for Order type when used for creating a new order
export type OrderData = Order;

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export enum PaymentMethod {
    VIETQR = 'VIETQR',
    MOMO = 'MOMO',
    COD = 'COD'
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
    orderId: number;
    qrCode: string;
    amount: number;
    expiresAt: string;
    paymentUrl?: string;
    partnerRefId?: string;
}
