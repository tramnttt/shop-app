import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Rating,
  Stack,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import { Review } from '../../types/review';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  isLoading,
  isError,
  error
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error instanceof Error ? error.message : 'Failed to load reviews'}
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No reviews yet. Be the first to review this product!
        </Typography>
      </Paper>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Count ratings by star level
  const ratingCounts = reviews.reduce((acc: Record<number, number>, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Customer Reviews
        </Typography>
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={averageRating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {averageRating.toFixed(1)} out of 5
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <Stack spacing={0.5}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Box key={star} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {star}★
                  </Typography>
                  <Box
                    sx={{
                      width: '60%',
                      height: 8,
                      bgcolor: 'grey.200',
                      mx: 1,
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${((ratingCounts[star] || 0) / reviews.length) * 100}%`,
                        height: '100%',
                        bgcolor: 'primary.main'
                      }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {ratingCounts[star] || 0}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        {reviews.map((review) => (
          <Paper key={review.review_id} elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Grid container spacing={2}>
              <Grid item>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {(review.guest_name || 'User').charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              
              <Grid item xs>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" component="span">
                    {review.guest_name || 'Anonymous User'}
                  </Typography>
                  
                  {review.is_verified_purchase && (
                    <Chip
                      label="Verified Purchase"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                
                {review.comment && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {review.comment}
                  </Typography>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default ReviewList; 