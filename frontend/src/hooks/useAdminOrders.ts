import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { getAuthToken } from '../utils/auth';

// Define types
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export type OrderItemType = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
};

export type OrderType = {
    id: number;
    userId: number;
    orderNumber: string;
    status: OrderStatus;
    items: OrderItemType[];
    total: number;
    orderDetails: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        notes?: string;
    };
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    createdAt: string;
    updatedAt: string;
};

export type OrdersFilterType = {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    customerId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    limit: number;
    sortField: string;
    sortOrder: 'ASC' | 'DESC';
};

export type MetadataType = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type OrdersResponseType = {
    items: OrderType[];
    meta: MetadataType;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAdminOrders = () => {
    const [filters, setFilters] = useState<OrdersFilterType>({
        page: 1,
        limit: 10,
        sortField: 'createdAt',
        sortOrder: 'DESC',
    });

    const queryClient = useQueryClient();

    // Fetch orders with filters
    const { data, isLoading, error, refetch } = useQuery<OrdersResponseType>(
        ['adminOrders', filters],
        async () => {
            const token = getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const params = new URLSearchParams();

            // Add filters to params
            if (filters.status) params.append('status', filters.status);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.customerId) params.append('customerId', filters.customerId.toString());
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
            params.append('page', filters.page.toString());
            params.append('limit', filters.limit.toString());
            params.append('sortField', filters.sortField);
            params.append('sortOrder', filters.sortOrder);

            console.log('Fetching orders with params:', params.toString());

            const response = await axios.get(`${API_URL}/orders/admin?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Orders response:', response.data);
            return response.data;
        },
        {
            keepPreviousData: true,
            retry: 1,
            staleTime: 30000, // 30 seconds
        }
    );

    // Fetch a single order
    const getOrder = async (orderId: number) => {
        const token = getAuthToken();
        if (!token) throw new Error('Not authenticated');

        const response = await axios.get(`${API_URL}/orders/admin/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    };

    // Update order status
    const updateOrderStatus = useMutation(
        async ({ orderId, status }: { orderId: number; status: OrderStatus }) => {
            const token = getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await axios.patch(
                `${API_URL}/orders/admin/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['adminOrders']);
            },
        }
    );

    // Update payment status
    const updatePaymentStatus = useMutation(
        async ({ orderId, paymentStatus }: { orderId: number; paymentStatus: PaymentStatus }) => {
            const token = getAuthToken();
            if (!token) throw new Error('Not authenticated');

            const response = await axios.patch(
                `${API_URL}/orders/admin/${orderId}/payment`,
                { paymentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return response.data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['adminOrders']);
            },
        }
    );

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleLimitChange = (limit: number) => {
        setFilters((prev) => ({ ...prev, limit, page: 1 }));
    };

    // Filter handlers
    const handleFilterChange = (newFilters: Partial<OrdersFilterType>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            sortField: 'createdAt',
            sortOrder: 'DESC',
        });
    };

    return {
        orders: data?.items || [],
        metadata: data?.meta,
        isLoading,
        error,
        refetch,
        filters,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        clearFilters,
        getOrder,
        updateOrderStatus,
        updatePaymentStatus,
    };
}; 