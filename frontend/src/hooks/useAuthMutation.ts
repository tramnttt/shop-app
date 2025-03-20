import { useMutation } from '@tanstack/react-query';
import { authService, LoginCredentials, RegisterData, AuthResponse } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAuthMutation = () => {
    const { login: loginAuth } = useAuth();
    const navigate = useNavigate();

    const loginMutation = useMutation<void, Error, LoginCredentials>({
        mutationFn: (credentials) => loginAuth(credentials),
        onSuccess: () => {
            navigate('/');
        },
    });

    const registerMutation = useMutation<AuthResponse, Error, RegisterData>({
        mutationFn: (registerData) => authService.register(registerData),
        onSuccess: (data, variables) => {
            loginAuth({ email: variables.email, password: variables.password });
            navigate('/');
        },
    });

    return {
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        isLoading: loginMutation.isLoading || registerMutation.isLoading,
        error: loginMutation.error || registerMutation.error,
    };
}; 