import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { useGetOrder, useOrder } from '../hooks/useOrder';
import { QRCodeData } from '../types/order';
import { orderService } from '../services/orderService';

const VietQRPaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getVietQRMutation, checkPaymentStatus } = useOrder();
  const { data: order, isLoading: orderLoading, error: orderError } = useGetOrder(orderId ? parseInt(orderId) : null);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutes in seconds
  const [isQRLoading, setIsQRLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Generate VietQR code when order is loaded
  useEffect(() => {
    if (order && !qrCodeData && !isQRLoading) {
      setIsQRLoading(true);
      
      orderService.generateVietQR(order)
        .then(data => {
          setQrCodeData(data);
          
          // Set expiry timer
          const expiryDate = new Date(data.expiresAt);
          const now = new Date();
          const secondsLeft = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);
          setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
        })
        .catch(error => {
          console.error('Error generating QR code:', error);
          setErrorMessage('Failed to generate payment QR code. Please try again.');
        })
        .finally(() => {
          setIsQRLoading(false);
        });
    }
  }, [order, qrCodeData, isQRLoading]);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  // Poll for payment status
  useEffect(() => {
    if (!order || !qrCodeData) return;
    
    const pollInterval = setInterval(() => {
      console.log("Checking payment status - basket will be cleared by the useOrder hook when payment is completed");
      checkPaymentStatus.mutate(order.id!);
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(pollInterval);
  }, [order, qrCodeData, checkPaymentStatus]);
  
  // Format time remaining
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle try again
  const handleTryAgain = () => {
    setQrCodeData(null);
    setErrorMessage(null);
  };
  
  // Handle cancel payment
  const handleCancel = () => {
    navigate('/orders'); // Go to orders page
  };
  
  if (orderLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order information...
        </Typography>
      </Container>
    );
  }
  
  if (orderError || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Order not found or could not be loaded. Please try again.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/orders')}>
          Return to Orders
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Payment
        </Typography>
        
        <Typography variant="h6" gutterBottom align="center">
          Order #{order.orderNumber || order.id}
        </Typography>
        
        <Box sx={{ textAlign: 'center', my: 3 }}>
          <Typography variant="body1" gutterBottom>
            Amount Due:
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            ${order.total.toFixed(2)}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
            <Button size="small" onClick={handleTryAgain} sx={{ ml: 2 }}>
              Try Again
            </Button>
          </Alert>
        )}
        
        {isQRLoading ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Generating QR code...
            </Typography>
          </Box>
        ) : qrCodeData ? (
          <Box>
            <Typography variant="h6" gutterBottom align="center">
              Scan this QR code with your banking app
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img 
                src={qrCodeData.qrCodeUrl} 
                alt="VietQR Payment Code" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '8px' 
                }} 
              />
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2">Bank:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">VIETCOMBANK</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Account Number:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">1234567890</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Account Name:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">Jewelry Shop</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Amount:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">${order.total.toFixed(2)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Reference:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">Order #{order.orderNumber || order.id}</Typography>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                This QR code will expire in <strong>{formatTimeLeft()}</strong>
              </Typography>
            </Alert>
            
            <Typography variant="body2" paragraph sx={{ mt: 3 }}>
              After completing payment, please wait while we verify your transaction. This page will automatically redirect once payment is confirmed.
            </Typography>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              {checkPaymentStatus.isLoading ? (
                <CircularProgress size={24} sx={{ mr: 1 }} />
              ) : (
                <Button 
                  variant="outlined" 
                  onClick={() => checkPaymentStatus.mutate(order.id!)}
                  sx={{ mr: 2 }}
                >
                  Check Payment Status
                </Button>
              )}
              <Button variant="text" color="error" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Button variant="contained" onClick={handleTryAgain}>
              Generate Payment QR Code
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VietQRPaymentPage; 