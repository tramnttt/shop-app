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
  Divider,
  FormControlLabel,
  Checkbox,
  SelectChangeEvent
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
  SortByAlpha,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useBasket } from '../hooks/useBasket';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { formatImageUrl } from '../utils/imageUtils';
import ProductCard from '../components/ProductCard';

const ProductsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useBasket();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6; // Number of products per page
  
  // Fetch categories from API
  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading 
  } = useCategories();
  
  // Fetch products from API with filters
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts
  } = useProducts({
    page,
    limit: pageSize,
    search: searchQuery || undefined,
    categoryId: selectedCategory || undefined,
    featured: showFeaturedOnly || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined
  });
  
  // Get query params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    const featuredParam = params.get('featured');
    const sortParam = params.get('sort');
    
    if (pageParam) setPage(parseInt(pageParam));
    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategory(parseInt(categoryParam));
    if (featuredParam) setShowFeaturedOnly(featuredParam === 'true');
    if (sortParam) setSortBy(sortParam);
  }, [location.search]);
  
  // Update URL with current filters
  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (page > 1) searchParams.set('page', page.toString());
    if (searchQuery) searchParams.set('search', searchQuery);
    if (selectedCategory) searchParams.set('category', selectedCategory.toString());
    if (showFeaturedOnly) searchParams.set('featured', 'true');
    if (sortBy && sortBy !== 'newest') searchParams.set('sort', sortBy);
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString() ? `?${searchParams.toString()}` : ''
    }, { replace: true });
  }, [page, searchQuery, selectedCategory, showFeaturedOnly, sortBy, navigate, location.pathname]);
  
  // Sort products (client-side sorting, as server might not support all sort options)
  const sortedProducts = productsData?.products ? [...productsData.products].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return parseFloat(String(a.sale_price || a.base_price)) - parseFloat(String(b.sale_price || b.base_price));
      case 'price_high':
        return parseFloat(String(b.sale_price || b.base_price)) - parseFloat(String(a.sale_price || a.base_price));
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'newest':
      default:
        // Default to server-provided order, which is usually newest first
        return 0;
    }
  }) : [];
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    refetchProducts();
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
    refetchProducts();
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setShowFeaturedOnly(false);
    setSortBy('newest');
    setPriceRange([0, 5000]);
    setPage(1);
    refetchProducts();
  };
  
  const handleAddToBasket = (product: any, event: React.MouseEvent) => {
    event.stopPropagation();

    if (product && product.product_id) {
      // Ensure the price is properly parsed as a number
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
        image_url: product.images && product.images.length > 0 
          ? product.images[0].image_url 
          : undefined
      });
    }
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
          {categoriesLoading ? (
            <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2 }} />
          ) : categoriesData.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No categories found</Typography>
          ) : (
            categoriesData.map(category => (
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
            ))
          )}
        </Box>
      </Box>
      
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Featured Items
        </Typography>
        <Button
          variant={showFeaturedOnly ? 'contained' : 'outlined'}
          size="small"
          startIcon={<Star />}
          onClick={() => {
            setShowFeaturedOnly(!showFeaturedOnly);
            setPage(1);
            setTimeout(() => refetchProducts(), 0);
          }}
          sx={{ justifyContent: 'flex-start' }}
        >
          {showFeaturedOnly ? 'Featured Only' : 'Show Featured'}
        </Button>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
            <MenuItem value="name_asc">Name: A to Z</MenuItem>
            <MenuItem value="name_desc">Name: Z to A</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Typography variant="body2" color="text.secondary">
          {productsData ? 
            `Showing ${sortedProducts.length} of ${productsData.totalCount} products` : 
            'Loading products...'}
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
          {productsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : productsError ? (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => refetchProducts()}>
                  Try Again
                </Button>
              }
            >
              Error loading products. Please try again.
            </Alert>
          ) : sortedProducts.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No products found matching your criteria. Try adjusting your filters.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {sortedProducts.map(product => (
                <Grid item key={product.product_id} xs={12} sm={6} md={4}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
          
          {productsData && productsData.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={productsData.totalPages} 
                page={productsData.currentPage} 
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