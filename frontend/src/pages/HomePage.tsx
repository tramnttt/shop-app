import React from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Container, 
    Grid, 
    Card, 
    CardMedia, 
    CardContent,
    CardActions
} from '@mui/material';
import { Link } from 'react-router-dom';

// Mock featured products
const featuredProducts = [
    {
        id: 1,
        name: 'Diamond Necklace',
        description: 'Elegant diamond necklace with 18k gold chain',
        price: 1299.99,
        imageUrl: 'https://via.placeholder.com/300x300?text=Diamond+Necklace'
    },
    {
        id: 2,
        name: 'Sapphire Earrings',
        description: 'Beautiful blue sapphire earrings with silver backing',
        price: 699.99,
        imageUrl: 'https://via.placeholder.com/300x300?text=Sapphire+Earrings'
    },
    {
        id: 3,
        name: 'Gold Bracelet',
        description: 'Handcrafted 24k gold bracelet with unique design',
        price: 899.99,
        imageUrl: 'https://via.placeholder.com/300x300?text=Gold+Bracelet'
    },
    {
        id: 4,
        name: 'Pearl Ring',
        description: 'Classic pearl ring with silver band',
        price: 499.99,
        imageUrl: 'https://via.placeholder.com/300x300?text=Pearl+Ring'
    }
];

const HomePage: React.FC = () => {
    return (
        <Box>
            {/* Hero Section */}
            <Box 
                sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    py: 8,
                    textAlign: 'center',
                    borderRadius: { xs: 0, md: 2 },
                    mb: 6,
                    mx: { xs: -2, md: 2 },
                    mt: { xs: -2, md: 2 },
                    boxShadow: 3
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" gutterBottom>
                        Elegant Jewelry for Every Occasion
                    </Typography>
                    <Typography variant="h5" paragraph>
                        Discover our exquisite collection of handcrafted jewelry pieces
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large"
                        component={Link}
                        to="/products"
                        sx={{ 
                            mt: 2,
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        Shop Now
                    </Button>
                </Container>
            </Box>

            {/* Featured Products Section */}
            <Container>
                <Typography 
                    variant="h4" 
                    component="h2" 
                    gutterBottom 
                    align="center" 
                    sx={{ 
                        mb: 4,
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            display: 'block',
                            width: '60px',
                            height: '3px',
                            backgroundColor: 'primary.main',
                            margin: '8px auto'
                        }
                    }}
                >
                    Featured Products
                </Typography>
                <Grid container spacing={4}>
                    {featuredProducts.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={3}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.imageUrl}
                                    alt={product.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="h3">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {product.description}
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        color="primary" 
                                        sx={{ 
                                            mt: 2,
                                            fontWeight: 600
                                        }}
                                    >
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button 
                                        size="small" 
                                        component={Link} 
                                        to={`/products/${product.id}`}
                                        sx={{ mr: 1 }}
                                    >
                                        View Details
                                    </Button>
                                    <Button 
                                        size="small" 
                                        color="primary"
                                        variant="contained"
                                    >
                                        Add to Cart
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Categories Section */}
            <Container sx={{ mt: 10, mb: 6 }}>
                <Typography 
                    variant="h4" 
                    component="h2" 
                    gutterBottom 
                    align="center" 
                    sx={{ 
                        mb: 4,
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            display: 'block',
                            width: '60px',
                            height: '3px',
                            backgroundColor: 'primary.main',
                            margin: '8px auto'
                        }
                    }}
                >
                    Shop by Category
                </Typography>
                <Grid container spacing={4}>
                    {['Necklaces', 'Earrings', 'Bracelets', 'Rings'].map((category) => (
                        <Grid item key={category} xs={12} sm={6} md={3}>
                            <Box
                                component={Link}
                                to={`/products?category=${category.toLowerCase()}`}
                                sx={{
                                    height: 200,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundImage: `url(https://via.placeholder.com/300x200?text=${category})`,
                                    backgroundSize: 'cover',
                                    color: 'white',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        transition: 'background-color 0.3s ease'
                                    },
                                    '&:hover': {
                                        '&::before': {
                                            backgroundColor: 'rgba(0,0,0,0.2)'
                                        },
                                        transform: 'scale(1.03)',
                                        transition: 'transform 0.3s ease'
                                    }
                                }}
                            >
                                <Typography 
                                    variant="h5" 
                                    component="span" 
                                    sx={{ 
                                        position: 'relative',
                                        zIndex: 1,
                                        fontWeight: 600,
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {category}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default HomePage; 