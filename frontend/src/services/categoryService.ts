import axios from '../config/axios';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

const CATEGORIES_URL = '/categories';

export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const response = await axios.get(CATEGORIES_URL);
        return response.data;
    },

    getById: async (id: number): Promise<Category> => {
        const response = await axios.get(`${CATEGORIES_URL}/${id}`);
        return response.data;
    },

    create: async (data: CreateCategoryDto): Promise<Category> => {
        const response = await axios.post(CATEGORIES_URL, data);
        return response.data;
    },

    update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
        const response = await axios.patch(`${CATEGORIES_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`${CATEGORIES_URL}/${id}`);
    }
}; 