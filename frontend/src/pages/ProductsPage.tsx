import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Button,
  Box,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Drawer,
  IconButton,
  useMediaQuery,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Close, 
  FavoriteBorder, 
  ShoppingCart,
  Star,
  StarBorder,
  Sort,
  SortByAlpha
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useCart } from '../contexts/CartContext';
import { SelectChangeEvent } from '@mui/material';

// Sample category data
const categories = [
  { id: 1, name: 'Rings' },
  { id: 2, name: 'Necklaces' },
  { id: 3, name: 'Earrings' },
  { id: 4, name: 'Bracelets' },
  { id: 5, name: 'Watches' }
];

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Diamond Engagement Ring',
    description: 'Beautiful 1 carat diamond ring set in 14k white gold',
    base_price: 2499.99,
    sale_price: 1999.99,
    images: [{ image_url: 'https://placehold.co/400x300?text=Diamond+Ring' }],
    categories: [{ category_id: 1, name: 'Rings' }],
    rating: 4.8,
    reviews: 24
  },
  {
    id: 2,
    name: 'Pearl Necklace',
    description: 'Elegant pearl necklace with sterling silver clasp',
    base_price: 899.99,
    sale_price: null,
    images: [{ image_url: 'https://placehold.co/400x300?text=Pearl+Necklace' }],
    categories: [{ category_id: 2, name: 'Necklaces' }],
    rating: 4.5,
    reviews: 16
  },
  {
    id: 3,
    name: 'Gold Hoop Earrings',
    description: 'Classic 14k gold hoop earrings',
    base_price: 399.99,
    sale_price: 349.99,
    images: [{ image_url: 'https://placehold.co/400x300?text=Gold+Earrings' }],
    categories: [{ category_id: 3, name: 'Earrings' }],
    rating: 4.7,
    reviews: 32
  },
  {
    id: 4,
    name: 'Silver Tennis Bracelet',
    description: 'Elegant silver bracelet with cubic zirconia',
    base_price: 599.99,
    sale_price: null,
    images: [{ image_url: 'https://placehold.co/400x300?text=Tennis+Bracelet' }],
    categories: [{ category_id: 4, name: 'Bracelets' }],
    rating: 4.6,
    reviews: 18
  },
  {
    id: 5,
    name: 'Luxury Watch',
    description: 'Precision timepiece with leather band',
    base_price: 3999.99,
    sale_price: 3499.99,
    images: [{ image_url: 'https://placehold.co/400x300?text=Luxury+Watch' }],
    categories: [{ category_id: 5, name: 'Watches' }],
    rating: 4.9,
    reviews: 42
  },
  {
    id: 6,
    name: 'Sapphire Ring',
    description: 'Beautiful blue sapphire surrounded by diamonds',
    base_price: 1899.99,
    sale_price: null,
    images: [{ image_url: 'https://placehold.co/400x300?text=Sapphire+Ring' }],
    categories: [{ category_id: 1, name: 'Rings' }],
    rating: 4.7,
    reviews: 14
  },
  {
    id: 7,
    name: 'Diamond Pendant',
    description: 'Stunning diamond pendant on 18k gold chain',
    base_price: 1299.99,
    sale_price: 999.99,
    images: [{ image_url: 'https://placehold.co/400x300?text=Diamond+Pendant' }],
    categories: [{ category_id: 2, name: 'Necklaces' }],
    rating: 4.8,
    reviews: 26
  },
  {
    id: 8,
    name: 'Ruby Stud Earrings',
    description: 'Beautiful ruby studs set in 14k gold',
    base_price: 799.99,
    sale_price: null,
    images: [{ image_url: 'https://placehold.co/400x300?text=Ruby+Earrings' }],
    categories: [{ category_id: 3, name: 'Earrings' }],
    rating: 4.6,
    reviews: 22
  }
];

const ProductsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const pageSize = 6; // Number of products per page
  
  // Get query params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    const sortParam = params.get('sort');
    
    if (pageParam) setPage(parseInt(pageParam));
    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(parseInt(categoryParam));
    if (sortParam) setSortBy(sortParam);
  }, [location.search]);
  
  // Update URL with current filters
  useEffect(() => {
    navigate({
      pathname: location.pathname,
      search: `?page=${page}${searchQuery ? `&search=${searchQuery}` : ''}${selectedCategory ? `&category=${selectedCategory}` : ''}${sortBy ? `&sort=${sortBy}` : ''}`
    }, { replace: true });
  }, [page, searchQuery, selectedCategory, sortBy, navigate, location.pathname]);
  
  // Filter products based on current filters
  const filteredProducts = mockProducts.filter(product => {
    // Search filter
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = !selectedCategory || 
      product.categories.some(cat => cat.category_id === selectedCategory);
    
    // Price filter
    const price = product.sale_price || product.base_price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.sale_price || a.base_price) - (b.sale_price || b.base_price);
      case 'price_high':
        return (b.sale_price || b.base_price) - (a.sale_price || a.base_price);
      case 'rating':
        return b.rating - a.rating;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'newest':
      default:
        return b.id - a.id;
    }
  });
  
  // Paginate products
  const paginatedProducts = sortedProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  // Total pages for pagination
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
  };
  
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };
  
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
    setPage(1);
  };
  
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };
  
  const handlePriceRangeChangeCommitted = () => {
    setPage(1);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('newest');
    setPriceRange([0, 5000]);
    setPage(1);
  };
  
  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };
  
  const handleAddToCart = (product: any, event: React.MouseEvent) => {
    event.stopPropagation();
    addToCart(product, 1);
  };
  
  const renderFilters = () => (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      p: isMobile ? 2 : 0
    }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={toggleFilters}>
            <Close />
          </IconButton>
        </Box>
      )}
      
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Categories
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'contained' : 'text'}
              size="small"
              onClick={() => handleCategoryChange(selectedCategory === category.id ? null : category.id)}
              sx={{ 
                justifyContent: 'flex-start',
                textTransform: 'none',
                px: 1
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>
      </Box>
      
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Price Range
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            onChangeCommitted={handlePriceRangeChangeCommitted}
            min={0}
            max={5000}
            step={100}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `$${value}`}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ${priceRange[0]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ${priceRange[1]}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {isMobile && (
        <Button variant="contained" fullWidth onClick={toggleFilters}>
          Apply Filters
        </Button>
      )}
      
      <Button 
        variant="outlined" 
        onClick={clearFilters}
        sx={{ mt: isMobile ? 1 : 'auto' }}
        fullWidth={isMobile}
      >
        Clear All
      </Button>
    </Box>
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Jewelry Collection
        </Typography>
        
        {!isMobile && (
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              placeholder="Search jewelry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ width: 250 }}
            />
            <Button type="submit" variant="contained">Search</Button>
          </Box>
        )}
      </Box>
      
      {isMobile && (
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <TextField
            placeholder="Search jewelry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" edge="end">
                    <Search />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      )}
      
      <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          startIcon={<FilterList />}
          onClick={toggleFilters}
          variant={showFilters && isMobile ? 'contained' : 'outlined'}
          sx={{ display: { md: 'none' } }}
        >
          Filters
        </Button>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price_low">Price: Low to High</MenuItem>
            <MenuItem value="price_high">Price: High to Low</MenuItem>
            <MenuItem value="rating">Top Rated</MenuItem>
            <MenuItem value="name_asc">Name: A to Z</MenuItem>
            <MenuItem value="name_desc">Name: Z to A</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedProducts.length} of {filteredProducts.length} products
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Filters - Desktop */}
        <Grid 
          item 
          md={3} 
          sx={{ 
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Paper 
            sx={{ 
              p: 2,
              position: 'sticky',
              top: 16,
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto'
            }}
          >
            {renderFilters()}
          </Paper>
        </Grid>
        
        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : paginatedProducts.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No products found matching your criteria. Try adjusting your filters.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {paginatedProducts.map(product => (
                <Grid item key={product.id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.sale_price && (
                      <Chip 
                        label={`${Math.round((1 - product.sale_price / product.base_price) * 100)}% OFF`}
                        color="primary"
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          left: 8, 
                          zIndex: 1,
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.images[0].image_url}
                      alt={product.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1
                      }}>
                        {product.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {[...Array(5)].map((_, i) => (
                          i < Math.floor(product.rating) ? 
                            <Star key={i} fontSize="small" color="primary" /> :
                            i < product.rating ?
                              <Star key={i} fontSize="small" color="primary" sx={{ opacity: 0.5 }} /> :
                              <StarBorder key={i} fontSize="small" color="primary" />
                        ))}
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({product.reviews})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        {product.sale_price ? (
                          <>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ${product.sale_price.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                              ${product.base_price.toFixed(2)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            ${product.base_price.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Button 
                        size="small" 
                        onClick={(e) => e.stopPropagation()}
                        component={Link}
                        to={`/products/${product.id}`}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small" 
                        color="primary" 
                        startIcon={<ShoppingCart />}
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={showFilters && isMobile}
        onClose={toggleFilters}
        sx={{
          '& .MuiDrawer-paper': {
            height: 'auto',
            maxHeight: '90%'
          }
        }}
      >
        {renderFilters()}
      </Drawer>
    </Container>
  );
};

export default ProductsPage; 