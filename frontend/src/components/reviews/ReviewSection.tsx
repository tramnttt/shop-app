import React from 'react';
import { Box, Typography, Divider, Paper } from '@mui/material';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useReviews } from '../../hooks/useReviews';

interface ReviewSectionProps {
  productId: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const {
    reviews,
    isLoading,
    isError,
    error,
    createReview,
    isSubmitting,
    isSuccess,
    isSubmitError,
    submitError,
    reset,
  } = useReviews(productId);

  return (
    <Paper elevation={0} sx={{ p: 3, mt: 6 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Reviews
      </Typography>
      <Divider sx={{ mb: 4 }} />
      
      <ReviewForm
        productId={productId}
        onSubmit={createReview}
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
        isError={isSubmitError}
        error={submitError}
        onReset={reset}
      />
      
      <Box sx={{ mt: 4 }}>
        <ReviewList
          reviews={reviews}
          isLoading={isLoading}
          isError={isError}
          error={error}
        />
      </Box>
    </Paper>
  );
};

export default ReviewSection; 