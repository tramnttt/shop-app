import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { CheckCircleOutline, ShoppingBag, Receipt, Close } from '@mui/icons-material';
import { Order, PaymentMethod, PaymentStatus, OrderStatus } from '../types/order';

interface OrderSuccessModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, open, onClose }) => {
  // Debug logging
  useEffect(() => {
    console.log('OrderSuccessModal rendered with props:', { order, open });
    
    if (open) {
      console.log('Modal should be visible now!');
    } else {
      console.log('Modal should be hidden');
    }
    
    return () => {
      console.log('OrderSuccessModal unmounting or dependency changed');
    };
  }, [order, open]);
  
  // Additional effect to log when component mounts/unmounts
  useEffect(() => {
    console.log('OrderSuccessModal mounted');
    
    return () => {
      console.log('OrderSuccessModal unmounted');
    };
  }, []);

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
    const status = order?.paymentStatus;
    
    if (status === PaymentStatus.PAID) {
      return <Chip color="success" size="small" label="Paid" />;
    } else if (order?.paymentMethod === PaymentMethod.COD) {
      return <Chip color="info" size="small" label="Pay on Delivery" />;
    } else {
      return <Chip color="warning" size="small" label="Payment Pending" />;
    }
  };

  const getOrderStatusLabel = () => {
    const status = order?.status || OrderStatus.PENDING;
    
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

  // Log if we're rendering simplified view due to lack of order data
  if (!order) {
    console.log('Rendering simplified order success modal (no order data)');
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        style={{ zIndex: 1500 }}
      >
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 4, pt: 2 }}>
            <CheckCircleOutline color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
              Order Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for your purchase. Your order has been confirmed.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => {
              console.log('Modal close button clicked');
              onClose();
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  console.log('Rendering full order success modal with data:', order);
  return (
    <Dialog 
      open={open} 
      onClose={() => {
        console.log('Dialog onClose triggered');
        onClose();
      }} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
      style={{ zIndex: 1500 }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton 
          onClick={() => {
            console.log('Close icon button clicked');
            onClose();
          }} 
          size="small"
        >
          <Close />
        </IconButton>
      </Box>

      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 4, pt: 2 }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 64 }} />
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Order Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your purchase
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Typography variant="h5" component="span">
                Order #{order.orderNumber || order.id}
              </Typography>
            </Grid>
            <Grid item>
              {getOrderStatusLabel()}
            </Grid>
          </Grid>
          {order.createdAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Placed on {formatDate(order.createdAt)}
            </Typography>
          )}
          {order.orderDetails?.email && (
            <Typography variant="body2" color="text.secondary">
              We've sent a confirmation email to {order.orderDetails.email}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            
            {order.items && order.items.length > 0 ? (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  {order.items.map((item) => (
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
            ) : (
              <Typography variant="body2">Order items information not available</Typography>
            )}

            {order.total !== undefined && (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  px: 2
                }}>
                  <Typography variant="subtitle1">Subtotal</Typography>
                  <Typography variant="subtitle1">${order.total.toFixed(2)}</Typography>
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
                  <Typography variant="h6">${order.total.toFixed(2)}</Typography>
                </Box>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            
            {order.orderDetails && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Shipping Information
                  </Typography>
                  <Typography variant="body2">
                    {order.orderDetails.fullName}
                  </Typography>
                  <Typography variant="body2">
                    {order.orderDetails.address}
                  </Typography>
                  <Typography variant="body2">
                    {order.orderDetails.city}, {order.orderDetails.postalCode}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {order.orderDetails.phone}
                  </Typography>

                  {order.user && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Customer Information
                      </Typography>
                      <Typography variant="body2">
                        {order.user.firstName} {order.user.lastName}
                      </Typography>
                      <Typography variant="body2">
                        {order.user.email}
                      </Typography>
                      {order.user.phone && (
                        <Typography variant="body2">
                          {order.user.phone}
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

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
                      {order.paymentMethod === PaymentMethod.VIETQR
                        ? 'Bank Transfer (VietQR)'
                        : order.paymentMethod === PaymentMethod.MOMO
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
                  
                  {order.createdAt && (
                    <>
                      <Grid item xs={5}>
                        <Typography variant="body2">Order Date:</Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', p: 3, flexDirection: 'column' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Your order has been saved. You can continue reviewing your order after closing this window.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined"
            startIcon={<Receipt />} 
            component={Link} 
            to="/orders" 
            onClick={onClose}
          >
            View Orders
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ShoppingBag />}
            onClick={onClose}
          >
            Continue Review
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OrderSuccessModal; 