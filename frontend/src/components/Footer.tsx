import React from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Grid, 
    Link,
    TextField,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Icons
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PinterestIcon from '@mui/icons-material/Pinterest';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

// Payment icons
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';

const Footer: React.FC = () => {
    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement newsletter subscription logic
        alert('Thank you for subscribing to our newsletter!');
    };

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.dark',
                color: 'white',
                pt: 8,
                pb: 4,
                mt: 'auto',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                boxShadow: '0 -5px 20px rgba(0,0,0,0.05)'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={6}>
                    {/* Logo and About section */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Timeless Elegance
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                            Experience the finest handcrafted jewelry, uniquely designed 
                            to capture moments that last a lifetime. Our ethically sourced 
                            materials ensure beauty with responsibility.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton 
                                size="small" 
                                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                <InstagramIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                <TwitterIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                <PinterestIcon />
                            </IconButton>
                        </Stack>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Shop
                        </Typography>
                        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/products" 
                                    color="inherit" 
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    All Products
                                </Link>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/products?featured=true" 
                                    color="inherit"
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    Featured Collection
                                </Link>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/products?sort=newest" 
                                    color="inherit"
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    New Arrivals
                                </Link>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/products?sale=true" 
                                    color="inherit"
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    Sale Items
                                </Link>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Customer Service */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Customer Care
                        </Typography>
                        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/contact" 
                                    color="inherit"
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    Contact Us
                                </Link>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/faq" 
                                    color="inherit"
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    FAQs
                                </Link>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/shipping" 
                                    color="inherit"
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    Shipping Policy
                                </Link>
                            </Box>
                            <Box component="li" sx={{ mb: 1 }}>
                                <Link 
                                    component={RouterLink} 
                                    to="/returns" 
                                    color="inherit"
                                    sx={{ 
                                        textDecoration: 'none', 
                                        opacity: 0.8,
                                        '&:hover': { 
                                            opacity: 1,
                                            textDecoration: 'underline' 
                                        } 
                                    }}
                                >
                                    Returns & Exchanges
                                </Link>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Newsletter and Contact */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Stay Connected
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                            Subscribe to receive updates, access to exclusive deals, and more.
                        </Typography>
                        <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                placeholder="Your email address"
                                variant="outlined"
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 1,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'secondary.main',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                    },
                                    input: { color: 'white' },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                type="submit"
                                                sx={{
                                                    minWidth: 'unset',
                                                    p: '8px',
                                                    color: 'white',
                                                    bgcolor: 'secondary.main',
                                                    '&:hover': {
                                                        bgcolor: 'secondary.dark',
                                                    },
                                                }}
                                            >
                                                <SendIcon fontSize="small" />
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Contact Us
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOnIcon sx={{ mr: 1, opacity: 0.8 }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    123 Jewelry Lane, Gemstone City, 90210
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon sx={{ mr: 1, opacity: 0.8 }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    +1 (555) 123-4567
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ mr: 1, opacity: 0.8 }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    info@timelesselegance.com
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />

                {/* Bottom section with copyright and payment methods */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="white" sx={{ opacity: 0.7, textAlign: { xs: 'center', md: 'left' } }}>
                            &copy; {new Date().getFullYear()} Timeless Elegance Jewelry. All rights reserved.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack 
                            direction="row" 
                            spacing={2} 
                            justifyContent={{ xs: 'center', md: 'flex-end' }}
                            alignItems="center"
                        >
                            <Typography variant="body2" color="white" sx={{ opacity: 0.7 }}>
                                We accept:
                            </Typography>
                            <CreditCardIcon sx={{ color: 'white', opacity: 0.7 }} />
                            <PaymentIcon sx={{ color: 'white', opacity: 0.7 }} />
                            {/* Add more payment method icons as needed */}
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer; 