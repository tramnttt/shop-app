import { api } from '../utils/api';
import { Basket } from '../types/basket';
import { Order, OrderDetails, PaymentMethod, QRCodeData, PaymentStatus } from '../types/order';

// VietQR API configuration - normally this would be server-side for security
const VIETQR_BANK_ID = 'VIETCOMBANK'; // Replace with your bank's code
const VIETQR_ACCOUNT_NUMBER = '1234567890'; // Replace with your account number
const VIETQR_ACCOUNT_NAME = 'Jewelry Shop'; // Replace with your account name

// Error handling
const handleError = (error: any) => {
    console.error('Order API Error:', error.response?.data || error.message);
    throw error;
};

class OrderService {
    // Create a new order
    async createOrder(
        basket: Basket,
        orderDetails: OrderDetails,
        paymentMethod: PaymentMethod
    ): Promise<Order> {
        const response = await api.post('/orders', {
            items: basket.items,
            total: basket.total,
            orderDetails,
            paymentMethod
        });
        return response.data;
    }

    // Get order by ID
    async getOrderById(orderId: number): Promise<Order> {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    }

    // Generate VietQR code for payment
    async generateVietQR(order: Order): Promise<QRCodeData> {
        const response = await api.post(`/payments/vietqr/generate`, {
            orderId: order.id,
            amount: order.total,
        });
        return response.data;
    }

    // Check payment status
    async checkPaymentStatus(orderId: number): Promise<{ status: PaymentStatus }> {
        const response = await api.get(`/payments/status/${orderId}`);
        return response.data;
    }

    // Get user orders
    async getUserOrders(): Promise<Order[]> {
        const response = await api.get('/orders/user');
        return response.data;
    }

    // Cancel order
    async cancelOrder(orderId: number): Promise<Order> {
        const response = await api.post(`/orders/${orderId}/cancel`);
        return response.data;
    }

    // Generate MoMo QR code for payment
    async generateMoMoQR(orderId: number): Promise<QRCodeData> {
        const response = await api.post(`/payments/momo/generate`, {
            orderId: orderId
        });
        return response.data;
    }
}

export const orderService = new OrderService(); 