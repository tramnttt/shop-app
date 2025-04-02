import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import { CreateReviewDto } from '../types/review';

export const useReviews = (productId: number) => {
    const queryClient = useQueryClient();

    // Get reviews for a product
    const {
        data: reviews,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['reviews', productId],
        queryFn: () => reviewService.getReviewsByProductId(productId),
        enabled: !!productId,
    });

    // Create a new review
    const createReviewMutation = useMutation({
        mutationFn: (data: CreateReviewDto) => reviewService.createReview(data),
        onSuccess: () => {
            // Invalidate reviews query to refetch updated reviews
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
        },
    });

    return {
        reviews: reviews || [],
        isLoading,
        isError,
        error,
        createReview: createReviewMutation.mutate,
        isSubmitting: createReviewMutation.isLoading,
        isSuccess: createReviewMutation.isSuccess,
        isSubmitError: createReviewMutation.isError,
        submitError: createReviewMutation.error,
        reset: createReviewMutation.reset,
    };
}; 