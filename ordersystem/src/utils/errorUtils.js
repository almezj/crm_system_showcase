/**
 * Utility functions for handling and extracting error information
 */

/**
 * Extract user-friendly error message from API error response
 * @param {Object} error - The error object from axios
 * @param {string} context - Context where the error occurred (e.g., "Creating proposal")
 * @returns {string} User-friendly error message
 */
export const extractErrorMessage = (error, context = '') => {
  console.error('Error details:', error);
  
  // Check if it's our enhanced error from axios interceptor
  if (error.userMessage) {
    return error.userMessage;
  }
  
  // Check for server error response
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle validation errors
    if (data.validation_errors) {
      const validationMessages = Object.values(data.validation_errors);
      return validationMessages.length > 0 
        ? validationMessages[0] 
        : 'Please check your input and try again.';
    }
    
    // Handle server error message
    if (data.error) {
      return data.error;
    }
    
    // Handle success: false responses
    if (data.success === false && data.message) {
      return data.message;
    }
  }
  
  // Handle HTTP status codes
  if (error.response?.status) {
    const statusMessages = {
      400: 'Invalid request. Please check your input.',
      401: 'You are not authorized to perform this action.',
      403: 'Access denied. You don\'t have permission for this action.',
      404: 'The requested resource was not found.',
      409: 'This action conflicts with existing data.',
      422: 'Please check your input and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable.',
      503: 'Service temporarily unavailable.'
    };
    
    return statusMessages[error.response.status] || 'An error occurred. Please try again.';
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  // Fallback to error message or generic message
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Extract detailed error information for logging
 * @param {Object} error - The error object from axios
 * @param {string} context - Context where the error occurred
 * @returns {Object} Detailed error information
 */
export const extractErrorDetails = (error, context = '') => {
  return {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
};

/**
 * Check if error is a validation error
 * @param {Object} error - The error object
 * @returns {boolean} True if it's a validation error
 */
export const isValidationError = (error) => {
  return error.response?.data?.validation_errors || 
         error.response?.status === 422 ||
         error.response?.data?.code === 'VALIDATION_ERROR';
};

/**
 * Check if error is an authentication error
 * @param {Object} error - The error object
 * @returns {boolean} True if it's an authentication error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401 || 
         error.response?.status === 403 ||
         error.response?.data?.code === 'UNAUTHORIZED' ||
         error.response?.data?.code === 'FORBIDDEN';
};

/**
 * Check if error is a network error
 * @param {Object} error - The error object
 * @returns {boolean} True if it's a network error
 */
export const isNetworkError = (error) => {
  return !error.response && (error.code === 'NETWORK_ERROR' || error.message === 'Network Error');
};

/**
 * Get error severity based on error type
 * @param {Object} error - The error object
 * @returns {string} Error severity level
 */
export const getErrorSeverity = (error) => {
  if (isAuthError(error)) return 'high';
  if (isNetworkError(error)) return 'high';
  if (error.response?.status >= 500) return 'high';
  if (isValidationError(error)) return 'medium';
  if (error.response?.status >= 400) return 'medium';
  return 'low';
};

/**
 * Format error for display in UI
 * @param {Object} error - The error object
 * @param {string} context - Context where the error occurred
 * @returns {Object} Formatted error for UI display
 */
export const formatErrorForUI = (error, context = '') => {
  const message = extractErrorMessage(error, context);
  const severity = getErrorSeverity(error);
  
  return {
    message,
    severity,
    context,
    isValidation: isValidationError(error),
    isAuth: isAuthError(error),
    isNetwork: isNetworkError(error),
    details: error.response?.data || null,
    code: error.response?.data?.code || null
  };
};
