import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tooltip,
  Chip,
  Card,
  CardMedia
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category, CreateCategoryDto, UpdateCategoryDto } from '../../services/categoryService';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { formatImageUrl } from '../../utils/imageUtils';

const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({ name: '', description: null, image_url: null });
  const [error, setError] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto & { imageFile?: File }) => categoryService.create(data, data.imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to create category');
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data, imageFile }: { id: number; data: UpdateCategoryDto; imageFile?: File }) => 
      categoryService.update(id, data, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update category');
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete category');
    }
  });

  const handleParentCategoryChange = (event: SelectChangeEvent) => {
    const parentId = event.target.value === '' ? null : Number(event.target.value);
    setFormData({
      ...formData,
      parent_category_id: parentId
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        parent_category_id: category.parent_id,
        image_url: category.image_url
      });
      setImagePreview(category.image_url || null);
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: null, parent_category_id: null, image_url: null });
      setImagePreview(null);
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({ name: '', description: null, parent_category_id: null, image_url: null });
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    // Make sure we don't set a category as its own parent
    if (editingCategory && formData.parent_category_id === editingCategory.id) {
      setError('A category cannot be its own parent');
      return;
    }

    try {
      if (editingCategory) {
        const updateData: UpdateCategoryDto = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          parent_category_id: formData.parent_category_id,
        };
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: updateData,
          imageFile: selectedImage || undefined
        });
      } else {
        const createData: CreateCategoryDto = {
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          parent_category_id: formData.parent_category_id,
        };
        await createMutation.mutateAsync({
          ...createData,
          imageFile: selectedImage || undefined
        });
      }
      handleCloseDialog();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    // Check if category has child categories
    const hasChildren = categories.some(category => category.parent_id === id);
    
    if (hasChildren) {
      alert('Cannot delete a category that has child categories. Please reassign or delete child categories first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Get parent category name
  const getParentCategoryName = (parentId: number | null | undefined) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  // Sort categories
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Error loading categories
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Categories Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh categories">
            <IconButton onClick={() => refetch()} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}>
            <IconButton onClick={toggleSortOrder} color="primary">
              {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Parent Category</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No categories found</TableCell>
              </TableRow>
            ) : (
              sortedCategories.map((category, index) => (
                <TableRow key={`category-${category.id || index}`}>
                  <TableCell>{category.id || 'Pending'}</TableCell>
                  <TableCell>
                    {category.image_url ? (
                      <Card sx={{ width: 60, height: 60 }}>
                        <CardMedia
                          component="img"
                          image={formatImageUrl(category.image_url)}
                          alt={category.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                          borderRadius: 1
                        }}
                      >
                        <ImageIcon color="disabled" />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.name}
                    {categories.some(c => c.parent_id === category.id) && (
                      <Chip 
                        size="small" 
                        label="Has children" 
                        color="info" 
                        variant="outlined" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{category.description ?? '-'}</TableCell>
                  <TableCell>{getParentCategoryName(category.parent_id)}</TableCell>
                  <TableCell>{category.created_at ? new Date(category.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpenDialog(category)} 
                      color="primary"
                      aria-label="edit category"
                      disabled={!category.id}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => category.id ? handleDelete(category.id) : null} 
                      color="error"
                      aria-label="delete category"
                      disabled={!category.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="parent-category-label">Parent Category</InputLabel>
              <Select
                labelId="parent-category-label"
                value={formData.parent_category_id?.toString() || ''}
                label="Parent Category"
                onChange={handleParentCategoryChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories
                  .filter(c => !editingCategory || c.id !== editingCategory.id)
                  .map(category => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Category Image
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {imagePreview ? (
                  <Card sx={{ width: 100, height: 100 }}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Category preview"
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                ) : (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 1
                    }}
                  >
                    <ImageIcon color="disabled" />
                  </Box>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                editingCategory ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default CategoriesPage; 