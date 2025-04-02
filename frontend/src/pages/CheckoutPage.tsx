import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import {
  Home,
  CreditCard,
  ShoppingBag,
  CheckCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PaymentMethod, Order } from '../types/order';
import { useOrder } from '../hooks/useOrder';
import { formatImageUrl } from '../utils/imageUtils';
import { useBasket } from '../hooks/useBasket';
import { BasketItem } from '../types/basket';
import { useAuth } from '../contexts/AuthContext';
import { useCustomer } from '../hooks/useCustomer';
import { authService, UserProfile } from '../services/auth.service';
import OrderSuccessModal from '../components/OrderSuccessModal';
import { orderService } from '../services/orderService';

// Stepper steps
const steps = ['Review Order', 'Shipping Information', 'Payment Method', 'Confirmation'];

const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1 business day' }
];

const paymentMethods = [
  { id: 'credit_card', name: 'Credit Card' },
  { id: 'momo', name: 'MoMo E-Wallet' },
  { id: 'cod', name: 'Cash On Delivery' }
];

const CheckoutPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { customer, isLoading: isLoadingCustomer } = useCustomer();
  const { basket, clearBasket } = useBasket();
  const { 
    createOrderMutation, 
    showSuccessModal, 
    successOrderData, 
    closeSuccessModal,
    setSuccessOrderData,
    setShowSuccessModal
  } = useOrder();
  const [activeStep, setActiveStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Manual modal tracking for debugging
  const [modalTracking, setModalTracking] = useState({ 
    modalShouldBeOpen: false, 
    modalOrder: null as Order | null
  });
  
  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [isAuthenticated, navigate]);
  
  // Log modal state changes for debugging
  useEffect(() => {
    console.log('Success modal state changed:', { 
      showSuccessModal, 
      successOrderData,
      orderComplete,
      activeStep,
      manualTracking: modalTracking
    });
    
    // Sync our manual tracking with the hook state
    if (showSuccessModal !== modalTracking.modalShouldBeOpen) {
      console.log('Updating local modal tracking to match hook state');
      setModalTracking({
        modalShouldBeOpen: showSuccessModal,
        modalOrder: successOrderData
      });
    }
  }, [showSuccessModal, successOrderData, orderComplete, activeStep, modalTracking]);
  
  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        setIsLoadingProfile(true);
        try {
          const profile = await authService.getCurrentUser();
          console.log('Fetched user profile:', profile);
          setProfileData(profile);
          
          // Pre-fill shipping info with user data if it's empty
          if (shippingInfo.firstName === '' && shippingInfo.lastName === '') {
            setShippingInfo(prevState => ({
              ...prevState,
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              email: profile.email || '',
              phone: profile.phone || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated]);
  
  // Handle success modal close - don't advance to final step
  const handleSuccessModalClose = () => {
    console.log('Modal closed manually by user');
    closeSuccessModal();
    // We no longer automatically advance to the next step
  };
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    email: '',
    shippingMethod: 'standard',
    saveInfo: true
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    paymentMethod: 'credit_card',
    sameAsShipping: true
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Calculate totals
  const subtotal = basket.total;
  const selectedShipping = shippingMethods.find(sm => sm.id === shippingInfo.shippingMethod) || shippingMethods[0];
  const shippingCost = selectedShipping.price;
  const taxRate = 0.08; // 8% tax rate
  const tax = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + tax;
  
  // Form validation
  const validateShippingForm = () => {
    const errors: Record<string, string> = {};
    
    if (!shippingInfo.firstName) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName) errors.lastName = 'Last name is required';
    if (!shippingInfo.address) errors.address = 'Address is required';
    if (!shippingInfo.city) errors.city = 'City is required';
    if (!shippingInfo.state) errors.state = 'State is required';
    if (!shippingInfo.zipCode) errors.zipCode = 'ZIP code is required';
    if (!shippingInfo.phone) errors.phone = 'Phone number is required';
    if (!shippingInfo.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) errors.email = 'Email address is invalid';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePaymentForm = () => {
    const errors: Record<string, string> = {};
    
    if (paymentInfo.paymentMethod === 'credit_card') {
      if (!paymentInfo.cardName) errors.cardName = 'Name on card is required';
      if (!paymentInfo.cardNumber) errors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) 
        errors.cardNumber = 'Card number must be 16 digits';
      
      if (!paymentInfo.expDate) errors.expDate = 'Expiration date is required';
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expDate))
        errors.expDate = 'Invalid format (MM/YY)';
      
      if (!paymentInfo.cvv) errors.cvv = 'Security code is required';
      else if (!/^\d{3,4}$/.test(paymentInfo.cvv))
        errors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Event handlers
  const handleShippingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleNext = () => {
    let isValid = false;
    
    if (activeStep === 0) {
      isValid = validateShippingForm();
    } else if (activeStep === 1) {
      isValid = validatePaymentForm();
    }
    
    if (isValid || activeStep === 2) {
      // Create the order when moving from Payment Method (step 1) to Review (step 2)
      if (activeStep === 1) {
        setProcessing(true);
        
        try {
          // Create an order using the order service
          const orderData = {
            orderDetails: {
              fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address: shippingInfo.address + (shippingInfo.apartment ? `, ${shippingInfo.apartment}` : ''),
              city: shippingInfo.city,
              postalCode: shippingInfo.zipCode,
              notes: ''
            },
            paymentMethod: getPaymentMethod(paymentInfo.paymentMethod),
            user: {
              firstName: profileData?.firstName || customer?.firstName || user?.firstName || '',
              lastName: profileData?.lastName || customer?.lastName || user?.lastName || '',
              email: profileData?.email || customer?.email || user?.email || '',
              phone: profileData?.phone || customer?.phone || shippingInfo.phone
            }
          };
          
          createOrderMutation.mutate(orderData, {
            onSuccess: (order) => {
              setOrderNumber(order.orderNumber || order.id?.toString() || '');
              setProcessing(false);
              
              // Go to review step but don't navigate away yet
              setActiveStep((prevActiveStep) => prevActiveStep + 1);
            },
            onError: (error) => {
              console.error('Error creating order:', error);
              setProcessing(false);
            }
          });
        } catch (error) {
          console.error('Error placing order:', error);
          setProcessing(false);
        }
      } else {
        // For other steps, just move forward
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handlePlaceOrder = async () => {
    // The order has already been created, just finalize
    setProcessing(true);
    
    // For COD, use the order data we already have to show success modal
    if (paymentInfo.paymentMethod === 'cod') {
      try {
        console.log('COD payment selected in handlePlaceOrder, orderId:', orderNumber);
        if (orderNumber) {
          const orderId = parseInt(orderNumber, 10);
          if (!isNaN(orderId)) {
            // Get the full order data to display in the modal
            const order = await orderService.getOrderById(orderId);
            console.log('Retrieved order data for success modal:', order);
            
            // Update our manual tracking
            setModalTracking({
              modalShouldBeOpen: true,
              modalOrder: order
            });
            
            // This will trigger the success modal from the hook
            console.log('Setting success order data and modal visibility...');
            setSuccessOrderData(order);
            setShowSuccessModal(true);
            
            // Immediately check if the modal state was updated
            setTimeout(() => {
              console.log('After setting modal state:', { 
                hookState: { showSuccessModal, successOrderData },
                manualTracking: { 
                  modalShouldBeOpen: true, 
                  modalOrder: order 
                }
              });
            }, 0);
            
            // Don't set orderComplete here to prevent auto-advancing
          }
        }
        
        // Continue with clearing the basket for COD orders
        // but don't mark the order as complete to avoid advancing to final step
        clearBasket();
        setProcessing(false);
      } catch (error) {
        console.error('Error handling COD order completion:', error);
        setProcessing(false);
      }
    } else if (paymentInfo.paymentMethod === 'momo' && orderNumber) {
      // For MoMo, redirect to MoMo payment page
      const orderId = parseInt(orderNumber, 10);
      if (!isNaN(orderId)) {
        navigate(`/payment/momo/${orderId}`);
      } else {
        console.error('Invalid order ID');
        setProcessing(false);
      }
    } else if (paymentInfo.paymentMethod === 'credit_card' && orderNumber) {
      // For credit card (VIETQR), redirect to VietQR payment page
      const orderId = parseInt(orderNumber, 10);
      if (!isNaN(orderId)) {
        navigate(`/payment/vietqr/${orderId}`);
      } else {
        console.error('Invalid order ID');
        setProcessing(false);
      }
    } else {
      setProcessing(false);
    }
  };
  
  // Helper function to get the payment method enum value
  const getPaymentMethod = (paymentMethodId: string): PaymentMethod => {
    switch (paymentMethodId) {
      case 'credit_card':
        return PaymentMethod.VIETQR;
      case 'momo':
        return PaymentMethod.MOMO;
      case 'cod':
        return PaymentMethod.COD;
      default:
        return PaymentMethod.COD;
    }
  };
  
  const formatCardNumber = (value: string) => {
    const cardNumber = value.replace(/\s/g, '').replace(/\D/g, '');
    const formattedNumber = cardNumber.replace(/(\d{4})/g, '$1 ').trim();
    return formattedNumber;
  };
  
  const renderAddressSummary = () => (
    <Box>
      <Typography variant="body1">
        {shippingInfo.firstName} {shippingInfo.lastName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {shippingInfo.address}{shippingInfo.apartment ? `, ${shippingInfo.apartment}` : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {shippingInfo.country}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {shippingInfo.phone}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {shippingInfo.email}
      </Typography>
    </Box>
  );
  
  // Render different steps
  const renderShippingStep = () => (
    <Box component="form" noValidate sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Shipping Information
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="firstName"
            value={shippingInfo.firstName}
            onChange={handleShippingInputChange}
            error={!!formErrors.firstName}
            helperText={formErrors.firstName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="lastName"
            value={shippingInfo.lastName}
            onChange={handleShippingInputChange}
            error={!!formErrors.lastName}
            helperText={formErrors.lastName}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address"
            name="address"
            value={shippingInfo.address}
            onChange={handleShippingInputChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Apartment, suite, etc. (optional)"
            name="apartment"
            value={shippingInfo.apartment}
            onChange={handleShippingInputChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="City"
            name="city"
            value={shippingInfo.city}
            onChange={handleShippingInputChange}
            error={!!formErrors.city}
            helperText={formErrors.city}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="State/Province"
            name="state"
            value={shippingInfo.state}
            onChange={handleShippingInputChange}
            error={!!formErrors.state}
            helperText={formErrors.state}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="ZIP / Postal code"
            name="zipCode"
            value={shippingInfo.zipCode}
            onChange={handleShippingInputChange}
            error={!!formErrors.zipCode}
            helperText={formErrors.zipCode}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Country"
            name="country"
            value={shippingInfo.country}
            onChange={handleShippingInputChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={shippingInfo.phone}
            onChange={handleShippingInputChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={shippingInfo.email}
            onChange={handleShippingInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox 
                name="saveInfo" 
                checked={shippingInfo.saveInfo} 
                onChange={handleShippingInputChange}
                color="primary"
              />
            }
            label="Save this information for next time"
          />
        </Grid>
      </Grid>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Shipping Method
      </Typography>
      
      <FormControl component="fieldset">
        <RadioGroup 
          name="shippingMethod" 
          value={shippingInfo.shippingMethod} 
          onChange={handleShippingInputChange}
        >
          {shippingMethods.map((method) => (
            <Paper 
              key={method.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                border: method.id === shippingInfo.shippingMethod ? '2px solid' : '1px solid', 
                borderColor: method.id === shippingInfo.shippingMethod ? 'primary.main' : 'divider',
                borderRadius: 1
              }}
            >
              <FormControlLabel 
                value={method.id} 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{method.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{method.days}</Typography>
                    </Box>
                    <Typography variant="subtitle1">${method.price.toFixed(2)}</Typography>
                  </Box>
                }
                sx={{ width: '100%', margin: 0 }}
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
  
  const renderPaymentStep = () => (
    <Box component="form" noValidate sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <RadioGroup 
          name="paymentMethod" 
          value={paymentInfo.paymentMethod} 
          onChange={handlePaymentInputChange}
        >
          {paymentMethods.map((method) => (
            <Paper 
              key={method.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                border: method.id === paymentInfo.paymentMethod ? '2px solid' : '1px solid', 
                borderColor: method.id === paymentInfo.paymentMethod ? 'primary.main' : 'divider',
                borderRadius: 1
              }}
            >
              <FormControlLabel 
                value={method.id} 
                control={<Radio />} 
                label={method.name}
                sx={{ width: '100%', margin: 0 }}
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
      
      {paymentInfo.paymentMethod === 'credit_card' && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Card Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Name on card"
                name="cardName"
                value={paymentInfo.cardName}
                onChange={handlePaymentInputChange}
                error={!!formErrors.cardName}
                helperText={formErrors.cardName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Card number"
                name="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={(e) => {
                  const formattedValue = formatCardNumber(e.target.value);
                  setPaymentInfo({ ...paymentInfo, cardNumber: formattedValue });
                }}
                inputProps={{ maxLength: 19 }}
                error={!!formErrors.cardNumber}
                helperText={formErrors.cardNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Expiration date (MM/YY)"
                name="expDate"
                placeholder="MM/YY"
                value={paymentInfo.expDate}
                onChange={handlePaymentInputChange}
                inputProps={{ maxLength: 5 }}
                error={!!formErrors.expDate}
                helperText={formErrors.expDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="CVV"
                name="cvv"
                value={paymentInfo.cvv}
                onChange={handlePaymentInputChange}
                inputProps={{ maxLength: 4 }}
                error={!!formErrors.cvv}
                helperText={formErrors.cvv}
              />
            </Grid>
          </Grid>
        </>
      )}
      
      <FormControlLabel
        control={
          <Checkbox 
            name="sameAsShipping" 
            checked={paymentInfo.sameAsShipping} 
            onChange={handlePaymentInputChange}
            color="primary"
          />
        }
        label="Billing address same as shipping address"
        sx={{ mt: 2 }}
      />
    </Box>
  );
  
  const renderReviewStep = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Shipping Address
          </Typography>
          {renderAddressSummary()}
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Shipping Method
          </Typography>
          <Typography variant="body1">
            {selectedShipping.name} (${selectedShipping.price.toFixed(2)})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedShipping.days}
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Payment Method
          </Typography>
          <Typography variant="body1">
            {paymentInfo.paymentMethod === 'credit_card' 
              ? `Credit Card (ending in ${paymentInfo.cardNumber.slice(-4)})` 
              : paymentInfo.paymentMethod === 'momo' ? 'MoMo E-Wallet' : 'Cash On Delivery'}
          </Typography>
          
          {paymentInfo.sameAsShipping ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Billing address same as shipping
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Billing Address
              </Typography>
              {renderAddressSummary()}
            </>
          )}
        </Grid>
      </Grid>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Order Items
      </Typography>
      
      <List disablePadding>
        {basket.items.map((item: BasketItem) => (
          <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <Box 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  mr: 2, 
                  border: '1px solid #eee',
                  overflow: 'hidden'
                }}
              >
                <Box
                  component="img"
                  src={item.image_url || 'https://placehold.co/400x300?text=No+Image'}
                  alt={item.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Qty: {item.quantity}
                </Typography>
              </Box>
              <Typography variant="subtitle1">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          </ListItem>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Subtotal" />
          <Typography variant="body1">
            ${subtotal.toFixed(2)}
          </Typography>
        </ListItem>
        
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Shipping" />
          <Typography variant="body1">
            ${shippingCost.toFixed(2)}
          </Typography>
        </ListItem>
        
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Tax" />
          <Typography variant="body1">
            ${tax.toFixed(2)}
          </Typography>
        </ListItem>
        
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary={<Typography variant="h6">Total</Typography>} />
          <Typography variant="h6">
            ${orderTotal.toFixed(2)}
          </Typography>
        </ListItem>
      </List>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        This is a demo checkout. No real payments will be processed.
      </Alert>
    </Box>
  );
  
  const renderSuccessStep = () => (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        Thank you for your order!
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        Your order number is <strong>{orderNumber}</strong>
      </Typography>
      
      <Card sx={{ mb: 4, textAlign: 'left' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Shipping:</Typography>
            <Typography variant="body1">${shippingCost.toFixed(2)}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Tax:</Typography>
            <Typography variant="body1">${tax.toFixed(2)}</Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">${orderTotal.toFixed(2)}</Typography>
          </Box>
        </CardContent>
      </Card>
      
      <Typography variant="body1" paragraph>
        We've sent a confirmation email to <strong>{shippingInfo.email}</strong> with your order details.
      </Typography>
      
      <Button 
        variant="contained"
        size="large"
        onClick={() => {
          console.log("Continue Shopping clicked.");
          navigate('/products');
        }}
        sx={{ mt: 2 }}
      >
        Continue Shopping
      </Button>
    </Box>
  );
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderShippingStep();
      case 1:
        return renderPaymentStep();
      case 2:
        return renderReviewStep();
      case 3:
        return renderSuccessStep();
      default:
        return null;
    }
  };
  
  if (basket.items.length === 0 && !orderComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingBag sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your basket is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You need to add items to your basket before proceeding to checkout.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/products')}
        >
          Browse Products
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Checkout
      </Typography>
      
      {!orderComplete && (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={orderComplete ? 12 : 8}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            {processing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6">
                  Processing your order...
                </Typography>
              </Box>
            ) : (
              renderStepContent(activeStep)
            )}
            
            {!orderComplete && activeStep !== 3 && !processing && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {!orderComplete && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <List disablePadding>
                {basket.items.map((item: BasketItem) => (
                  <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`Qty: ${item.quantity}`}
                    />
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping</Typography>
                <Typography variant="body1">
                  {activeStep >= 0 ? `$${shippingCost.toFixed(2)}` : 'Calculated next'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax</Typography>
                <Typography variant="body1">${tax.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${orderTotal.toFixed(2)}</Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Order Success Modal */}
      <OrderSuccessModal 
        open={showSuccessModal || modalTracking.modalShouldBeOpen} 
        order={successOrderData || modalTracking.modalOrder} 
        onClose={handleSuccessModalClose} 
      />
      <Typography variant="caption" sx={{ display: 'none' }}>
        Debug info - Modal should be: {(showSuccessModal || modalTracking.modalShouldBeOpen) ? 'VISIBLE' : 'HIDDEN'}
      </Typography>
    </Container>
  );
};

export default CheckoutPage; 