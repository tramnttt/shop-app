import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthResponse, LoginCredentials } from '../services/auth.service';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'customer';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('token');
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userRole', user.role);
            console.log('User data saved to localStorage:', user);
            console.log('User role saved to localStorage:', user.role);
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
        }
    }, [user]);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            console.log('Login response:', response);
            console.log('User role from server:', response.user.role);
            const userData: User = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                role: response.user.role || 'customer'
            };
            console.log('Saving user data with role:', userData.role);
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('userRole', userData.role);
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 