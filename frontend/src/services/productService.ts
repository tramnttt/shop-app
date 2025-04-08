import { axiosInstance } from '../config/axios';

export interface ProductImage {
    image_id?: number;
    image_url: string;
    alt_text?: string;
    is_primary?: boolean;
}

export interface Product {
    product_id: number;
    name: string;
    description: string;
    sku: string;
    base_price: number;
    sale_price?: number | null;
    stock_quantity: number;
    is_featured: boolean;
    metal_type?: string | null;
    gemstone_type?: string | null;
    weight?: number | null;
    dimensions?: string | null;
    images: ProductImage[];
    categories: Array<{
        category_id: number;
        name: string;
    }>;
    created_at: string;
    updated_at: string;
}

export interface CreateProductDto {
    name: string;
    description: string;
    sku: string;
    base_price: number;
    sale_price?: number | null;
    stock_quantity: number;
    is_featured?: boolean;
    category_ids: number[];
    images?: Array<File | ProductImage>;
    // For sending images as base64 strings
    image_uploads?: Array<{
        filename: string;
        mimetype: string;
        base64: string;
        size: number;
    }>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

const handleError = (error: any) => {
    // Just throw the error without logging
    throw error;
};

export const productService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: number;
        featured?: boolean | number;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{ products: Product[]; totalCount: number; currentPage: number; totalPages: number }> => {
        try {
            console.log('ProductService.getAll called with params:', params);
            const response = await axiosInstance.get('/products', { params });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    getById: async (id: number): Promise<Product> => {
        try {
            const response = await axiosInstance.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    create: async (data: CreateProductDto | FormData): Promise<Product> => {
        try {
            // Always use JSON format when possible
            console.log('Creating product with data:', data);

            let response;

            // Only use FormData when there are actually file uploads
            if (data instanceof FormData) {
                console.log('Using FormData for product creation (with file uploads)');

                response = await axiosInstance.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Use JSON format
                console.log('Using JSON for product creation');

                // Ensure boolean values are properly typed
                if ('is_featured' in data) {
                    data.is_featured = data.is_featured === true;
                }

                response = await axiosInstance.post('/products', data);
            }

            console.log('Create product response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in productService.create:', error);
            return handleError(error);
        }
    },

    update: async (id: number, data: UpdateProductDto | FormData): Promise<Product> => {
        try {
            // Always use JSON format when possible
            console.log('Updating product with data:', data);

            let response;

            // Only use FormData when there are actually file uploads
            if (data instanceof FormData) {
                console.log('Using FormData for product update (with file uploads)');

                response = await axiosInstance.patch(`/products/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Use JSON format
                console.log('Using JSON for product update');

                // Ensure boolean values are properly typed
                if ('is_featured' in data) {
                    data.is_featured = data.is_featured === true;
                }

                response = await axiosInstance.patch(`/products/${id}`, data);
            }

            console.log('Update product response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in productService.update:', error);
            return handleError(error);
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/products/${id}`);
        } catch (error) {
            handleError(error);
        }
    }
}; 