import { useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { formatErrorForUI, ERROR_SEVERITY } from '../contexts/ErrorContext';

/**
 * Custom hook for handling errors in components
 * Provides convenient methods for showing different types of errors
 */
export const useErrorHandler = () => {
  const { addError, handleApiError } = useError();

  // Handle API errors with automatic formatting
  const handleError = useCallback((error, context = '') => {
    const formattedError = formatErrorForUI(error, context);
    
    addError({
      type: formattedError.isValidation ? 'validation' : 
            formattedError.isAuth ? 'auth' :
            formattedError.isNetwork ? 'network' : 'server',
      severity: formattedError.severity,
      title: getErrorTitle(formattedError),
      message: formattedError.message,
      details: formattedError.details,
      code: formattedError.code,
      context: formattedError.context
    });
  }, [addError]);

  // Show validation errors
  const showValidationError = useCallback((message, details = null) => {
    addError({
      type: 'validation',
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'Validation Error',
      message,
      details,
      autoHide: false // Don't auto-hide validation errors
    });
  }, [addError]);

  // Show network errors
  const showNetworkError = useCallback((message = 'Unable to connect to the server. Please check your internet connection.') => {
    addError({
      type: 'network',
      severity: ERROR_SEVERITY.HIGH,
      title: 'Connection Error',
      message,
      autoHide: true,
      duration: 8000 // Show longer for network errors
    });
  }, [addError]);

  // Show server errors
  const showServerError = useCallback((message = 'Server error. Please try again later.') => {
    addError({
      type: 'server',
      severity: ERROR_SEVERITY.HIGH,
      title: 'Server Error',
      message,
      autoHide: true,
      duration: 6000
    });
  }, [addError]);

  // Show authentication errors
  const showAuthError = useCallback((message = 'You are not authorized to perform this action.') => {
    addError({
      type: 'auth',
      severity: ERROR_SEVERITY.HIGH,
      title: 'Authentication Error',
      message,
      autoHide: false, // Don't auto-hide auth errors
      actions: [
        {
          label: 'Login',
          onClick: () => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
      ]
    });
  }, [addError]);

  // Show success messages (using the error system for consistency)
  const showSuccess = useCallback((message, title = 'Success') => {
    addError({
      type: 'success',
      severity: ERROR_SEVERITY.LOW,
      title,
      message,
      autoHide: true,
      duration: 3000
    });
  }, [addError]);

  // Show info messages
  const showInfo = useCallback((message, title = 'Information') => {
    addError({
      type: 'info',
      severity: ERROR_SEVERITY.LOW,
      title,
      message,
      autoHide: true,
      duration: 4000
    });
  }, [addError]);

  // Show warning messages
  const showWarning = useCallback((message, title = 'Warning') => {
    addError({
      type: 'warning',
      severity: ERROR_SEVERITY.MEDIUM,
      title,
      message,
      autoHide: true,
      duration: 5000
    });
  }, [addError]);

  return {
    handleError,
    handleApiError,
    showValidationError,
    showNetworkError,
    showServerError,
    showAuthError,
    showSuccess,
    showInfo,
    showWarning
  };
};

// Helper function to get appropriate error title
const getErrorTitle = (formattedError) => {
  if (formattedError.isValidation) return 'Validation Error';
  if (formattedError.isAuth) return 'Authentication Error';
  if (formattedError.isNetwork) return 'Connection Error';
  if (formattedError.severity === ERROR_SEVERITY.HIGH) return 'Server Error';
  return 'Error';
};
