import { axiosInstance } from '../config/axios';

export interface Category {
    id: number;
    name: string;
    description: string | null;
    parent_id?: number | null;
    image_url?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryDto {
    name: string;
    description: string | null;
    parent_category_id?: number | null;
    image_url?: string | null;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string | null;
    parent_category_id?: number | null;
    image_url?: string | null;
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

    create: async (data: CreateCategoryDto, imageFile?: File): Promise<Category> => {
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                formData.append('name', data.name);
                if (data.description) formData.append('description', data.description);
                if (data.parent_category_id) formData.append('parent_category_id', data.parent_category_id.toString());

                const response = await axiosInstance.post<Category>('/categories', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                const response = await axiosInstance.post<Category>('/categories', data);
                return response.data;
            }
        } catch (error) {
            return handleError(error);
        }
    },

    update: async (id: number, data: UpdateCategoryDto, imageFile?: File): Promise<Category> => {
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                if (data.name) formData.append('name', data.name);
                if (data.description) formData.append('description', data.description);
                if (data.parent_category_id) formData.append('parent_category_id', data.parent_category_id.toString());

                const response = await axiosInstance.patch<Category>(`/categories/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                const response = await axiosInstance.patch<Category>(`/categories/${id}`, data);
                return response.data;
            }
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