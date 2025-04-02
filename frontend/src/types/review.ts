export interface Review {
    review_id: number;
    product_id: number;
    customer_id?: number;
    guest_name?: string;
    guest_email?: string;
    rating: number;
    comment?: string;
    is_verified_purchase: boolean;
    created_at: string;
}

export interface CreateReviewDto {
    product_id: number;
    customer_id?: number;
    guest_name?: string;
    guest_email?: string;
    rating: number;
    comment?: string;
} 