import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Button,
    Paper,
    Divider,
    Card,
    CardMedia
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    ShoppingCartCheckout as CheckoutIcon
} from '@mui/icons-material';
import { useBasket } from '../hooks/useBasket';
import { formatImageUrl } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Basket: React.FC = () => {
    const { basket, removeItem, updateQuantity } = useBasket();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Function to handle checkout button click
    const handleCheckout = () => {
        if (!isAuthenticated) {
            // Store the current path to redirect back after login
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
            return;
        }
        console.log("Navigating to checkout page");
        navigate('/checkout');
    };

    if (basket.items.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    Your basket is empty
                </Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Shopping Basket
            </Typography>
            <List>
                {basket.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {index > 0 && <Divider />}
                        <ListItem>
                            {item.image_url && (
                                <Card sx={{ width: 80, height: 80, mr: 2 }}>
                                    <CardMedia
                                        component="img"
                                        image={formatImageUrl(item.image_url)}
                                        alt={item.name}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                </Card>
                            )}
                            <ListItemText
                                primary={item.name}
                                secondary={`$${parseFloat(String(item.price)).toFixed(2)}`}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <RemoveIcon />
                                </IconButton>
                                <TextField
                                    size="small"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value)) {
                                            updateQuantity(item.id, value);
                                        }
                                    }}
                                    sx={{ width: 60, mx: 1 }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </React.Fragment>
                ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    Total: ${parseFloat(String(basket.total)).toFixed(2)}
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<CheckoutIcon />}
                    onClick={handleCheckout}
                >
                    Proceed to Checkout
                </Button>
            </Box>
        </Paper>
    );
};

export default Basket; 