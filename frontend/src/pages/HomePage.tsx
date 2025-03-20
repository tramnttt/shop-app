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
          borderRadius: 2,
          mb: 6
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
            sx={{ mt: 2 }}
          >
            Shop Now
          </Button>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Container>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
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
                  transition: '0.3s',
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
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    ${product.price.toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/products/${product.id}`}
                  >
                    View Details
                  </Button>
                  <Button size="small" color="primary">
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
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={4}>
          {['Necklaces', 'Earrings', 'Bracelets', 'Rings'].map((category) => (
            <Grid item key={category} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `url(https://via.placeholder.com/300x200?text=${category})`,
                  backgroundSize: 'cover',
                  color: 'white',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                  },
                  '&:hover': {
                    transform: 'scale(1.03)',
                    transition: 'transform 0.3s ease',
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {category}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage; 