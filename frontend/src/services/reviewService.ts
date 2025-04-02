import { CreateReviewDto, Review } from '../types/review';
import axiosInstance from '../config/axios';

const getReviewsByProductId = async (productId: number): Promise<Review[]> => {
    const response = await axiosInstance.get<Review[]>(`/reviews/product/${productId}`);
    return response.data;
};

const createReview = async (reviewData: CreateReviewDto): Promise<Review> => {
    const response = await axiosInstance.post<Review>(`/reviews`, reviewData);
    return response.data;
};

export const reviewService = {
    getReviewsByProductId,
    createReview,
}; 