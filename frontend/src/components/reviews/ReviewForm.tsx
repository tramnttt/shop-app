import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Rating,
  Stack,
  Paper,
  Alert,
  CircularProgress,
  Collapse
} from '@mui/material';
import { CreateReviewDto } from '../../types/review';

interface ReviewFormProps {
  productId: number;
  onSubmit: (data: CreateReviewDto) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  onReset: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSubmit,
  isSubmitting,
  isSuccess,
  isError,
  error,
  onReset
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!rating) {
      errors.rating = 'Please select a rating';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reviewData: CreateReviewDto = {
      product_id: productId,
      guest_name: name,
      guest_email: email,
      rating: rating || 0,
      comment: comment.trim() || undefined
    };

    onSubmit(reviewData);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setRating(0);
    setComment('');
    setFormErrors({});
    onReset();
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>

      <Collapse in={isSuccess}>
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleReset}>
              Write Another Review
            </Button>
          }
        >
          Thank you for your review! It has been submitted successfully.
        </Alert>
      </Collapse>

      <Collapse in={isError}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error 
            ? error.message 
            : "Something went wrong. Please try again."}
        </Alert>
      </Collapse>

      {!isSuccess && (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={isSubmitting}
              required
            />

            <TextField
              fullWidth
              type="email"
              label="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSubmitting}
              required
            />

            <Box>
              <Typography component="legend" gutterBottom>
                Rating *
              </Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                precision={1}
                size="large"
                disabled={isSubmitting}
              />
              {formErrors.rating && (
                <Typography color="error" variant="caption">
                  {formErrors.rating}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              label="Your Review (Optional)"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default ReviewForm; 