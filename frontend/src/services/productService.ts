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

    // CRITICAL: Boolean values need explicit conversion to string 'true' or 'false'
    if ('is_featured' in data) {
        const isFeatured = data.is_featured === true;
        const featuredValue = isFeatured ? 'true' : 'false';
        console.log('prepareProductFormData is_featured:', {
            original: data.is_featured,
            converted: featuredValue,
            booleanCheck: data.is_featured === true
        });
        formData.append('is_featured', featuredValue);
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
            // Handle both JSON and FormData
            let requestData: FormData | CreateProductDto;
            let contentType: string;

            // If FormData was passed, use it directly for file uploads
            if (data instanceof FormData) {
                console.log('Using FormData for product creation (with file uploads)');
                requestData = data;
                contentType = 'multipart/form-data';

                // Extra validation for is_featured in FormData
                if (data.has('is_featured')) {
                    const featuredValue = data.get('is_featured');
                    console.log('Creation FormData is_featured:', featuredValue);

                    // Ensure it's 'true' or 'false' string
                    if (featuredValue !== 'true' && featuredValue !== 'false') {
                        data.delete('is_featured');
                        data.append('is_featured', String(featuredValue) === 'true' ? 'true' : 'false');
                    }
                }
            }
            // If JSON data was passed, ensure proper types
            else {
                console.log('Using JSON for product creation (no file uploads)');
                requestData = {
                    ...data,
                    is_featured: data.is_featured === true
                };
                contentType = 'application/json';

                console.log('JSON creation data:', {
                    ...requestData,
                    is_featured: requestData.is_featured,
                    is_featured_type: typeof requestData.is_featured
                });
            }

            // Make the appropriate request based on content type
            let response;
            if (contentType === 'multipart/form-data') {
                response = await axiosInstance.post('/products', requestData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await axiosInstance.post('/products', requestData);
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
            let requestData: any;

            // If FormData was passed, extract and convert to a plain object
            if (data instanceof FormData) {
                console.log('Converting FormData to JSON object');
                requestData = {};

                // Extract all form fields to a plain object
                Array.from(data.entries()).forEach(([key, value]) => {
                    // Skip file uploads when using JSON
                    if (value instanceof File) {
                        console.log(`Skipping file upload for ${key} when using JSON`);
                        return;
                    }

                    // Handle arrays (like category_ids[])
                    if (key.endsWith('[]')) {
                        const baseKey = key.substring(0, key.length - 2);
                        if (!requestData[baseKey]) {
                            requestData[baseKey] = [];
                        }
                        requestData[baseKey].push(value);
                        return;
                    }

                    // Handle special fields with type conversion
                    if (key === 'base_price' || key === 'sale_price' || key === 'stock_quantity') {
                        requestData[key] = value === '' ? null : Number(value);
                    } else if (key === 'is_featured') {
                        // Ensure boolean conversion
                        requestData[key] = value === 'true';
                    } else {
                        requestData[key] = value;
                    }
                });
            } else {
                // Use the data object directly, ensuring is_featured is properly typed
                requestData = {
                    ...data,
                    is_featured: data.is_featured === true
                };
            }

            // Ensure is_featured is always a boolean if provided
            if ('is_featured' in requestData) {
                requestData.is_featured = requestData.is_featured === true;
                console.log('JSON update is_featured:', requestData.is_featured, typeof requestData.is_featured);
            }

            console.log('Sending JSON update request to:', `/products/${id}`);
            console.log('JSON request data:', requestData);

            const response = await axiosInstance.patch(`/products/${id}`, requestData);

            console.log('Update response:', response.data);
            console.log('Response is_featured:', response.data.is_featured);
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