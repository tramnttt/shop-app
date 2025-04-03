import { api } from '../utils/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: 'admin' | 'customer';
    };
}

export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'admin' | 'customer';
}

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/api/auth/login', credentials);
        console.log('Raw login response data:', response.data);

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }

        return response.data;
    }

    async register(userData: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/api/auth/register', userData);

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }

        return response.data;
    }

    async getCurrentUser(): Promise<UserProfile> {
        try {
            const response = await api.get('/api/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    logout(): void {
        localStorage.removeItem('token');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}

export const authService = new AuthService(); 