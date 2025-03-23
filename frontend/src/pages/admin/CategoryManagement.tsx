import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    SelectChangeEvent,
    Chip,
    Tooltip
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Add as AddIcon,
    Refresh as RefreshIcon 
} from '@mui/icons-material';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../services/categoryService';

const CategoryManagement: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CreateCategoryDto>({ name: '', description: null });
    const [error, setError] = useState<string>('');

    const { data: categories = [], isLoading, refetch } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const deleteCategory = useDeleteCategory();

    const handleOpenDialog = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: null, parent_category_id: null });
        setOpenDialog(true);
        setError('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCategory(null);
        setFormData({ name: '', description: null, parent_category_id: null });
        setError('');
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ 
            name: category.name, 
            description: category.description,
            parent_category_id: category.parent_id
        });
        setOpenDialog(true);
        setError('');
    };

    const handleParentCategoryChange = (event: SelectChangeEvent) => {
        const parentId = event.target.value === '' ? null : Number(event.target.value);
        setFormData({
            ...formData,
            parent_category_id: parentId
        });
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
                    parent_category_id: formData.parent_category_id
                };
                
                await updateCategory.mutateAsync({
                    id: editingCategory.id,
                    data: updateData
                });
            } else {
                const createData: CreateCategoryDto = {
                    name: formData.name.trim(),
                    description: formData.description?.trim() || null,
                    parent_category_id: formData.parent_category_id
                };
                
                await createCategory.mutateAsync(createData);
            }
            handleCloseDialog();
        } catch (error: any) {
            console.error('Error saving category:', error);
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
            try {
                await deleteCategory.mutateAsync(id);
            } catch (error: any) {
                console.error('Error deleting category:', error);
                alert(error.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    // Get parent category name
    const getParentCategoryName = (parentId: number | null | undefined) => {
        if (!parentId) return '-';
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : 'Unknown';
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Category Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title="Refresh categories">
                        <IconButton onClick={() => refetch()} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        Add Category
                    </Button>
                </Box>
            </Box>

            {categories.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                        No categories found. Click "Add Category" to create your first category.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Parent Category</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={`category-${category.id}`}>
                                    <TableCell>{category.id}</TableCell>
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
                                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEdit(category)}
                                            size="small"
                                            aria-label="edit category"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(category.id)}
                                            size="small"
                                            aria-label="delete category"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Category Name"
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
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={createCategory.isLoading || updateCategory.isLoading}
                        >
                            {createCategory.isLoading || updateCategory.isLoading ? (
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

export default CategoryManagement; 