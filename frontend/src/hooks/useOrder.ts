import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Order, OrderDetails, PaymentMethod, PaymentStatus, OrderStatus, QRCodeData } from '../types/order';
import { useBasket } from './useBasket';
import { useState } from 'react';

export const useOrder = () => {
    const { basket, clearBasket } = useBasket();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'completed' | 'error'>('form');

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: (data: { orderDetails: OrderDetails; paymentMethod: PaymentMethod }) => {
            return orderService.createOrder(
                basket,
                data.orderDetails,
                data.paymentMethod
            );
        },
        onSuccess: (order) => {
            // Invalidate orders query if it exists
            queryClient.invalidateQueries({ queryKey: ['orders'] });

            if (order.paymentMethod === PaymentMethod.VIETQR) {
                setPaymentStep('processing');
                // Navigate to payment page with order ID
                navigate(`/payment/vietqr/${order.id}`);
            } else if (order.paymentMethod === PaymentMethod.MOMO) {
                setPaymentStep('processing');
                navigate(`/payment/momo/${order.id}`);
            } else {
                // For COD, we can just clear the basket and show success
                console.log('COD payment selected, clearing basket immediately');
                try {
                    // Try to directly clear from sessionStorage
                    sessionStorage.removeItem('shop_basket');
                    console.log("Directly cleared basket from sessionStorage");
                } catch (error) {
                    console.error("Error directly clearing sessionStorage:", error);
                }

                clearBasket();
                setPaymentStep('completed');
                navigate('/orders/success', { state: { order } });
            }
        },
        onError: () => {
            setPaymentStep('error');
        }
    });

    // Get VietQR data for payment
    const getVietQRMutation = useMutation({
        mutationFn: (order: Order) => orderService.generateVietQR(order),
        onSuccess: (data) => {
            // Store QR code data in query cache for easy access
            queryClient.setQueryData(['payment', 'vietqr', data.orderId], data);
        }
    });

    // Get MoMo QR data for payment
    const getMoMoQR = useMutation<QRCodeData, Error, number>({
        mutationFn: (orderId: number) => orderService.generateMoMoQR(orderId),
        onSuccess: (data) => {
            // Store QR code data in query cache for easy access
            queryClient.setQueryData(['payment', 'momo', data.orderId], data);
        }
    });

    // Check payment status
    const checkPaymentStatus = useMutation({
        mutationFn: (orderId: number) => orderService.checkPaymentStatus(orderId),
        onSuccess: (data, orderId) => {
            if (data.status === PaymentStatus.PAID) {
                console.log('Payment status is PAID, clearing basket');
                try {
                    // Try to directly clear from sessionStorage
                    sessionStorage.removeItem('shop_basket');
                    console.log("Directly cleared basket from sessionStorage");
                } catch (error) {
                    console.error("Error directly clearing sessionStorage:", error);
                }

                clearBasket();
                setPaymentStep('completed');
                navigate('/orders/success', {
                    state: {
                        orderId,
                        paymentStatus: PaymentStatus.PAID
                    }
                });
            }
        }
    });

    return {
        basket,
        createOrderMutation,
        getVietQRMutation,
        getMoMoQR,
        checkPaymentStatus,
        paymentStep,
        setPaymentStep
    };
};

// Separate hook for getting order by ID
export const useGetOrder = (orderId: number | null) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: () => {
            if (!orderId) throw new Error('Order ID is required');
            return orderService.getOrderById(orderId);
        },
        enabled: !!orderId,
    });
}; 