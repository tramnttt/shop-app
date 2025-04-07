import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { PaymentStatus, QRCodeData } from '../types/order';
import { Container, Typography, Box, CircularProgress, Button, Alert, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatCurrency } from '../utils/currencyUtils';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistanceToNow } from 'date-fns';

const QRImage = styled('img')({
    width: '100%',
    maxWidth: '300px',
    height: 'auto',
    margin: '16px auto',
    display: 'block',
});

const PaymentCompletedImage = styled('img')({
    width: '100%',
    maxWidth: '200px',
    height: 'auto',
    margin: '16px auto',
    display: 'block',
});

const PaymentBankInfo = styled(Box)(({ theme }) => ({
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
}));

const PaymentInfoItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const PaymentPage = () => {
    const { type, orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [qrData, setQrData] = useState<QRCodeData | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
    const [error, setError] = useState<string | null>(null);
    const [checkingInterval, setCheckingInterval] = useState<NodeJS.Timeout | null>(null);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        // Cleanup function for the interval
        return () => {
            if (checkingInterval) {
                clearInterval(checkingInterval);
            }
        };
    }, [checkingInterval]);

    // Load order details and generate QR
    useEffect(() => {
        const loadOrderAndQR = async () => {
            if (!orderId) {
                setError('Order ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Load order
                const orderData = await orderService.getOrderById(Number(orderId));
                setOrder(orderData);

                // Generate QR based on payment type
                if (type === 'vietqr') {
                    const qrCodeData = await orderService.generateVietQR(orderData);
                    setQrData(qrCodeData);
                } else if (type === 'momo') {
                    const qrCodeData = await orderService.generateMoMoQR(Number(orderId));
                    setQrData(qrCodeData);
                } else {
                    setError('Invalid payment type');
                }

                // Check payment status immediately and then set up interval
                await checkPaymentStatus(Number(orderId));
                
                // Set up interval to check payment status every 5 seconds
                const intervalId = setInterval(() => {
                    checkPaymentStatus(Number(orderId));
                }, 5000);
                
                setCheckingInterval(intervalId);
                
                setLoading(false);
            } catch (err: any) {
                console.error('Error setting up payment:', err);
                setError(err.message || 'Failed to load payment information');
                setLoading(false);
            }
        };

        loadOrderAndQR();
    }, [orderId, type]);

    // Update remaining time until QR code expires
    useEffect(() => {
        if (!qrData?.expiresAt) return;

        const updateTimeLeft = () => {
            const expiresAt = new Date(qrData.expiresAt);
            const now = new Date();
            
            if (now >= expiresAt) {
                setTimeLeft('Expired');
                return;
            }
            
            setTimeLeft(formatDistanceToNow(expiresAt, { addSuffix: true }));
        };

        updateTimeLeft();
        const intervalId = setInterval(updateTimeLeft, 1000);
        
        return () => clearInterval(intervalId);
    }, [qrData]);

    const checkPaymentStatus = async (orderId: number) => {
        try {
            const { status } = await orderService.checkPaymentStatus(orderId);
            setPaymentStatus(status);
            
            // If payment is complete, clear the interval
            if (status === PaymentStatus.PAID) {
                if (checkingInterval) {
                    clearInterval(checkingInterval);
                    setCheckingInterval(null);
                }
            }
        } catch (err: any) {
            console.error('Error checking payment status:', err);
        }
    };

    const handleBackToOrders = () => {
        navigate('/orders');
    };

    const handleTryAgain = () => {
        window.location.reload();
    };

    const renderPaymentUI = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Loading payment information...
                    </Typography>
                </Box>
            );
        }

        if (error) {
            return (
                <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                    <Button variant="outlined" size="small" onClick={handleTryAgain} sx={{ mt: 1, ml: 1 }}>
                        Try Again
                    </Button>
                </Alert>
            );
        }

        if (paymentStatus === PaymentStatus.PAID) {
            return (
                <Box sx={{ textAlign: 'center', my: 3 }}>
                    <PaymentCompletedImage src="/assets/payment-success.png" alt="Payment Successful" />
                    
                    <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                        Payment Completed!
                    </Typography>
                    
                    <Typography variant="body1" sx={{ my: 2 }}>
                        Your payment for order #{orderId} has been processed successfully.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Thank you for your purchase. You will receive a confirmation email shortly.
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackToOrders}
                        sx={{ mt: 2 }}
                    >
                        View My Orders
                    </Button>
                </Box>
            );
        }

        return (
            <Box sx={{ my: 3 }}>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                {type === 'vietqr' ? 'VietQR Payment' : 'MoMo QR Payment'}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Scan the QR code with your {type === 'vietqr' ? 'banking app' : 'MoMo app'} to complete the payment
                            </Typography>

                            {qrData && (
                                <>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <QRImage 
                                            src={type === 'vietqr' ? qrData.qrCode : qrData.qrCode} 
                                            alt="Payment QR Code"
                                        />
                                        
                                        {timeLeft && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                                                <AccessTimeIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    QR code expires {timeLeft}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {qrData.paymentUrl && (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<CreditCardIcon />}
                                            fullWidth
                                            href={qrData.paymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ mt: 2 }}
                                        >
                                            Pay via {type === 'vietqr' ? 'VietQR' : 'MoMo'} App
                                        </Button>
                                    )}
                                </>
                            )}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Payment Details
                            </Typography>
                            
                            <PaymentBankInfo>
                                <PaymentInfoItem>
                                    <Typography variant="body2" color="text.secondary">Order ID</Typography>
                                    <Typography variant="body2">{orderId}</Typography>
                                </PaymentInfoItem>
                                
                                <PaymentInfoItem>
                                    <Typography variant="body2" color="text.secondary">Amount</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {qrData ? formatCurrency(qrData.amount) : '-'}
                                    </Typography>
                                </PaymentInfoItem>
                                
                                {type === 'vietqr' && (
                                    <>
                                        <PaymentInfoItem>
                                            <Typography variant="body2" color="text.secondary">Bank</Typography>
                                            <Typography variant="body2">VietQR Bank</Typography>
                                        </PaymentInfoItem>
                                        
                                        <PaymentInfoItem>
                                            <Typography variant="body2" color="text.secondary">Account Number</Typography>
                                            <Typography variant="body2">123456789</Typography>
                                        </PaymentInfoItem>
                                        
                                        <PaymentInfoItem>
                                            <Typography variant="body2" color="text.secondary">Account Holder</Typography>
                                            <Typography variant="body2">Jewelry Shop</Typography>
                                        </PaymentInfoItem>
                                    </>
                                )}
                                
                                {type === 'momo' && (
                                    <>
                                        <PaymentInfoItem>
                                            <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                                            <Typography variant="body2">MoMo E-Wallet</Typography>
                                        </PaymentInfoItem>
                                        
                                        <PaymentInfoItem>
                                            <Typography variant="body2" color="text.secondary">Reference ID</Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                {qrData?.partnerRefId || '-'}
                                            </Typography>
                                        </PaymentInfoItem>
                                    </>
                                )}
                                
                                <PaymentInfoItem>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    <Typography 
                                        variant="body2" 
                                        color={paymentStatus === PaymentStatus.PENDING ? 'warning.main' : 'success.main'}
                                        fontWeight="medium"
                                    >
                                        {paymentStatus === PaymentStatus.PENDING ? 'Waiting for payment' : 'Paid'}
                                    </Typography>
                                </PaymentInfoItem>
                            </PaymentBankInfo>
                            
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {paymentStatus === PaymentStatus.PENDING ? (
                                    <>This page will automatically update when your payment is processed.</>
                                ) : (
                                    <>Your payment has been processed. Thank you!</>
                                )}
                            </Alert>
                        </Grid>
                    </Grid>
                </Paper>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/checkout')}
                    >
                        Back to Checkout
                    </Button>
                    
                    {qrData?.partnerRefId && paymentStatus === PaymentStatus.PENDING && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => orderService.confirmMoMoPayment(qrData.partnerRefId!).then(() => {
                                checkPaymentStatus(Number(orderId));
                            })}
                        >
                            Simulate Payment
                        </Button>
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {type === 'vietqr' ? 'VietQR Payment' : 'MoMo Payment'}
            </Typography>
            
            {renderPaymentUI()}
        </Container>
    );
};

export default PaymentPage; 