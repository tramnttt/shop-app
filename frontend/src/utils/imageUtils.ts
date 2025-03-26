/**
 * Formats image URLs to include the backend URL for relative paths
 * @param imageUrl The image URL to format
 * @returns The formatted image URL with backend URL if needed
 */
export const formatImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
        return 'https://placehold.co/400x300?text=No+Image';
    }

    // If the image URL is relative (starts with /uploads), add the backend URL
    if (imageUrl.startsWith('/uploads')) {
        // Hardcoded backend URL - in a production app this would come from environment variables
        const backendUrl = 'http://localhost:5000';
        return `${backendUrl}${imageUrl}`;
    }

    return imageUrl;
};

/**
 * Get the primary image URL from a product's images array
 * @param images Array of product images
 * @returns Formatted primary image URL
 */
export const getPrimaryImageUrl = (images: any[] | undefined): string => {
    if (!images || images.length === 0) {
        return 'https://placehold.co/400x300?text=No+Image';
    }

    // Try to find the primary image
    const primaryImage = images.find(img => img.is_primary);
    const imageUrl = primaryImage?.image_url || images[0]?.image_url;

    return formatImageUrl(imageUrl);
}; 