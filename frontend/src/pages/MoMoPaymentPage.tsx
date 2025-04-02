import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import { useOrder } from '../hooks/useOrder';
import { PaymentStatus } from '../types/order';

// MoMo payment page component
const MoMoPaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getMoMoQR, checkPaymentStatus } = useOrder();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ qrCodeUrl: string; amount: number } | null>(null);
  const [remainingTime, setRemainingTime] = useState(1800); // 30 minutes in seconds
  const [paymentChecking, setPaymentChecking] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check payment status periodically
  const checkPayment = useCallback(() => {
    if (!orderId || paymentChecking) return;
    
    setPaymentChecking(true);
    
    checkPaymentStatus.mutate(parseInt(orderId), {
      onSuccess: (data) => {
        if (data.status === PaymentStatus.PAID) {
          // The navigation and basket clearing are handled in the hook
          console.log("Payment completed! Basket will be cleared by the useOrder hook");
        }
        setPaymentChecking(false);
      },
      onError: () => {
        setPaymentChecking(false);
      }
    });
  }, [orderId, checkPaymentStatus, paymentChecking]);

  // Generate QR code on component mount
  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    const generateQR = async () => {
      try {
        // Fetch order data and generate MoMo QR code
        const orderIdNum = parseInt(orderId);
        const result = await getMoMoQR.mutateAsync(orderIdNum);
        setQrData(result);
      } catch (err) {
        setError('Failed to generate MoMo payment QR code. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [orderId, getMoMoQR]);

  // Set up timer countdown
  useEffect(() => {
    if (!qrData) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData]);

  // Set up payment status checking
  useEffect(() => {
    if (!qrData) return;

    // Check payment status every 10 seconds
    const intervalId = setInterval(() => {
      checkPayment();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [qrData, checkPayment]);

  // Handle retry button click
  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orderIdNum = parseInt(orderId || '0');
      const result = await getMoMoQR.mutateAsync(orderIdNum);
      setQrData(result);
      setRemainingTime(1800); // Reset timer to 30 minutes
    } catch (err) {
      setError('Failed to generate MoMo payment QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Preparing MoMo payment...
        </Typography>
      </Container>
    );
  }

  if (error || !qrData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Failed to load payment data. Please try again.'}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={handleRetry}>
            Retry
          </Button>
          <Button variant="contained" onClick={handleCancel}>
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }

  const expired = remainingTime <= 0;

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          MoMo Payment
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Order #{orderId}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Scan QR Code
            </Typography>
            
            {expired ? (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                QR code has expired. Please generate a new one.
              </Alert>
            ) : (
              <Typography variant="subtitle2" paragraph color="text.secondary">
                Time remaining: {formatTime(remainingTime)}
              </Typography>
            )}
            
            <Box 
              sx={{ 
                mt: 2, 
                mb: 3, 
                mx: 'auto', 
                position: 'relative',
                width: 250,
                height: 250,
                border: '1px solid #eee',
                filter: expired ? 'grayscale(100%)' : 'none',
                opacity: expired ? 0.6 : 1
              }}
            >
              <Box
                component="img"
                src={qrData.qrCodeUrl}
                alt="MoMo QR Code"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              
              {expired && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <Typography variant="h6" color="error">EXPIRED</Typography>
                </Box>
              )}
            </Box>

            {expired ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRetry}
                sx={{ mt: 2 }}
              >
                Generate New QR Code
              </Button>
            ) : (
              <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                Amount: ${qrData.amount.toFixed(2)}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Payment Instructions
            </Typography>
            
            <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
              <li>Open your MoMo app on your smartphone</li>
              <li>Select the "Scan QR" function in the app</li>
              <li>Scan the QR code displayed on this page</li>
              <li>Confirm the payment amount ({qrData.amount.toFixed(2)} USD)</li>
              <li>Complete the payment in the MoMo app</li>
              <li>Wait for confirmation on this page</li>
            </ol>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              Do not close this window until the payment is confirmed. The page will automatically redirect you once the payment is completed.
            </Alert>

            <Box sx={{ mt: 4 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleCancel}
                fullWidth
              >
                Cancel Payment
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={checkPayment}
                disabled={paymentChecking}
                fullWidth
                sx={{ mt: 2 }}
              >
                {paymentChecking ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                Check Payment Status
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MoMoPaymentPage; 