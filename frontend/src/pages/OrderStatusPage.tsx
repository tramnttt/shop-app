import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useGetOrder } from '../hooks/useOrder';

const OrderStatusPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrder(orderId ? parseInt(orderId) : null);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order information...
        </Typography>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Order not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Home Page
        </Button>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'paid':
        return 'success';
      case 'shipped':
        return 'success';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Order Status
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">
            Order #{order.orderNumber || order.id}
          </Typography>
          <Chip 
            label={order.status} 
            color={getStatusColor(order.status)}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Order Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Date Placed</Typography>
            <Typography variant="body1" gutterBottom>
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Payment Method</Typography>
            <Typography variant="body1" gutterBottom>
              {order.paymentMethod}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Shipping Address</Typography>
            <Typography variant="body1" gutterBottom>
              {`${order.orderDetails.address}, ${order.orderDetails.city}, ${order.orderDetails.postalCode}`}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Total Amount</Typography>
            <Typography variant="body1" gutterBottom>
              ${parseFloat(String(order.total)).toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Items
        </Typography>
        
        {order.items.map((item) => (
          <Box 
            key={item.id} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 1
            }}
          >
            <Box>
              <Typography variant="body1">
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: {item.quantity}
              </Typography>
            </Box>
            <Typography variant="body1">
              ${parseFloat(String(item.price * item.quantity)).toFixed(2)}
            </Typography>
          </Box>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
          
          {order.status === 'pending' && order.paymentMethod === 'vietqr' && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate(`/payment/vietqr/${order.id}`)}
            >
              Complete Payment
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderStatusPage; 