import React, { useEffect } from 'react';
import { Container, Typography, Paper, Box, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import OrdersTable from '../../components/admin/orders/OrdersTable';
import { isAdmin, getUserRole, getAuthToken } from '../../utils/auth';
import { Navigate } from 'react-router-dom';

const OrdersPage: React.FC = () => {
  useEffect(() => {
    console.log('OrdersPage - Checking admin access:');
    console.log('Auth token exists:', !!getAuthToken());
    console.log('User role from localStorage:', getUserRole());
    console.log('isAdmin() result:', isAdmin());
  }, []);

  if (!isAdmin()) { 
    console.log('Not admin, redirecting to login');
    return <Navigate to='/login' replace />; 
  }
  
  console.log('Admin access confirmed, rendering OrdersPage');
  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to='/admin' color='inherit'>Dashboard</Link>
        <Typography color='text.primary'>Orders</Typography>
      </Breadcrumbs>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <OrdersTable />
      </Paper>
    </Container>
  );
};
export default OrdersPage;
