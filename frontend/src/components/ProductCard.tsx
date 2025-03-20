import React from 'react';
import { 
  Card, 
  CardActionArea, 
  CardActions, 
  CardContent, 
  CardMedia, 
  Button, 
  Typography, 
  Box 
} from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Product } from '../interfaces';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // Find primary image or use first image or placeholder
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://placehold.co/400x300?text=No+Image';
  
  // Calculate discount percentage if sale price exists
  const hasDiscount = product.sale_price !== undefined && product.sale_price < product.base_price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
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
            fontWeight: 'bold',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            zIndex: 1,
          }}
        >
          {discountPercentage}% OFF
        </Box>
      )}
      
      <CardActionArea component={Link} to={`/products/${product.product_id}`} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="200"
          image={primaryImage}
          alt={product.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: '40px', overflow: 'hidden' }}>
            {product.description.substring(0, 80)}...
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasDiscount ? (
              <>
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  ${product.sale_price?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ${product.base_price.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography variant="h6" fontWeight="bold">
                ${product.base_price.toFixed(2)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          fullWidth
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard; 