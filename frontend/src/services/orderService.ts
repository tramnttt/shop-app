import { Order, OrderData, QRCodeData, PaymentStatus } from '../types/order';
import api from './api';
import { BasketItem } from '../types/basket';

// Order service for handling order-related API calls
export const orderService = {
    // Create a new order with basket items and order details
    createOrder: async (
        basketItems: BasketItem[] | any,
        orderDetails: any,
        paymentMethod: string,
        user?: any
    ): Promise<Order> => {
        // Ensure basketItems is an array
        const items = Array.isArray(basketItems) ? basketItems : [];

        // Calculate total safely using the validated array
        const total = items.reduce((sum, item) => {
            const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            return sum + (price * quantity);
        }, 0);

        const orderData = {
            items: items,
            total: total,
            orderDetails,
            paymentMethod,
            user
        };

        const response = await api.post('/api/orders', orderData);
        return response.data;
    },

    // Get order details by ID
    getOrderById: async (orderId: number): Promise<Order> => {
        const response = await api.get(`/api/orders/${orderId}`);
        return response.data;
    },

    // Get all orders for the current user
    getUserOrders: async (): Promise<Order[]> => {
        const response = await api.get('/api/orders/user');
        return response.data;
    },

    // Generate VietQR code for payment
    generateVietQR: async (order: Order): Promise<QRCodeData> => {
        const response = await api.post(`/api/payments/generate-vietqr/${order.id}`, { amount: order.total });
        return response.data;
    },

    // Generate MoMo QR code for payment
    generateMoMoQR: async (orderId: number): Promise<QRCodeData> => {
        const response = await api.post(`/api/payments/generate-momo/${orderId}`);
        return response.data;
    },

    // Check payment status for an order
    checkPaymentStatus: async (orderId: number): Promise<{ status: PaymentStatus }> => {
        const response = await api.get(`/api/payments/status/${orderId}`);
        return response.data;
    },

    // Confirm MoMo payment (can be used to manually complete a payment)
    confirmMoMoPayment: async (partnerRefId: string): Promise<any> => {
        const response = await api.post(`/api/payments/momo-confirm?partnerRefId=${partnerRefId}&requestType=capture`);
        return response.data;
    },

    // Cancel MoMo payment (can be used to revert a payment authorization)
    cancelMoMoPayment: async (partnerRefId: string): Promise<any> => {
        const response = await api.post(`/api/payments/momo-confirm?partnerRefId=${partnerRefId}&requestType=revertAuthorize`);
        return response.data;
    }
}; 