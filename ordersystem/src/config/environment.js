// Environment configuration using environment variables
const isDevelopment = process.env.NODE_ENV === 'development';

// API Base URLs
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (isDevelopment ? 'http://carsys.loc/api/' : 'https://sys.carelli.cz/api/');

// Static assets base URL
export const STATIC_BASE_URL = process.env.REACT_APP_STATIC_BASE_URL || 
  (isDevelopment ? 'http://carsys.loc/' : 'https://sys.carelli.cz/');

// Image base URL (for uploaded files)
export const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 
  (isDevelopment ? 'http://carsys.loc/public/' : 'https://sys.carelli.cz/public/');

// Environment info
export const ENV_CONFIG = {
  isDevelopment,
  isProduction: !isDevelopment,
  apiBaseUrl: API_BASE_URL,
  staticBaseUrl: STATIC_BASE_URL,
  imageBaseUrl: IMAGE_BASE_URL
}; 