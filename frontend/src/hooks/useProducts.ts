import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, Product, CreateProductDto, UpdateProductDto } from '../services/productService';

export const useProducts = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const result = await productService.getAll(params);
            return result;
        },
        staleTime: 10000, // 10 seconds - shorter stale time for more frequent refetches
    });
};

export const useProduct = (id: number) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id),
        enabled: !!id,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductDto | FormData) => productService.create(data),
        onSuccess: () => {
            // Invalidate all products queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductDto | FormData }) =>
            productService.update(id, data),
        onSuccess: (updatedProduct) => {
            // Force immediate refetch of all product data
            queryClient.removeQueries({ queryKey: ['products'] }); // Remove cached data first
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Then invalidate to refetch

            // Also invalidate specific product
            if (updatedProduct && updatedProduct.product_id) {
                queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.product_id] });
            }
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productService.delete(id),
        onSuccess: (_, deletedId) => {
            // Force immediate refetch
            queryClient.removeQueries({ queryKey: ['products'] }); // Remove cached data first
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Then invalidate to refetch
        },
    });
}; 