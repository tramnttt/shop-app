import axios from 'axios';
import {
    Product,
    Category,
    LoginCredentials,
    RegisterData,
    AuthResponse
} from '../interfaces';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/api/auth/login', credentials);
            localStorage.setItem('token', response.data.access_token);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    register: async (data: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/api/auth/register', data);
            localStorage.setItem('token', response.data.access_token);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    logout: (): void => {
        localStorage.removeItem('token');
    },
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};

// Products API
export const productsAPI = {
    getAll: async (params = {}): Promise<Product[]> => {
        try {
            const response = await api.get<Product[]>('/api/products', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },
    getOne: async (id: number): Promise<Product> => {
        try {
            const response = await api.get<Product>(`/api/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    },
    getByCategory: async (categoryId: number): Promise<Product[]> => {
        try {
            const response = await api.get<Product[]>(`/api/categories/${categoryId}/products`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            return [];
        }
    },
    create: async (product: Partial<Product>): Promise<Product> => {
        const response = await api.post<Product>('/api/products', product);
        return response.data;
    },
    update: async (id: number, product: Partial<Product>): Promise<Product> => {
        const response = await api.patch<Product>(`/api/products/${id}`, product);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/products/${id}`);
    }
};

// Categories API
export const categoriesAPI = {
    getAll: async (): Promise<Category[]> => {
        try {
            const response = await api.get<Category[]>('/api/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },
    getOne: async (id: number): Promise<Category> => {
        try {
            const response = await api.get<Category>(`/api/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching category ${id}:`, error);
            throw error;
        }
    },
    create: async (category: Partial<Category>): Promise<Category> => {
        const response = await api.post<Category>('/api/categories', category);
        return response.data;
    },
    update: async (id: number, category: Partial<Category>): Promise<Category> => {
        const response = await api.patch<Category>(`/api/categories/${id}`, category);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/categories/${id}`);
    }
};

export default api; 