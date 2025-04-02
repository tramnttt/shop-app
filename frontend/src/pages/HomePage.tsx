import React from 'react';
import { 
    Box, 
    Button, 
    Card,
    CardActions,
    CardContent,
    CardMedia,
    CircularProgress,
    Container, 
    Grid, 
    Typography,
    Alert,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { formatImageUrl } from '../utils/imageUtils';
import { useBasket } from '../hooks/useBasket';

const HomePage: React.FC = () => {
    // Fetch featured products from API
    const { 
        data: productsData, 
        isLoading: productsLoading, 
        isError: productsError,
        error: productsErrorMsg 
    } = useProducts({
        limit: 4,
        featured: true
    });

    // Fetch categories from API
    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
        error: categoriesErrorMsg
    } = useCategories();

    const { addItem } = useBasket();
    
    const handleAddToCart = (product: any) => {
        console.log('Adding product to cart:', product);
        if (product && product.product_id) {
            addItem({
                id: product.product_id,
                name: product.name,
                price: parseFloat(String(product.sale_price || product.base_price)),
                image_url: product.images && product.images.length > 0 
                    ? product.images[0].image_url 
                    : undefined
            });
        }
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                
                {productsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : productsError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Error loading featured products: {productsErrorMsg instanceof Error ? productsErrorMsg.message : 'Unknown error'}
                    </Alert>
                ) : productsData?.products && productsData.products.length > 0 ? (
                    <Grid container spacing={4}>
                        {productsData.products.map((product) => (
                            <Grid item key={product.product_id} xs={12} sm={6} md={3}>
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
                                        image={formatImageUrl(product.images[0]?.image_url)}
                                        alt={product.name}
                                        sx={{ objectFit: 'contain', bgcolor: 'grey.100', p: 1 }}
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
                                            ${product.sale_price || product.base_price}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Button 
                                            size="small" 
                                            component={Link} 
                                            to={`/products/${product.product_id}`}
                                            sx={{ mr: 1 }}
                                        >
                                            View Details
                                        </Button>
                                        <Button 
                                            size="small" 
                                            color="primary"
                                            variant="contained"
                                            disabled={product.stock_quantity <= 0}
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No featured products available at the moment.
                    </Alert>
                )}
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
                {categoriesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : categoriesError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Error loading categories: {categoriesErrorMsg instanceof Error ? categoriesErrorMsg.message : 'Unknown error'}
                    </Alert>
                ) : categories.length > 0 ? (
                    <Grid container spacing={4}>
                        {categories.map((category) => (
                            <Grid item key={category.id} xs={12} sm={6} md={3}>
                                <Box
                                    component={Link}
                                    to={`/products?category=${category.id}`}
                                    sx={{
                                        height: 200,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundImage: `url(https://via.placeholder.com/300x200?text=${encodeURIComponent(category.name)})`,
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
                                        {category.name}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No categories available at the moment.
                    </Alert>
                )}
            </Container>
        </Box>
    );
};

export default HomePage; 