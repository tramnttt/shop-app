import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { CheckCircleOutline, ShoppingBag, Receipt } from '@mui/icons-material';
import { Order, PaymentMethod, PaymentStatus, OrderStatus } from '../types/order';
import { useGetOrder } from '../hooks/useOrder';
import { useBasket } from '../hooks/useBasket';

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearBasket } = useBasket();
  const params = useParams();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Extract data from location state or url params
  const locationState = location.state || {};
  const { order, orderId: stateOrderId, paymentStatus } = locationState;
  
  // Get orderId from params if not in state
  const paramOrderId = params.orderId;
  const effectiveOrderId = stateOrderId || paramOrderId || null;
  
  // Debug location state and params
  useEffect(() => {
    console.log('OrderSuccessPage - Location State:', location.state);
    console.log('OrderSuccessPage - URL Params:', params);
    console.log('OrderSuccessPage - Effective Order ID:', effectiveOrderId);
    console.log('OrderSuccessPage - Direct Order Object:', order);
    
    setDebugInfo({
      locationState,
      params,
      effectiveOrderId,
      hasDirectOrder: !!order
    });
  }, [location, params, effectiveOrderId, order]);
  
  // If we have orderId but not the full order, fetch it
  const { 
    data: fetchedOrder, 
    isLoading, 
    error 
  } = useGetOrder(order ? null : effectiveOrderId ? Number(effectiveOrderId) : null);
  
  // Log the fetched order for debugging
  useEffect(() => {
    console.log('OrderSuccessPage - Fetched Order:', fetchedOrder);
    if (error) {
      console.error('OrderSuccessPage - Fetch Error:', error);
    }
  }, [fetchedOrder, error]);

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
    if (!order && !effectiveOrderId && !isLoading) {
      console.log('No order info available, redirecting to home');
      navigate('/');
    }
  }, [order, effectiveOrderId, isLoading, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusLabel = () => {
    const status = paymentStatus || displayOrder?.paymentStatus;
    
    if (status === PaymentStatus.PAID) {
      return <Chip color="success" size="small" label="Paid" />;
    } else if (displayOrder?.paymentMethod === PaymentMethod.COD) {
      return <Chip color="info" size="small" label="Pay on Delivery" />;
    } else {
      return <Chip color="warning" size="small" label="Payment Pending" />;
    }
  };

  const getOrderStatusLabel = () => {
    const status = displayOrder?.status || OrderStatus.PENDING;
    
    switch (status) {
      case OrderStatus.DELIVERED:
        return <Chip color="success" size="small" label="Completed" />;
      case OrderStatus.CANCELLED:
        return <Chip color="error" size="small" label="Cancelled" />;
      case OrderStatus.PROCESSING:
        return <Chip color="info" size="small" label="Processing" />;
      case OrderStatus.SHIPPED:
        return <Chip color="info" size="small" label="Shipped" />;
      default:
        return <Chip color="warning" size="small" label="Pending" />;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order information...
        </Typography>
      </Container>
    );
  }

  if (error || (!displayOrder && !isLoading)) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Order details could not be loaded. Your order may still have been processed.
          {error ? ` Error: ${error instanceof Error ? error.message : String(error)}` : ''}
        </Alert>
        {debugInfo && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Debug Information:</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Alert>
        )}
        <Button variant="contained" component={Link} to="/orders">
          View My Orders
        </Button>
        <Button variant="outlined" component={Link} to="/" sx={{ ml: 2 }}>
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
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

        {!displayOrder && debugInfo && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Debug Information:</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Alert>
        )}

        {displayOrder && (
          <>
            <Box sx={{ mb: 3 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Typography variant="h5" component="span">
                    Order #{displayOrder.orderNumber || displayOrder.id}
                  </Typography>
                </Grid>
                <Grid item>
                  {getOrderStatusLabel()}
                </Grid>
              </Grid>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Placed on {displayOrder.createdAt ? formatDate(displayOrder.createdAt) : 'Just now'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We've sent a confirmation email to {displayOrder.orderDetails?.email}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    {displayOrder.items.map((item) => (
                      <Grid container key={item.id} sx={{ py: 1 }} alignItems="center">
                        <Grid item xs={2} sm={1}>
                          <Box 
                            component="img" 
                            src={item.image_url || "https://via.placeholder.com/50"} 
                            alt={item.name}
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              objectFit: 'contain',
                              border: '1px solid #eee',
                              borderRadius: 1
                            }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={7}>
                          <Typography variant="body2" noWrap>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight="bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ${item.price.toFixed(2)} each
                          </Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </CardContent>
                </Card>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  px: 2
                }}>
                  <Typography variant="subtitle1">Subtotal</Typography>
                  <Typography variant="subtitle1">${displayOrder.total.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  px: 2
                }}>
                  <Typography variant="subtitle1">Shipping</Typography>
                  <Typography variant="subtitle1">$0.00</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  mt: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">${displayOrder.total.toFixed(2)}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Shipping Information
                    </Typography>
                    <Typography variant="body2">
                      {displayOrder.orderDetails?.fullName}
                    </Typography>
                    <Typography variant="body2">
                      {displayOrder.orderDetails?.address}
                    </Typography>
                    <Typography variant="body2">
                      {displayOrder.orderDetails?.city}, {displayOrder.orderDetails?.postalCode}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {displayOrder.orderDetails?.phone}
                    </Typography>

                    {displayOrder.user && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Customer Information
                        </Typography>
                        <Typography variant="body2">
                          {displayOrder.user.firstName} {displayOrder.user.lastName}
                        </Typography>
                        <Typography variant="body2">
                          {displayOrder.user.email}
                        </Typography>
                        {displayOrder.user.phone && (
                          <Typography variant="body2">
                            {displayOrder.user.phone}
                          </Typography>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <Typography variant="body2">Method:</Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <Typography variant="body2">
                          {displayOrder.paymentMethod === PaymentMethod.VIETQR
                            ? 'Bank Transfer (VietQR)'
                            : displayOrder.paymentMethod === PaymentMethod.MOMO
                              ? 'MoMo E-Wallet'
                              : 'Cash on Delivery'}
                        </Typography>
                      </Grid>

                      <Grid item xs={5}>
                        <Typography variant="body2">Status:</Typography>
                      </Grid>
                      <Grid item xs={7}>
                        {getPaymentStatusLabel()}
                      </Grid>
                      
                      {displayOrder.createdAt && (
                        <>
                          <Grid item xs={5}>
                            <Typography variant="body2">Order Date:</Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Typography variant="body2">
                              {formatDate(displayOrder.createdAt)}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined"
            startIcon={<Receipt />} 
            component={Link} 
            to="/orders" 
            sx={{ minWidth: 150 }}
          >
            View Orders
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ShoppingBag />}
            component={Link} 
            to="/products" 
            sx={{ minWidth: 150 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage; 