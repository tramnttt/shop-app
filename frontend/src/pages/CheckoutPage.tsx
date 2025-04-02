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
import { PaymentMethod } from '../types/order';
import { useOrder } from '../hooks/useOrder';
import { formatImageUrl } from '../utils/imageUtils';
import { useBasket } from '../hooks/useBasket';
import { BasketItem } from '../types/basket';

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
  const { basket, clearBasket } = useBasket();
  const { createOrderMutation } = useOrder();
  const [activeStep, setActiveStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
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
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handlePlaceOrder = async () => {
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
        paymentMethod: getPaymentMethod(paymentInfo.paymentMethod)
      };
      
      createOrderMutation.mutate(orderData, {
        onSuccess: (order) => {
          setOrderComplete(true);
          setOrderNumber(order.orderNumber || order.id?.toString() || '');
          clearBasket();
          setProcessing(false);
          
          // If payment method is MoMo, redirect to MoMo payment page
          if (paymentInfo.paymentMethod === 'momo' && order.id) {
            navigate(`/payment/momo/${order.id}`);
          }
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
  
  useEffect(() => {
    if (orderComplete) {
      console.log("Order complete detected, clearing basket. Current basket:", basket);
      clearBasket();
      console.log("Basket cleared in success step of checkout");
    }
  }, [orderComplete, clearBasket, basket]);
  
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
          console.log("Continue Shopping clicked. Current basket:", basket);
          clearBasket();
          console.log("Basket cleared on Continue Shopping click");
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
    </Container>
  );
};

export default CheckoutPage; 