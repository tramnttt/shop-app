import { axiosInstance } from '../config/axios';

export interface Category {
    id: number;
    name: string;
    description: string | null;
    parent_id?: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryDto {
    name: string;
    description: string | null;
    parent_category_id?: number | null;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string | null;
    parent_category_id?: number | null;
}

const handleError = (error: any) => {
    console.error('Category API Error:', error.response?.data || error.message);
    throw error;
};

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        try {
            const response = await axiosInstance.get<Category[]>('/categories');
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    getById: async (id: number): Promise<Category> => {
        try {
            const response = await axiosInstance.get<Category>(`/categories/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    create: async (data: CreateCategoryDto): Promise<Category> => {
        try {
            const response = await axiosInstance.post<Category>('/categories', data);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
        try {
            const response = await axiosInstance.patch<Category>(`/categories/${id}`, data);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/categories/${id}`);
        } catch (error) {
            handleError(error);
        }
    }
}; 