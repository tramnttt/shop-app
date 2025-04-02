import React from 'react';
import {
  Typography,
  Box,
  Container,
  Paper,
  Divider,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import {
  DeleteOutline,
  Add,
  Remove,
  ShoppingBag
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value);
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleIncrementQuantity = (productId: number, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecrementQuantity = (productId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Your Shopping Cart
      </Typography>

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any jewelry to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: { xs: 3, md: 0 } }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cart Items ({items.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {items.map((item) => (
                <Card key={item.id} sx={{ mb: 2, display: 'flex', position: 'relative' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 120, objectFit: 'contain', p: 1 }}
                    image={item.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
                    alt={item.name}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                      <Typography component={Link} to={`/products/${item.id}`} variant="h6" sx={{ textDecoration: 'none', color: 'inherit' }}>
                        {item.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ mr: 2 }}>
                          ${item.price.toFixed(2)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleDecrementQuantity(item.id, item.quantity)}
                            disabled={item.quantity <= 1}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <TextField
                            size="small"
                            type="number"
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            sx={{ width: 60, mx: 1 }}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e as React.ChangeEvent<HTMLInputElement>)}
                          />
                          
                          <IconButton 
                            size="small"
                            onClick={() => handleIncrementQuantity(item.id, item.quantity)}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                    <Typography variant="h6" align="right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    
                    <IconButton 
                      color="error"
                      onClick={() => removeFromCart(item.id)}
                      sx={{ alignSelf: 'flex-end' }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                </Card>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/products"
                >
                  Continue Shopping
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body1">${totalPrice.toFixed(2)}</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Shipping" secondary="Calculated at checkout" />
                  <Typography variant="body1">-</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Tax" secondary="Calculated at checkout" />
                  <Typography variant="body1">-</Typography>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary={<Typography variant="h6">Total</Typography>} />
                  <Typography variant="h6">${totalPrice.toFixed(2)}</Typography>
                </ListItem>
              </List>
              
              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3 }}
                disabled={items.length === 0}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Secure checkout with multiple payment options available.
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage; 