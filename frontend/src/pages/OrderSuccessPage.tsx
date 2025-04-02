import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { Order, PaymentMethod, PaymentStatus } from '../types/order';
import { useGetOrder } from '../hooks/useOrder';
import { useBasket } from '../hooks/useBasket';

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearBasket } = useBasket();
  const { order, orderId, paymentStatus } = location.state || {};
  
  // If we have orderId but not the full order, fetch it
  const { 
    data: fetchedOrder, 
    isLoading, 
    error 
  } = useGetOrder(order ? null : orderId);
  
  const displayOrder: Order | null = order || fetchedOrder || null;
  
  // Ensure the basket is cleared when this page loads
  useEffect(() => {
    // Clear the basket to ensure it's empty after a successful order
    console.log("OrderSuccessPage loaded, clearing basket");
    try {
      // Try to directly clear from sessionStorage
      sessionStorage.removeItem('shop_basket');
      console.log("Directly cleared basket from sessionStorage");
    } catch (error) {
      console.error("Error directly clearing sessionStorage:", error);
    }
    
    clearBasket();
    console.log("Basket cleared on order success page");
  }, [clearBasket]);
  
  // Redirect to home if no order information
  useEffect(() => {
    if (!order && !orderId && !isLoading) {
      navigate('/');
    }
  }, [order, orderId, isLoading, navigate]);

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order information...
        </Typography>
      </Container>
    );
  }

  if (error || (!displayOrder && !isLoading)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Order details could not be loaded. Your order may still have been processed.
        </Alert>
        <Button variant="contained" component={Link} to="/">
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 64 }} />
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Order Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your purchase
          </Typography>
        </Box>

        {displayOrder && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order #{displayOrder.orderNumber || displayOrder.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We've sent a confirmation email to {displayOrder.orderDetails?.email}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ mb: 3 }}>
              {displayOrder.items.map((item) => (
                <Grid container key={item.id} sx={{ py: 1 }}>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {item.name} × {item.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              ))}

              <Divider sx={{ my: 1 }} />

              <Grid container sx={{ py: 1 }}>
                <Grid item xs={8}>
                  <Typography variant="subtitle2">Total</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2">
                    ${displayOrder.total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Payment Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2">Method:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {displayOrder.paymentMethod === PaymentMethod.VIETQR
                    ? 'VietQR (Bank Transfer)'
                    : 'Cash on Delivery'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2">Status:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography 
                  variant="body2"
                  color={
                    (paymentStatus === PaymentStatus.PAID || displayOrder.paymentStatus === PaymentStatus.PAID)
                      ? 'success.main'
                      : 'warning.main'
                  }
                >
                  {(paymentStatus === PaymentStatus.PAID || displayOrder.paymentStatus === PaymentStatus.PAID)
                    ? 'Paid'
                    : displayOrder.paymentMethod === PaymentMethod.COD
                      ? 'Pay on delivery'
                      : 'Pending'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Shipping Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Typography variant="body2">
                  {displayOrder.orderDetails?.fullName}
                </Typography>
                <Typography variant="body2">
                  {displayOrder.orderDetails?.address}
                </Typography>
                <Typography variant="body2">
                  {displayOrder.orderDetails?.city}, {displayOrder.orderDetails?.postalCode}
                </Typography>
                <Typography variant="body2">
                  {displayOrder.orderDetails?.phone}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" component={Link} to="/" sx={{ minWidth: 200 }}>
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage; 