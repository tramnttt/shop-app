import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { PaymentMethod, OrderStatus } from '../types/order';
import { useAuth } from '../contexts/AuthContext';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', 'user'],
    queryFn: orderService.getUserOrders,
    enabled: isAuthenticated
  });

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Please log in to view your orders
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't placed any orders yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </Paper>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.PROCESSING:
        return 'info';
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {order.orderNumber || order.id}
                </TableCell>
                <TableCell>
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  ${parseFloat(String(order.total)).toFixed(2)}
                </TableCell>
                <TableCell>
                  {order.paymentMethod === PaymentMethod.VIETQR ? 'Bank Transfer' : 'Cash on Delivery'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="View Order Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {order.status === OrderStatus.PENDING && 
                     order.paymentMethod === PaymentMethod.VIETQR && (
                      <Tooltip title="Complete Payment">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/payment/vietqr/${order.id}`)}
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrdersPage; 