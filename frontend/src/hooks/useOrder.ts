import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Order, OrderDetails, PaymentMethod, PaymentStatus, OrderStatus, QRCodeData } from '../types/order';
import { useBasket } from './useBasket';
import { useState } from 'react';

export interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export const useOrder = () => {
    const { basket, clearBasket } = useBasket();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'completed' | 'error'>('form');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderData, setSuccessOrderData] = useState<Order | null>(null);

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: (data: { orderDetails: OrderDetails; paymentMethod: PaymentMethod; user?: UserInfo }) => {
            // Log the user data for debugging
            console.log('Creating order with user data:', data.user);

            // Ensure we're sending the user data to the API
            return orderService.createOrder(
                basket,
                data.orderDetails,
                data.paymentMethod,
                data.user
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
                // For COD, show success modal instead of navigating
                console.log('COD payment selected, showing success modal');

                // Set the success data and show modal
                setSuccessOrderData(order);
                setShowSuccessModal(true);
                setPaymentStep('completed');

                // Clear basket but avoid triggering navigation
                try {
                    // Try to directly clear from sessionStorage
                    sessionStorage.removeItem('shop_basket');
                } catch (error) {
                    console.error("Error directly clearing sessionStorage:", error);
                }

                // Clear the basket state
                clearBasket();

                console.log('Success modal should be visible now', { showSuccessModal: true, order });
            }
        },
        onError: () => {
            setPaymentStep('error');
        }
    });

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setSuccessOrderData(null);
    };

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

                // Get order data to show in success modal
                orderService.getOrderById(orderId)
                    .then(orderData => {
                        setSuccessOrderData(orderData);
                        setShowSuccessModal(true);
                    })
                    .catch(error => {
                        console.error("Error fetching order data:", error);
                        // Show basic success modal without detailed order data
                        setSuccessOrderData({ id: orderId } as Order);
                        setShowSuccessModal(true);
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
        setPaymentStep,
        showSuccessModal,
        successOrderData,
        closeSuccessModal,
        setSuccessOrderData,
        setShowSuccessModal
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