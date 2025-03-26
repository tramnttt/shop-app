import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon
} from '@mui/icons-material';
import { formatImageUrl } from '../../utils/imageUtils';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  existingImages?: string[];
  maxImages?: number;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  existingImages = [],
  maxImages = 5,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up URLs on unmount
    return () => {
      previews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  useEffect(() => {
    // Initialize with existing images
    if (existingImages && existingImages.length > 0) {
      setPreviews([...existingImages]);
    }
  }, [existingImages]);

  const validateFiles = (files: File[]): boolean => {
    // No need to check total number of images here as it's now checked in handleFilesSelected
    
    // Check file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setLocalError('Only JPG, PNG, and GIF images are allowed');
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setLocalError('Image size should not exceed 5MB');
      return false;
    }

    setLocalError(null);
    return true;
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check if adding these new files would exceed max images
    const totalImages = previews.length + fileArray.length;
    if (totalImages > maxImages) {
      setLocalError(`Cannot add ${fileArray.length} more images. Maximum ${maxImages} images allowed (${previews.length} already selected).`);
      return;
    }
    
    if (!validateFiles(fileArray)) return;

    setIsLoading(true);
    
    const newPreviews: string[] = [];
    const newFiles: File[] = [];

    fileArray.forEach(file => {
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
      newFiles.push(file);
    });

    // Append new previews to existing ones
    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Append new files to existing ones and notify parent
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onImagesChange(updatedFiles);
    
    setIsLoading(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFilesSelected(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFilesSelected(files);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const isExistingImage = index < existingImages.length;
    
    // Update previews
    setPreviews(prev => prev.filter((_, i) => i !== index));
    
    if (!isExistingImage) {
      // Adjust index for selected files (accounting for existing images)
      const selectedIndex = index - existingImages.length;
      
      // Make sure the selectedIndex is valid
      if (selectedIndex >= 0 && selectedIndex < selectedFiles.length) {
        // Update selected files
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(selectedIndex, 1);
        setSelectedFiles(updatedFiles);
        
        // Notify parent
        onImagesChange(updatedFiles);
      }
    } else {
      // If it's an existing image, we need to notify the parent component
      // that this existing image should be removed on save
      console.log(`Existing image at index ${index} removed`);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to get correctly formatted URL for display
  const getDisplayUrl = (url: string): string => {
    return url.startsWith('blob:') ? url : formatImageUrl(url);
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/gif"
        multiple
        style={{ display: 'none' }}
      />
      
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Product Images {maxImages > 1 ? `(Max: ${maxImages})` : ''}
        </Typography>
        
        <Box
          sx={{
            border: '2px dashed',
            borderColor: error ? 'error.main' : isDragging ? 'primary.main' : 'grey.400',
            borderRadius: 1,
            p: 3,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragging ? 'action.hover' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography>
            Drag and drop images here, or click to select files
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Supported formats: JPG, PNG, GIF (max 5MB each)
          </Typography>
        </Box>
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {previews.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {previews.map((preview, index) => (
              <Grid item xs={6} sm={4} md={3} key={`preview-${index}`}>
                <Paper
                  elevation={2}
                  sx={{
                    position: 'relative',
                    height: 0,
                    paddingTop: '100%', // 1:1 aspect ratio
                    backgroundColor: 'grey.100',
                    backgroundImage: `url(${getDisplayUrl(preview)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
            
            {previews.length < maxImages && (
              <Grid item xs={6} sm={4} md={3}>
                <Paper
                  elevation={1}
                  sx={{
                    height: 0,
                    paddingTop: '100%',
                    position: 'relative',
                    border: '1px dashed',
                    borderColor: 'grey.400',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={handleClickUpload}
                >
                  <Stack
                    direction="column"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <AddPhotoAlternateIcon color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      Add More
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ImageUpload; 