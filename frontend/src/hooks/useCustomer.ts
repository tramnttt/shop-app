import { useQuery } from '@tanstack/react-query';
import { authService, UserProfile } from '../services/auth.service';

export const useCustomer = () => {
    const { data: customer, isLoading, error, refetch } = useQuery<UserProfile>({
        queryKey: ['currentUser'],
        queryFn: () => authService.getCurrentUser(),
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run if user is logged in
    });

    return {
        customer,
        isLoading,
        error,
        refetchCustomer: refetch
    };
}; 