import React from 'react';
import { Card, CardContent, CardActions, CardMedia, Typography, Box, Button, Rating, Chip } from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useBasket } from '../hooks/useBasket';
import { formatImageUrl, getPrimaryImageUrl } from '../utils/imageUtils';

// Helper function to safely format price
const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined) return '0.00';
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (typeof numericPrice !== 'number' || isNaN(numericPrice)) {
    return '0.00';
  }
  
  return numericPrice.toFixed(2);
};

// Calculate discount percentage
const calculateDiscount = (basePrice: any, salePrice: any): number => {
  const base = parseFloat(String(basePrice));
  const sale = parseFloat(String(salePrice));
  
  if (isNaN(base) || isNaN(sale) || base <= 0 || sale >= base) return 0;
  
  return Math.round(((base - sale) / base) * 100);
};

interface ProductCardProps {
  product: any;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true }) => {
  const { addItem } = useBasket();
  
  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure price is properly parsed
    const price = typeof product.sale_price === 'string' 
      ? parseFloat(product.sale_price) 
      : typeof product.sale_price === 'number' 
        ? product.sale_price 
        : typeof product.base_price === 'string'
          ? parseFloat(product.base_price)
          : product.base_price;
          
    addItem({
      id: product.product_id,
      name: product.name,
      price: price,
      image_url: product.images && product.images.length > 0 ? formatImageUrl(product.images[0].image_url) : undefined
    });
  };
  
  // Use getPrimaryImageUrl to get the proper formatted image URL
  const imageUrl = getPrimaryImageUrl(product.images);
  
  const isOnSale = product.sale_price && parseFloat(String(product.sale_price)) < parseFloat(String(product.base_price));
  
  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
      component={Link}
      to={`/products/${product.product_id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          pt: '100%', // 1:1 aspect ratio
          overflow: 'hidden'
        }}
      >
        <CardMedia
          component="img"
          image={imageUrl}
          alt={product.name}
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
        {isOnSale && (
          <Chip
            label={`${calculateDiscount(product.base_price, product.sale_price)}% OFF`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              fontWeight: 'bold'
            }}
          />
        )}
        {product.featured && (
          <Chip
            label="Featured"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: isOnSale ? 45 : 10,
              right: 10,
              fontWeight: 'bold'
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" noWrap>{product.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1, mb: 0.5 }}>
          {isOnSale ? (
            <>
              <Typography variant="h6" color="error" fontWeight="bold">
                ${formatPrice(product.sale_price)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ ml: 1, textDecoration: 'line-through' }}
              >
                ${formatPrice(product.base_price)}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" fontWeight="bold">
              ${formatPrice(product.base_price)}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="body2" 
              color={product.stock_quantity > 0 ? 'success.main' : 'error.main'}
            >
              {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      {showAddToCart && (
        <CardActions sx={{ pt: 0 }}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<AddShoppingCart />}
            onClick={handleAddToBasket}
            disabled={product.stock_quantity <= 0}
            sx={{ borderRadius: '0 0 4px 4px' }}
          >
            Add to Cart
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProductCard; 