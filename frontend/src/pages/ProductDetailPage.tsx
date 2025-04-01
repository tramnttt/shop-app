import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Breadcrumbs,
  TextField,
  Stack,
  ImageList,
  ImageListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Link as MuiLink,
  Container,
  IconButton,
  Tooltip,
  Rating,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  AddShoppingCart, 
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  FavoriteBorder,
  Favorite,
  Share,
  Star,
  LocalShipping,
  Security,
  Support,
  ArrowBack
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/productService';
import { formatImageUrl } from '../utils/imageUtils';
import { useProduct } from '../hooks/useProducts';

// Utility function to format price safely
const formatPrice = (price: number | null | undefined): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0.00';
  }
  return price.toFixed(2);
};

// Utility function to calculate discount percentage safely
const calculateDiscountPercentage = (basePrice: number | null | undefined, salePrice: number | null | undefined): number => {
  if (typeof basePrice !== 'number' || typeof salePrice !== 'number' || basePrice <= 0) {
    return 0;
  }
  return Math.round(((basePrice - salePrice) / basePrice) * 100);
};

// Utility function to get image URL safely
const getSafeImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return 'https://placehold.co/600x400?text=No+Image';
  }
  return formatImageUrl(imageUrl);
};

// Utility to safely check stock quantity
const hasStock = (product: any): boolean => {
  return typeof product.stock_quantity === 'number' && product.stock_quantity > 0;
};

const getLowStockMessage = (product: any): string | null => {
  if (typeof product.stock_quantity === 'number' && product.stock_quantity > 0 && product.stock_quantity < 10) {
    return ` (Only ${product.stock_quantity} left)`;
  }
  return null;
};

// Define types for Product data
interface ProductCategory {
  category_id: number;
  name: string;
}

interface ProductImage {
  image_id?: number;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
}

// Safely get categories
const getProductCategories = (product: any): ProductCategory[] => {
  if (!product.categories) return [];
  return product.categories;
};

// Utility function to safely check if a property exists and has a value
const hasPropertyValue = (product: any, property: string): boolean => {
  return product && 
    property in product && 
    product[property] !== null && 
    product[property] !== undefined &&
    product[property] !== '';
};

// Get product images safely
const getProductImages = (product: any): ProductImage[] => {
  if (!product || !product.images || !Array.isArray(product.images)) return [];
  return product.images;
};

const ProductDetailPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Use the useProduct hook to fetch product data
  const { 
    data: product, 
    isLoading, 
    error, 
    isError,
    refetch
  } = useProduct(id ? parseInt(id) : 0);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0 && product && hasStock(product) && value <= product.stock_quantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  // Set first or primary image as selected when product is loaded
  React.useEffect(() => {
    if (product) {
      const images = getProductImages(product);
      if (images.length > 0) {
        const primaryIndex = images.findIndex(img => img.is_primary);
        setSelectedImageIndex(primaryIndex !== -1 ? primaryIndex : 0);
      }
    }
  }, [product]);

  // Show loading indicator
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error message
  if (isError || !product) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to load product';

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ my: 4 }}
          action={
            <Button color="inherit" component={RouterLink} to="/products">
              Back to Products
            </Button>
          }
        >
          {isError ? `Error: ${errorMessage}` : 'Product not found or has been removed.'}
          {isError && (
            <Button 
              size="small" 
              sx={{ ml: 2 }} 
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  // Get the main image URL
  const images = getProductImages(product);
  const mainImageUrl = images.length > 0 
    ? (selectedImageIndex < images.length 
        ? images[selectedImageIndex].image_url 
        : images[0].image_url)
    : 'https://placehold.co/600x400?text=No+Image';

  // Format the main image URL
  const formattedMainImageUrl = getSafeImageUrl(mainImageUrl);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        component={RouterLink}
        to="/products"
        sx={{ mb: 2 }}
      >
        Back to Products
      </Button>

      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 4 }}
      >
        <MuiLink
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </MuiLink>
        <MuiLink
          component={RouterLink}
          to="/products"
          color="inherit"
        >
          Products
        </MuiLink>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={6}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={500}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 2, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: isMobile ? 300 : 400,
                bgcolor: 'grey.100',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img 
                src={formattedMainImageUrl} 
                alt={product.name}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  transition: 'transform 0.3s ease-in-out'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  gap: 1,
                  zIndex: 1
                }}
              >
                <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                  <IconButton 
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{ 
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton 
                    sx={{ 
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Fade>

          {images.length > 1 && (
            <ImageList cols={4} rowHeight={80} gap={8}>
              {images.map((image, index) => (
                <Zoom in key={image.image_id || index} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                  <ImageListItem 
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{ 
                      cursor: 'pointer', 
                      border: selectedImageIndex === index ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <img
                      src={getSafeImageUrl(image.image_url)}
                      alt={image.alt_text || product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </ImageListItem>
                </Zoom>
              ))}
            </ImageList>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={4.5} precision={0.5} readOnly sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  (12 reviews)
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                {getProductCategories(product).length > 0 ? (
                  getProductCategories(product).map((category: ProductCategory) => (
                    <Chip
                      key={category.category_id}
                      label={category.name}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No categories
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                {typeof product.sale_price === 'number' && product.sale_price < product.base_price ? (
                  <>
                    <Typography variant="h4" color="error" fontWeight="bold">
                      ${formatPrice(product.sale_price)}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      sx={{ textDecoration: 'line-through' }}
                    >
                      ${formatPrice(product.base_price)}
                    </Typography>
                    <Chip 
                      label={`${calculateDiscountPercentage(product.base_price, product.sale_price)}% OFF`} 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </>
                ) : (
                  <Typography variant="h4" fontWeight="bold">
                    ${formatPrice(product.base_price)}
                  </Typography>
                )}
              </Box>

              <Typography 
                variant="subtitle1" 
                color={hasStock(product) ? 'success.main' : 'error.main'} 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {hasStock(product) ? (
                  <>
                    <span>In Stock</span>
                    {getLowStockMessage(product)}
                  </>
                ) : (
                  'Out of Stock'
                )}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                {product.description}
              </Typography>

              {/* Product attributes */}
              <TableContainer 
                component={Paper} 
                variant="outlined" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100', width: '40%', fontWeight: 600 }}>
                        SKU
                      </TableCell>
                      <TableCell>{product.sku || 'N/A'}</TableCell>
                    </TableRow>
                    {hasPropertyValue(product, 'metal_type') && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>
                          Metal Type
                        </TableCell>
                        <TableCell>{product.metal_type}</TableCell>
                      </TableRow>
                    )}
                    {hasPropertyValue(product, 'gemstone_type') && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>
                          Gemstone
                        </TableCell>
                        <TableCell>{product.gemstone_type}</TableCell>
                      </TableRow>
                    )}
                    {hasPropertyValue(product, 'weight') && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>
                          Weight
                        </TableCell>
                        <TableCell>{product.weight} g</TableCell>
                      </TableRow>
                    )}
                    {hasPropertyValue(product, 'dimensions') && (
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100', fontWeight: 600 }}>
                          Dimensions
                        </TableCell>
                        <TableCell>{product.dimensions}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Add to cart section */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 4 }}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  InputProps={{ 
                    inputProps: { 
                      min: 1, 
                      max: hasStock(product) ? product.stock_quantity : 1 
                    } 
                  }}
                  size="small"
                  sx={{ width: 100 }}
                  disabled={!hasStock(product)}
                />
                <Button
                  variant="contained"
                  startIcon={<AddShoppingCart />}
                  size="large"
                  onClick={handleAddToCart}
                  disabled={!hasStock(product)}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Add to Cart
                </Button>
              </Stack>

              {/* Features */}
              <Box sx={{ mt: 6, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShipping color="primary" />
                  <Typography variant="body2">Free Shipping</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security color="primary" />
                  <Typography variant="body2">Secure Payment</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Support color="primary" />
                  <Typography variant="body2">24/7 Support</Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage; 