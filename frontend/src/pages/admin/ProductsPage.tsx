import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  Stack,
  Checkbox,
  FormControlLabel,
  ListItemText,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Product, ProductImage } from '../../services/productService';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  // Fetch products with filters
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useProducts({
    page,
    limit,
    search: searchQuery,
    categoryId: selectedCategories.length === 1 ? selectedCategories[0] : undefined
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useCategories();
  
  // Delete product mutation
  const deleteProduct = useDeleteProduct();

  // URL params handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const searchParam = params.get('search');
    const categoryParam = params.get('category');

    if (pageParam) setPage(parseInt(pageParam));
    if (searchParam) setSearchQuery(searchParam);
    if (categoryParam) setSelectedCategories([parseInt(categoryParam)]);
  }, []);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategories.length === 1) params.set('category', selectedCategories[0].toString());
    
    const newURL = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
    window.history.replaceState({}, '', newURL);
  }, [page, searchQuery, selectedCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    refetch();
  };

  const handleCategoryChange = (event: SelectChangeEvent<number[]>) => {
    setSelectedCategories(event.target.value as number[]);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setOpenDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Refresh products data after dialog closes
    refetch();
  };

  const handleDialogSuccess = () => {
    // Close the dialog and refresh the product list
    setOpenDialog(false);
    
    // Immediately invalidate queries and then refetch after a short delay
    // This ensures we get fresh data from the server
    refetch({ throwOnError: false });
    
    // Use a slightly longer timeout to ensure the backend has processed everything
    setTimeout(() => {
      refetch({ throwOnError: false });
    }, 500);
  };

  const handleDeleteClick = (product: Product) => {
    setConfirmDelete(product);
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteProduct.mutateAsync(confirmDelete.product_id);
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    return `$${Number(price).toFixed(2)}`;
  };

  // Render single product image thumbnail or placeholder
  const renderProductImage = (product: Product) => {
    const primaryImage = product.images?.find(img => img.is_primary);
    const firstImage = product.images?.[0];
    
    // Get image URL and ensure it has the full backend URL if it's a relative path
    let imageUrl = primaryImage?.image_url || firstImage?.image_url || 'https://placehold.co/100x100?text=No+Image';
    
    // If the image URL is relative (starts with /uploads), add the backend URL
    if (imageUrl && imageUrl.startsWith('/uploads')) {
      // Use the backend URL - typically the server runs on this port
      const backendUrl = 'http://localhost:5000/api';
      // Remove /api prefix if present in the backend URL since the uploads folder is at root level
      const baseUrl = backendUrl.endsWith('/api') 
        ? backendUrl.substring(0, backendUrl.length - 4) 
        : backendUrl;
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    return (
      <Box
        component="img"
        src={imageUrl}
        alt={product.name}
        sx={{
          width: 60,
          height: 60,
          objectFit: 'cover',
          borderRadius: 1
        }}
      />
    );
  };

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Error loading products
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box component="form" onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <RefreshIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                size="small"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Filter by Category</InputLabel>
              <Select
                labelId="category-filter-label"
                multiple
                value={selectedCategories}
                onChange={handleCategoryChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map((value) => {
                      const category = categories.find(c => c.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={category?.name || value} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
                label="Filter by Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox checked={selectedCategories.indexOf(category.id) > -1} />
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !data?.products || data.products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              data.products.map((product) => (
                <TableRow 
                  key={`product-${product.product_id}`}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    {renderProductImage(product)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {product.name}
                      </Typography>
                      {product.is_featured && (
                        <Tooltip title="Featured Product">
                          <StarIcon fontSize="small" color="primary" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {product.sale_price ? (
                        <>
                          <Typography variant="body2" color="error" fontWeight="bold">
                            {formatPrice(product.sale_price)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {formatPrice(product.base_price)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2">
                          {formatPrice(product.base_price)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.stock_quantity} 
                      color={product.stock_quantity > 0 ? 'success' : 'error'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {product.categories?.map((category) => (
                        <Chip
                          key={category.category_id}
                          label={category.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {(!product.categories || product.categories.length === 0) && (
                        <Typography variant="caption" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {product.stock_quantity > 0 ? (
                      <Chip label="In Stock" color="success" size="small" />
                    ) : (
                      <Chip label="Out of Stock" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditProduct(product)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={data.totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            showFirstButton 
            showLastButton
          />
        </Box>
      )}

      {/* Product Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent dividers>
          <ProductForm 
            product={editingProduct}
            onSubmitSuccess={handleDialogSuccess}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product "{confirmDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained" 
            autoFocus
            disabled={deleteProduct.isLoading}
          >
            {deleteProduct.isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsPage; 