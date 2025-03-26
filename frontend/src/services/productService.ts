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
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

// Helper function to prepare FormData from CreateProductDto or UpdateProductDto
export const prepareProductFormData = (data: CreateProductDto | UpdateProductDto): FormData => {
    const formData = new FormData();

    // Add basic fields
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description || '');
    if (data.sku) formData.append('sku', data.sku);

    // Ensure numeric values are properly converted to strings
    if (data.base_price !== undefined) {
        formData.append('base_price', data.base_price.toString());
    }

    if (data.sale_price !== undefined && data.sale_price !== null) {
        formData.append('sale_price', data.sale_price.toString());
    }

    if (data.stock_quantity !== undefined) {
        formData.append('stock_quantity', data.stock_quantity.toString());
    }

    // Boolean values need explicit conversion to string
    if (data.is_featured !== undefined) {
        formData.append('is_featured', data.is_featured.toString());
    }

    // Handle category IDs array
    if (data.category_ids && data.category_ids.length > 0) {
        // Note: For NestJS to properly parse array values, we need to use the correct format
        data.category_ids.forEach(id => {
            formData.append('category_ids[]', id.toString());
        });
    }

    // Handle images - separate File objects from existing ProductImage references
    if (data.images && data.images.length > 0) {
        data.images.forEach(image => {
            if (image instanceof File) {
                formData.append('images', image);
            }
        });
    }

    return formData;
};

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
        featured?: boolean;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{ products: Product[]; totalCount: number; currentPage: number; totalPages: number }> => {
        try {
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
            const formData = data instanceof FormData ? data : prepareProductFormData(data);

            const response = await axiosInstance.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    update: async (id: number, data: UpdateProductDto | FormData): Promise<Product> => {
        try {
            const formData = data instanceof FormData ? data : prepareProductFormData(data);

            const response = await axiosInstance.patch(`/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
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