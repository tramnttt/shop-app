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
    useTheme,
    Divider,
    Paper,
    Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { formatImageUrl } from '../utils/imageUtils';
import { useBasket } from '../hooks/useBasket';
// Import icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ overflowX: 'hidden' }}>
            {/* Hero Section - Enhanced with gradient and better visuals */}
            <Box 
                sx={{ 
                    background: 'linear-gradient(135deg, #4a3f35 0%, #b0a084 100%)', 
                    color: 'white', 
                    py: { xs: 10, md: 16 },
                    textAlign: 'center',
                    borderRadius: { xs: 0, md: '0 0 30px 30px' },
                    mb: 10,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.2,
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                        variant="h1" 
                        component="h1" 
                        sx={{
                            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                            fontWeight: 300,
                            letterSpacing: '-0.5px',
                            mb: 2,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        <Box component="span" sx={{ fontWeight: 700 }}>Timeless</Box> Elegance
                    </Typography>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            maxWidth: '700px', 
                            mx: 'auto', 
                            mb: 5,
                            opacity: 0.9,
                            fontWeight: 300,
                            letterSpacing: '0.5px',
                            lineHeight: 1.5
                        }}
                    >
                        Discover our exquisite collection of handcrafted jewelry pieces for every moment that matters
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            size="large"
                            component={Link}
                            to="/products"
                            startIcon={<ShoppingCartIcon />}
                            sx={{ 
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 500,
                                borderRadius: '50px',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                                },
                                transition: 'all 0.3s'
                            }}
                        >
                            Shop Collection
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="inherit"
                            size="large"
                            component={Link}
                            to="/categories"
                            sx={{ 
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                borderRadius: '50px',
                                borderWidth: '2px',
                                '&:hover': {
                                    borderWidth: '2px',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Explore Categories
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Values/Benefits Banner */}
            <Container maxWidth="lg">
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        mb: 10, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.07)'
                    }}
                >
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} sm={4} textAlign="center">
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ color: 'primary.main', fontSize: '3rem', mb: 1 }}>✦</Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Handcrafted Excellence
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Every piece is meticulously crafted by our master artisans
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4} textAlign="center">
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ color: 'primary.main', fontSize: '3rem', mb: 1 }}>⟡</Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Ethically Sourced
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    We use only responsibly sourced materials for all our jewelry
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4} textAlign="center">
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ color: 'primary.main', fontSize: '3rem', mb: 1 }}>♢</Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Lifetime Guarantee
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Each piece comes with our exclusive care and quality promise
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* Featured Products Section */}
            <Container maxWidth="lg">
                <Box sx={{ mb: 8, textAlign: 'center' }}>
                    <Chip 
                        label="NEW ARRIVALS" 
                        size="small" 
                        color="primary" 
                        sx={{ mb: 2, fontWeight: 500 }}
                    />
                    <Typography 
                        variant="h3" 
                        component="h2" 
                        sx={{ 
                            mb: 1,
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            fontSize: { xs: '1.75rem', sm: '2.5rem' }
                        }}
                    >
                        Featured Collection
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                            maxWidth: '700px', 
                            mx: 'auto', 
                            mb: 2
                        }}
                    >
                        Discover our most coveted pieces, handpicked for their exceptional design and craftsmanship
                    </Typography>
                    <Divider sx={{ width: '60px', margin: '20px auto', borderColor: 'primary.main', borderWidth: 2 }} />
                </Box>
                
                {productsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : productsError ? (
                    <Alert severity="error" sx={{ mb: 4 }}>
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
                                        transition: 'all 0.4s ease',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                        },
                                        position: 'relative'
                                    }}
                                >
                                    {/* Featured indicator */}
                                    <Box 
                                        sx={{ 
                                            position: 'absolute', 
                                            top: 10, 
                                            right: 10, 
                                            zIndex: 1, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            backgroundColor: 'rgba(0,0,0,0.6)', 
                                            borderRadius: 10,
                                            px: 1,
                                            py: 0.5
                                        }}
                                    >
                                        <StarIcon sx={{ color: 'gold', fontSize: '0.8rem', mr: 0.5 }} />
                                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                                            Featured
                                        </Typography>
                                    </Box>
                                    
                                    {/* Image with improved styling */}
                                    <Box 
                                        sx={{ 
                                            position: 'relative', 
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5' 
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height={240}
                                            image={formatImageUrl(product.images[0]?.image_url)}
                                            alt={product.name}
                                            sx={{ 
                                                objectFit: 'contain', 
                                                transition: 'transform 0.5s',
                                                p: 2,
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                    </Box>
                                    
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Typography 
                                            variant="subtitle1" 
                                            component="h3" 
                                            sx={{ 
                                                fontWeight: 600, 
                                                mb: 1,
                                                fontSize: '1.1rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: 'vertical'
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                height: '2.5rem'
                                            }}
                                        >
                                            {product.description}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                            {product.sale_price ? (
                                                <Box>
                                                    <Typography 
                                                        component="span" 
                                                        sx={{ 
                                                            color: 'text.secondary', 
                                                            textDecoration: 'line-through',
                                                            fontSize: '0.9rem',
                                                            mr: 1
                                                        }}
                                                    >
                                                        ${product.base_price}
                                                    </Typography>
                                                    <Typography 
                                                        variant="h6" 
                                                        component="span" 
                                                        color="error.main" 
                                                        sx={{ fontWeight: 700 }}
                                                    >
                                                        ${product.sale_price}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography 
                                                    variant="h6" 
                                                    color="primary.main" 
                                                    sx={{ fontWeight: 700 }}
                                                >
                                                    ${product.base_price}
                                                </Typography>
                                            )}
                                            <Chip 
                                                label={product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'} 
                                                size="small"
                                                color={product.stock_quantity > 0 ? 'success' : 'error'}
                                                variant="outlined"
                                            />
                                        </Box>
                                    </CardContent>
                                    
                                    <Divider />
                                    
                                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                        <Button 
                                            size="small" 
                                            component={Link} 
                                            to={`/products/${product.product_id}`}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{ fontWeight: 500 }}
                                        >
                                            View Details
                                        </Button>
                                        <Button 
                                            size="small" 
                                            color="primary"
                                            variant="contained"
                                            disabled={product.stock_quantity <= 0}
                                            onClick={() => handleAddToCart(product)}
                                            startIcon={<ShoppingCartIcon />}
                                            sx={{ 
                                                borderRadius: 6,
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            Add to Cart
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info" sx={{ mb: 4 }}>
                        No featured products available at the moment.
                    </Alert>
                )}
                
                <Box sx={{ textAlign: 'center', mt: 4, mb: 8 }}>
                    <Button 
                        component={Link} 
                        to="/products" 
                        variant="outlined" 
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ 
                            borderRadius: 6,
                            px: 4,
                            py: 1.2,
                            borderWidth: 2,
                            '&:hover': {
                                borderWidth: 2
                            }
                        }}
                    >
                        View All Products
                    </Button>
                </Box>
            </Container>

            {/* Categories Section - Improved visuals */}
            <Box 
                sx={{ 
                    py: 10, 
                    mb: 8, 
                    background: 'linear-gradient(180deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ mb: 8, textAlign: 'center' }}>
                        <Chip 
                            label="COLLECTIONS" 
                            size="small" 
                            color="secondary" 
                            sx={{ mb: 2, fontWeight: 500 }}
                        />
                        <Typography 
                            variant="h3" 
                            component="h2" 
                            sx={{ 
                                mb: 1,
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                fontSize: { xs: '1.75rem', sm: '2.5rem' }
                            }}
                        >
                            Shop by Category
                        </Typography>
                        <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            sx={{ 
                                maxWidth: '700px', 
                                mx: 'auto', 
                                mb: 2
                            }}
                        >
                            Browse our carefully curated collections to find the perfect piece for any occasion
                        </Typography>
                        <Divider sx={{ width: '60px', margin: '20px auto', borderColor: 'secondary.main', borderWidth: 2 }} />
                    </Box>
                    
                    {categoriesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : categoriesError ? (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            Error loading categories: {categoriesErrorMsg instanceof Error ? categoriesErrorMsg.message : 'Unknown error'}
                        </Alert>
                    ) : categories.length > 0 ? (
                        <Grid container spacing={4}>
                            {categories.map((category, index) => (
                                <Grid item key={category.id} xs={12} sm={6} md={4}>
                                    <Card
                                        component={Link}
                                        to={`/products?category=${category.id}`}
                                        sx={{
                                            height: 260,
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            backgroundImage: `url(${formatImageUrl(category.image_url || undefined)})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            color: 'white',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            textDecoration: 'none',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                            transition: 'all 0.4s ease',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                                                zIndex: 1
                                            },
                                            '&:hover': {
                                                transform: 'translateY(-10px)',
                                                boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                p: 3,
                                                position: 'relative',
                                                zIndex: 2,
                                                width: '100%'
                                            }}
                                        >
                                            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                                                {category.name}
                                            </Typography>
                                            {category.description && (
                                                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                                                    {category.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info" sx={{ mb: 4 }}>
                            No categories available at the moment.
                        </Alert>
                    )}
                </Container>
            </Box>
            
            {/* Testimonial Section */}
            <Container maxWidth="md" sx={{ mb: 10, textAlign: 'center' }}>
                <Box sx={{ 
                    p: 6, 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    borderRadius: 4,
                    position: 'relative'
                }}>
                    <Typography 
                        variant="h2" 
                        sx={{ 
                            fontSize: '5rem', 
                            color: 'primary.main', 
                            opacity: 0.2,
                            position: 'absolute',
                            top: 10,
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        "
                    </Typography>
                    <Typography 
                        variant="h5" 
                        component="blockquote" 
                        sx={{ 
                            fontStyle: 'italic',
                            fontWeight: 300,
                            maxWidth: '700px',
                            mx: 'auto',
                            mb: 4,
                            pt: 4,
                            zIndex: 1,
                            position: 'relative'
                        }}
                    >
                        The craftsmanship of each piece is exquisite. I've received so many compliments on my necklace, 
                        and I love knowing that it was ethically sourced and handcrafted.
                    </Typography>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600}>Emily Johnson</Typography>
                        <Typography variant="body2" color="text.secondary">Verified Customer</Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default HomePage; 