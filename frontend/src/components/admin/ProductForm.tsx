import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Typography,
  Switch,
  FormControlLabel,
  InputAdornment,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import { Product, CreateProductDto, ProductImage, prepareProductFormData, UpdateProductDto } from '../../services/productService';
import { Category } from '../../services/categoryService';
import ImageUpload from './ImageUpload';
import { formatImageUrl } from '../../utils/imageUtils';

interface ProductFormProps {
  product: Product | null;
  onSubmitSuccess: () => void;
  categories: Category[];
}

interface FormErrors {
  name?: string;
  sku?: string;
  base_price?: string;
  sale_price?: string;
  stock_quantity?: string;
  categories?: string;
  images?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmitSuccess, categories }) => {
  const initialState: CreateProductDto = {
    name: '',
    description: '',
    base_price: 0,
    sale_price: null,
    sku: '',
    stock_quantity: 0,
    is_featured: false,
    category_ids: [],
    images: []
  };

  const [formData, setFormData] = useState<CreateProductDto>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(-1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  // Mutations for creating and updating products
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Set form data from existing product when editing
  useEffect(() => {
    if (product) {
      const productImages = product.images || [];
      const primaryIndex = productImages.findIndex(img => img.is_primary);
      
      setFormData({
        name: product.name,
        description: product.description || '',
        base_price: product.base_price,
        sale_price: product.sale_price,
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        is_featured: product.is_featured || false,
        category_ids: product.categories?.map(cat => cat.category_id) || [],
        images: productImages
      });
      
      setImageUrls(productImages.map(img => img.image_url));
      setPrimaryImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (formData.base_price <= 0) {
      newErrors.base_price = 'Price must be greater than 0';
    }

    if (formData.sale_price !== null && formData.sale_price !== undefined && 
        formData.sale_price >= formData.base_price) {
      newErrors.sale_price = 'Sale price must be less than base price';
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative';
    }

    if (formData.category_ids?.length === 0) {
      newErrors.categories = 'Select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is changed
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: number | null = parseFloat(value);
    
    if (isNaN(parsedValue)) {
      parsedValue = name === 'sale_price' ? null : 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    console.log(`Checkbox ${name} changed to ${checked} (${typeof checked})`);
    
    // For is_featured, ensure we're setting a proper boolean
    if (name === 'is_featured') {
      console.log(`Setting is_featured to: ${checked} (${typeof checked})`);
      
      // CRITICAL FIX: Ensure the value is a true boolean, not a string or other type
      const booleanValue = checked === true;
      console.log(`Normalized boolean value: ${booleanValue} (${typeof booleanValue})`);
    }
    
    // We need to create a new object to trigger a re-render
    setFormData(prev => {
      // CRITICAL: For is_featured, ensure strict boolean type
      const newValue = name === 'is_featured' ? (checked === true) : checked;
      
      const newFormData = {
        ...prev,
        [name]: newValue
      };
      console.log('Updated form data:', JSON.stringify(newFormData));
      return newFormData;
    });
  };

  const handleCategoryChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value as number[];
    setFormData(prev => ({
      ...prev,
      category_ids: value
    }));
    
    if (errors.categories) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.categories;
        return newErrors;
      });
    }
  };

  const handleAddImage = () => {
    const newImageUrl = prompt('Enter image URL:');
    if (!newImageUrl || !newImageUrl.trim()) return;
    
    const updatedUrls = [...imageUrls, newImageUrl];
    setImageUrls(updatedUrls);
    
    // If this is the first image, make it primary
    const isPrimary = updatedUrls.length === 1;
    if (isPrimary) {
      setPrimaryImageIndex(0);
    }
    
    // Update form data with new image
    const newImages = [...(formData.images || [])];
    const newImage: ProductImage = {
      image_url: newImageUrl,
      is_primary: isPrimary || primaryImageIndex === updatedUrls.length - 1
    };
    newImages.push(newImage);
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleRemoveImage = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    
    // If we removed the primary image, select a new one
    let newPrimaryIndex = primaryImageIndex;
    if (index === primaryImageIndex) {
      newPrimaryIndex = updatedUrls.length > 0 ? 0 : -1;
    } else if (index < primaryImageIndex) {
      newPrimaryIndex = primaryImageIndex - 1;
    }
    
    setPrimaryImageIndex(newPrimaryIndex);
    
    // Update form data after removing image
    const newImages = (formData.images || [])
      .filter((_, i) => i !== index)
      .map((img, i) => {
        if (typeof img === 'object' && !(img instanceof File)) {
          return {
            ...img,
            is_primary: i === newPrimaryIndex
          };
        }
        return img;
      });
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index);
    
    // Update form data to set primary image
    const newImages = (formData.images || []).map((img, i) => {
      if (typeof img === 'object' && !(img instanceof File)) {
        return {
          ...img,
          is_primary: i === index
        };
      }
      return img;
    });
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleImagesChange = (files: File[]) => {
    setSelectedImages(prevFiles => [...prevFiles, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError('');
      
      // Create a clean product data object for both create and update
      const productData: CreateProductDto | UpdateProductDto = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        base_price: formData.base_price,
        stock_quantity: formData.stock_quantity,
        category_ids: formData.category_ids,
        is_featured: formData.is_featured === true  // CRITICAL: Ensure proper boolean
      };
      
      // Only include optional fields if they have values
      if (formData.sale_price !== null && formData.sale_price !== undefined) {
        productData.sale_price = formData.sale_price;
      }

      console.log('Product data object:', JSON.stringify(productData));
      console.log('is_featured value:', productData.is_featured);
      console.log('is_featured type:', typeof productData.is_featured);
      
      // If we have image files to upload, we need to use FormData
      const hasImageFiles = selectedImages.length > 0;
      
      // For product updates
      if (product) {
        console.log('USING JSON FORMAT for product update');
        console.log('Updating product with ID:', product.product_id);
        console.log('Original product featured status:', product.is_featured);
        
        // If we don't have new images, use JSON directly
        if (!hasImageFiles) {
          const updatedProduct = await updateProduct.mutateAsync({ 
            id: product.product_id, 
            data: productData 
          });
          console.log('Update response:', JSON.stringify(updatedProduct));
          console.log('Update response featured status:', updatedProduct.is_featured);
        }
        // If we do have new images, we need to use FormData
        else {
          console.log('Using FormData for update because we have image files');
          const processedData = convertToFormData(productData, selectedImages);
          const updatedProduct = await updateProduct.mutateAsync({ 
            id: product.product_id, 
            data: processedData 
          });
          console.log('Update response:', JSON.stringify(updatedProduct));
        }
      } 
      // For new products
      else {
        console.log('Creating new product');
        
        // If we don't have images, use JSON directly
        if (!hasImageFiles) {
          console.log('USING JSON FORMAT for product creation');
          await createProduct.mutateAsync(productData as CreateProductDto);
        }
        // If we have images, use FormData
        else {
          console.log('Using FormData for creation because we have image files');
          const processedData = convertToFormData(productData, selectedImages);
          await createProduct.mutateAsync(processedData);
        }
      }

      onSubmitSuccess();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'An error occurred while saving the product');
    }
  };

  // Helper function to convert product data to FormData when we have images
  const convertToFormData = (data: CreateProductDto | UpdateProductDto, images: File[]): FormData => {
    const formData = new FormData();
    
    // Add basic fields
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description || '');
    if (data.sku) formData.append('sku', data.sku);
    
    // Numeric values
    if (data.base_price !== undefined) {
      formData.append('base_price', data.base_price.toString());
    }
    if (data.stock_quantity !== undefined) {
      formData.append('stock_quantity', data.stock_quantity.toString());
    }
    if (data.sale_price !== null && data.sale_price !== undefined) {
      formData.append('sale_price', data.sale_price.toString());
    }
    
    // Boolean values - CRITICAL: proper conversion
    const isFeaturedValue = data.is_featured === true ? 'true' : 'false';
    formData.append('is_featured', isFeaturedValue);
    console.log('FormData is_featured value:', isFeaturedValue);
    
    // Categories
    if (data.category_ids) {
      data.category_ids.forEach(id => {
        formData.append('category_ids[]', id.toString());
      });
    }
    
    // Add images
    images.forEach(image => {
      formData.append('images', image);
    });
    
    return formData;
  };

  const isLoading = createProduct.isLoading || updateProduct.isLoading;

  // Extract image URLs from form data for the ImageUpload component
  const getExistingImageUrls = (): string[] => {
    if (!formData.images) return [];
    
    return formData.images
      .filter(img => typeof img === 'object' && !(img instanceof File) && 'image_url' in img)
      .map(img => (img as ProductImage).image_url);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="name"
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="sku"
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            error={!!errors.sku}
            helperText={errors.sku}
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="stock_quantity"
            label="Stock Quantity"
            name="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={handleNumberChange}
            error={!!errors.stock_quantity}
            helperText={errors.stock_quantity}
            InputProps={{
              inputProps: { min: 0 }
            }}
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="base_price"
            label="Base Price"
            name="base_price"
            type="number"
            value={formData.base_price}
            onChange={handleNumberChange}
            error={!!errors.base_price}
            helperText={errors.base_price}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: 0, step: 0.01 }
            }}
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="sale_price"
            label="Sale Price (Optional)"
            name="sale_price"
            type="number"
            value={formData.sale_price === null ? '' : formData.sale_price}
            onChange={handleNumberChange}
            error={!!errors.sale_price}
            helperText={errors.sale_price || 'Leave empty for no sale price'}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: 0, step: 0.01 }
            }}
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_featured}
                onChange={handleCheckboxChange}
                name="is_featured"
                color="primary"
                disabled={isLoading}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Featured Product</Typography>
                {formData.is_featured && (
                  <StarIcon 
                    fontSize="small" 
                    color="primary" 
                    sx={{ ml: 0.5 }} 
                  />
                )}
              </Box>
            }
          />
        </Grid>
        
        {/* Categories */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl 
            fullWidth 
            error={!!errors.categories}
            disabled={isLoading}
          >
            <InputLabel id="category-label">Categories</InputLabel>
            <Select
              labelId="category-label"
              multiple
              value={formData.category_ids}
              onChange={handleCategoryChange}
              input={<OutlinedInput id="select-categories" label="Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as number[]).map((value) => {
                    const category = categories.find(c => c.id === value);
                    return (
                      <Chip key={value} label={category?.name || value} />
                    );
                  })}
                </Box>
              )}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categories && <FormHelperText>{errors.categories}</FormHelperText>}
          </FormControl>
        </Grid>
        
        {/* Images */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" gutterBottom>
              Product Images
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddImage}
              disabled={isLoading}
            >
              Add Image
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <ImageUpload
            onImagesChange={handleImagesChange}
            existingImages={getExistingImageUrls()}
            maxImages={5}
            error={errors.images}
          />
        </Grid>
        
        {/* Submit Buttons */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? (
                <CircularProgress size={24} />
              ) : product ? 'Update Product' : 'Create Product'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm; 