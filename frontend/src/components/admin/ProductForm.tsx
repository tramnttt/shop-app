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
import { Product, CreateProductDto, ProductImage, UpdateProductDto } from '../../services/productService';
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

    // Convert to Number for reliable comparison
    const basePrice = Number(formData.base_price);
    
    // Check if base_price is a valid number and not negative
    if (isNaN(basePrice)) {
      newErrors.base_price = 'Price must be a valid number';
    } else if (basePrice < 0) {
      newErrors.base_price = 'Price must be greater than or equal to 0';
    }

    // Check sale price if provided
    if (formData.sale_price !== null && formData.sale_price !== undefined) {
      const salePrice = Number(formData.sale_price);
      
      if (isNaN(salePrice)) {
        newErrors.sale_price = 'Sale price must be a valid number';
      } else if (salePrice < 0) {
        newErrors.sale_price = 'Sale price must be greater than or equal to 0';
      } else if (salePrice >= basePrice && basePrice > 0) {
        newErrors.sale_price = 'Sale price must be less than base price';
      }
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
    
    // For empty inputs
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'sale_price' ? null : 0
      }));
      return;
    }
    
    // Try to parse as a number
    const parsedValue = parseFloat(value);
    
    // Only update if it's a valid number
    if (!isNaN(parsedValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: parsedValue
      }));
    }
    
    // Clear error when field is changed
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

  // Function to resize image and convert to base64
  const resizeAndConvertToBase64 = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * (maxHeight / height));
              height = maxHeight;
            }
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Get base64 data with reduced quality
          const base64 = canvas.toDataURL(file.type, 0.7); // 0.7 quality
          resolve(base64);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the current form data before validation
    console.log('Form data before validation:', {
      ...formData,
      base_price: {
        value: formData.base_price,
        type: typeof formData.base_price,
        asNumber: Number(formData.base_price),
        isValid: !isNaN(Number(formData.base_price)),
      }
    });
    
    if (!validateForm()) {
      console.log('Form validation failed, not submitting');
      return;
    }

    try {
      setError('');
      
      // Convert numbers with extra safety checks
      const basePrice = Number(formData.base_price);
      const safeBasePrice = !isNaN(basePrice) ? basePrice : 0;
      
      const stockQuantity = Number(formData.stock_quantity);
      const safeStockQuantity = !isNaN(stockQuantity) ? Math.floor(stockQuantity) : 0;
      
      // Create the product data object with explicitly converted values
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        base_price: safeBasePrice,
        stock_quantity: safeStockQuantity,
        category_ids: formData.category_ids,
        is_featured: formData.is_featured === true
      };
      
      // Log detailed information about the price in the payload
      console.log('Product prices (raw & processed):', {
        raw_base_price: {
          value: formData.base_price,
          type: typeof formData.base_price
        },
        processed_base_price: {
          value: productData.base_price,
          type: typeof productData.base_price
        }
      });
      
      // Only include sale price if it has a valid value
      if (formData.sale_price !== null && formData.sale_price !== undefined) {
        const salePrice = Number(formData.sale_price);
        if (!isNaN(salePrice)) {
          productData.sale_price = salePrice;
        }
      }

      // If we have image files, convert them to base64 and include them in the JSON payload
      if (selectedImages.length > 0) {
        // Convert all selected images to base64
        const base64Images = await Promise.all(
          selectedImages.map(async (file) => {
            const base64 = await resizeAndConvertToBase64(file);
            return {
              filename: file.name,
              mimetype: file.type,
              base64: base64,
              size: file.size
            };
          })
        );
        
        // Add images to product data
        productData.image_uploads = base64Images;
      }

      // Final check on the data being sent
      console.log('Final product data to be sent:', {
        ...productData,
        base_price_type: typeof productData.base_price,
        base_price_isNaN: isNaN(productData.base_price),
        image_uploads: productData.image_uploads ? `${productData.image_uploads.length} images` : 'none'
      });
      
      // For product updates
      if (product) {
        console.log('UPDATING PRODUCT with ID:', product.product_id);
        const updatedProduct = await updateProduct.mutateAsync({ 
          id: product.product_id, 
          data: productData
        });
        console.log('Update successful, response:', updatedProduct);
      } 
      // For new products
      else {
        console.log('CREATING NEW PRODUCT');
        const createdProduct = await createProduct.mutateAsync(productData as CreateProductDto);
        console.log('Creation successful, response:', createdProduct);
      }

      onSubmitSuccess();
    } catch (err: any) {
      console.error('ERROR saving product:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers
        });
        
        // Special handling for validation errors
        if (err.response.status === 400 && Array.isArray(err.response.data.message)) {
          const validationErrors = err.response.data.message;
          console.error('Validation errors:', validationErrors);
          
          // Extract specific validation errors for display
          const errorMessages = validationErrors.map((error: any) => {
            const property = error.property;
            const constraints = Object.values(error.constraints || {}).join(', ');
            return `${property}: ${constraints}`;
          }).join('\n');
          
          setError(`Validation failed: ${errorMessages}`);
          return;
        }
      }
      
      setError(err.response?.data?.message || 'An error occurred while saving the product');
    }
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
            helperText={errors.base_price || "Enter 0 or greater"}
            placeholder="0.00"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { 
                min: 0, 
                step: 0.01,
                onBlur: (e) => {
                  // Ensure we have a valid number on blur
                  const value = e.target.value;
                  if (value === '') {
                    setFormData(prev => ({
                      ...prev,
                      base_price: 0
                    }));
                  }
                }
              }
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