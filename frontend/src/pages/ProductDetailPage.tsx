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
  Link as MuiLink
} from '@mui/material';
import { 
  AddShoppingCart, 
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productsAPI.getOne(parseInt(id)) : Promise.reject('No product ID'),
    enabled: !!id
  });

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0 && product && value <= product.stock_quantity) {
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
    if (product && product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.is_primary);
      setSelectedImage(primaryImage?.image_id || 0);
    }
  }, [product]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return <Alert severity="error">Error loading product details</Alert>;
  }

  return (
    <Box sx={{ py: 4 }}>
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
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: 400,
              bgcolor: 'grey.100'
            }}
          >
            <img 
              src={product.images[selectedImage]?.image_url || (product.images.length > 0 ? product.images[0].image_url : 'https://placehold.co/600x400?text=No+Image')} 
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </Paper>

          {product.images.length > 1 && (
            <ImageList cols={4} rowHeight={80} gap={8}>
              {product.images.map((image, index) => (
                <ImageListItem 
                  key={image.image_id}
                  onClick={() => setSelectedImage(index)}
                  sx={{ 
                    cursor: 'pointer', 
                    border: selectedImage === index ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: 1
                  }}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>

          <Box sx={{ mb: 3 }}>
            {product.categories && product.categories.map(category => (
              <Chip
                key={category.category_id}
                label={category.name}
                size="small"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            {product.sale_price !== undefined && product.sale_price < product.base_price ? (
              <>
                <Typography variant="h4" color="error" fontWeight="bold">
                  ${product.sale_price.toFixed(2)}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ textDecoration: 'line-through' }}
                >
                  ${product.base_price.toFixed(2)}
                </Typography>
                <Chip 
                  label={`${Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)}% OFF`} 
                  color="error" 
                  size="small" 
                />
              </>
            ) : (
              <Typography variant="h4" fontWeight="bold">
                ${product.base_price.toFixed(2)}
              </Typography>
            )}
          </Box>

          <Typography variant="subtitle1" color={product.stock_quantity > 0 ? 'success.main' : 'error.main'} sx={{ mb: 2 }}>
            {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            {product.stock_quantity > 0 && product.stock_quantity < 10 && ` (Only ${product.stock_quantity} left)`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" sx={{ mb: 3 }}>
            {product.description}
          </Typography>

          {/* Product attributes */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100', width: '40%' }}>
                    SKU
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                </TableRow>
                {product.metal_type && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100' }}>
                      Metal Type
                    </TableCell>
                    <TableCell>{product.metal_type}</TableCell>
                  </TableRow>
                )}
                {product.gemstone_type && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100' }}>
                      Gemstone
                    </TableCell>
                    <TableCell>{product.gemstone_type}</TableCell>
                  </TableRow>
                )}
                {product.weight && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100' }}>
                      Weight
                    </TableCell>
                    <TableCell>{product.weight} g</TableCell>
                  </TableRow>
                )}
                {product.dimensions && (
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ bgcolor: 'grey.100' }}>
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
              InputProps={{ inputProps: { min: 1, max: product.stock_quantity } }}
              size="small"
              sx={{ width: 100 }}
              disabled={product.stock_quantity === 0}
            />
            <Button
              variant="contained"
              startIcon={<AddShoppingCart />}
              size="large"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              sx={{ px: 4 }}
            >
              Add to Cart
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage; 