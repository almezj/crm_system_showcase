import { IMAGE_BASE_URL, STATIC_BASE_URL } from '../config/environment';

/**
 * Generate image URL for uploaded files (new structure)
 * @param {string} imagePath - The image path from the database
 * @returns {string} - Complete image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

/**
 * Generate static asset URL
 * @param {string} assetPath - The asset path
 * @returns {string} - Complete static asset URL
 */
export const getStaticUrl = (assetPath) => {
  if (!assetPath) return null;
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return `${STATIC_BASE_URL}${cleanPath}`;
};

/**
 * Generate image URL for uploaded images (legacy support)
 * @param {string} imagePath - The image path
 * @returns {string} - Complete image URL
 * @deprecated Use getImageUrl() instead for uploaded images
 */
export const getStaticImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // For backward compatibility, try the new structure first, then fallback to static
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // If the path already contains 'uploads/', use the new structure
  if (cleanPath.includes('uploads/')) {
    return `${IMAGE_BASE_URL}${cleanPath}`;
  }
  
  // Otherwise, use the old static structure for backward compatibility
  return `${STATIC_BASE_URL}static/${cleanPath}`;
}; 