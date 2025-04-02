import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Rating, Button, CardActionArea, Chip } from '@mui/material';
import { ShoppingCart, Star as StarIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useBasket } from '../hooks/useBasket';
import { formatImageUrl, getPrimaryImageUrl } from '../utils/imageUtils';

interface ProductCardProps {
  product: any;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { addItem } = useBasket();
  
  // Use utility function to get formatted image URL
  const formattedImageUrl = getPrimaryImageUrl(product.images);
  
  // Calculate discount percentage if sale price exists and both prices are valid numbers
  const hasDiscount = typeof product.sale_price === 'number' && 
                      typeof product.base_price === 'number' && 
                      product.sale_price < product.base_price;
  
  const discountPercentage = hasDiscount
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding to basket from ProductCard:', product);
    
    addItem({
      id: product.product_id,
      name: product.name,
      price: parseFloat(String(product.sale_price || product.base_price)),
      image_url: product.images && product.images.length > 0 
        ? product.images[0].image_url 
        : undefined
    });
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {hasDiscount && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'error.main',
            color: 'white',
            borderRadius: '4px',
            padding: '4px 8px',
            fontWeight: 'bold',
            zIndex: 1
          }}
        >
          {discountPercentage}% OFF
        </Box>
      )}
      
      <CardActionArea component={Link} to={`/products/${product.product_id}`}>
        <CardMedia
          component="img"
          height={compact ? 140 : 200}
          image={formattedImageUrl}
          alt={product.name}
          sx={{
            objectFit: 'contain',
            bgcolor: 'grey.100',
            p: 1
          }}
        />
        <CardContent sx={{ flexGrow: 1, pb: compact ? 1 : undefined }}>
          <Typography gutterBottom variant={compact ? "body1" : "h6"} component="div" noWrap>
            {product.name}
            {product.is_featured && (
              <StarIcon 
                fontSize="small" 
                color="primary" 
                sx={{ ml: 0.5, verticalAlign: 'middle' }} 
              />
            )}
          </Typography>
          
          {!compact && (
            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {product.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box>
              {hasDiscount ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant={compact ? "body1" : "h6"} color="error.main" fontWeight="bold">
                    ${typeof product.sale_price === 'number' ? product.sale_price.toFixed(2) : '0.00'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ ml: 1, textDecoration: 'line-through' }}
                  >
                    ${typeof product.base_price === 'number' ? product.base_price.toFixed(2) : '0.00'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant={compact ? "body1" : "h6"} fontWeight="bold">
                  ${typeof product.base_price === 'number' ? product.base_price.toFixed(2) : '0.00'}
                </Typography>
              )}
            </Box>
            
            {!compact && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleAddToBasket}
                startIcon={<ShoppingCart />}
                sx={{ minWidth: 'auto' }}
                disabled={product.stock_quantity <= 0}
              >
                Add
              </Button>
            )}
          </Box>
          
          {product.stock_quantity <= 0 && (
            <Chip 
              label="Out of Stock" 
              color="error" 
              size="small" 
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard; 