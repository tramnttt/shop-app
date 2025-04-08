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
    // Convert featured boolean to numeric 0/1 for MySQL tinyint compatibility
    const apiParams = params ? { ...params } : undefined;

    if (apiParams && 'featured' in apiParams) {
        // Convert boolean to numeric 1/0 for MySQL tinyint column
        // Use type assertion to avoid TypeScript errors
        (apiParams as any).featured = apiParams.featured === true ? 1 : 0;
        console.log('Featured parameter converted to:', (apiParams as any).featured);
    }

    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            console.log('Fetching products with params:', apiParams);
            const result = await productService.getAll(apiParams);
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
        mutationFn: ({ id, data }: { id: number; data: UpdateProductDto | FormData }) => {
            console.log('Update mutation started with data:', {
                id,
                isFormData: data instanceof FormData,
                hasIsFeatured: data instanceof FormData ?
                    data.has('is_featured') :
                    'is_featured' in data
            });

            if (data instanceof FormData) {
                // Log the form data contents
                console.log('FormData contents:');
                Array.from(data.entries()).forEach(([key, value]) => {
                    console.log(`${key}:`, typeof value === 'string' ? value : '[File]');
                });
            }

            return productService.update(id, data);
        },
        onSuccess: (updatedProduct) => {
            console.log('Product updated successfully:', updatedProduct);
            // Force immediate refetch of all product data
            queryClient.removeQueries({ queryKey: ['products'] }); // Remove cached data first
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Then invalidate to refetch

            // Also invalidate specific product
            if (updatedProduct && updatedProduct.product_id) {
                queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.product_id] });
            }
        },
        onError: (error) => {
            console.error('Error updating product:', error);
        }
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