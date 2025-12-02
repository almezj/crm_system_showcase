import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Error types
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  AUTH: 'auth',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Initial state
const initialState = {
  errors: [],
  isVisible: false
};

// Action types
const ERROR_ACTIONS = {
  ADD_ERROR: 'ADD_ERROR',
  REMOVE_ERROR: 'REMOVE_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SHOW_ERRORS: 'SHOW_ERRORS',
  HIDE_ERRORS: 'HIDE_ERRORS'
};

// Reducer
const errorReducer = (state, action) => {
  switch (action.type) {
    case ERROR_ACTIONS.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, {
          id: Date.now() + Math.random(),
          ...action.payload,
          timestamp: new Date().toISOString()
        }]
      };
    
    case ERROR_ACTIONS.REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };
    
    case ERROR_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: []
      };
    
    case ERROR_ACTIONS.SHOW_ERRORS:
      return {
        ...state,
        isVisible: true
      };
    
    case ERROR_ACTIONS.HIDE_ERRORS:
      return {
        ...state,
        isVisible: false
      };
    
    default:
      return state;
  }
};

// Context
const ErrorContext = createContext();

// Provider component
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Add error function
  const addError = useCallback((error) => {
    const errorData = {
      type: error.type || ERROR_TYPES.UNKNOWN,
      severity: error.severity || ERROR_SEVERITY.MEDIUM,
      title: error.title || 'Error',
      message: error.message || 'An unexpected error occurred',
      details: error.details || null,
      code: error.code || null,
      autoHide: error.autoHide !== false, // Default to true
      duration: error.duration || 5000, // 5 seconds default
      actions: error.actions || null
    };

    dispatch({ type: ERROR_ACTIONS.ADD_ERROR, payload: errorData });
    
    // Auto-hide after duration if enabled
    if (errorData.autoHide) {
      setTimeout(() => {
        removeError(errorData.id);
      }, errorData.duration);
    }
  }, []);

  // Remove error function
  const removeError = useCallback((errorId) => {
    dispatch({ type: ERROR_ACTIONS.REMOVE_ERROR, payload: errorId });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: ERROR_ACTIONS.CLEAR_ERRORS });
  }, []);

  // Show errors
  const showErrors = useCallback(() => {
    dispatch({ type: ERROR_ACTIONS.SHOW_ERRORS });
  }, []);

  // Hide errors
  const hideErrors = useCallback(() => {
    dispatch({ type: ERROR_ACTIONS.HIDE_ERRORS });
  }, []);

  // Helper function to extract error from API response
  const handleApiError = useCallback((error, context = '') => {
    console.error('API Error:', error);
    
    let errorData = {
      type: ERROR_TYPES.NETWORK,
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'Request Failed',
      message: 'Unable to complete the request. Please try again.',
      context
    };

    if (error.response) {
      // Server responded with error status
      const response = error.response;
      const data = response.data;
      
      if (data && data.error) {
        errorData = {
          type: getErrorTypeFromCode(data.code),
          severity: getSeverityFromHttpCode(response.status),
          title: getTitleFromHttpCode(response.status),
          message: data.error,
          details: data.details || null,
          code: data.code || null,
          context
        };
      } else {
        errorData = {
          type: ERROR_TYPES.SERVER,
          severity: getSeverityFromHttpCode(response.status),
          title: getTitleFromHttpCode(response.status),
          message: `Server error (${response.status}). Please try again.`,
          context
        };
      }
    } else if (error.request) {
      // Network error
      errorData = {
        type: ERROR_TYPES.NETWORK,
        severity: ERROR_SEVERITY.HIGH,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        context
      };
    } else {
      // Other error
      errorData = {
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.MEDIUM,
        title: 'Unexpected Error',
        message: error.message || 'An unexpected error occurred',
        context
      };
    }

    addError(errorData);
    return errorData;
  }, [addError]);

  const value = {
    ...state,
    addError,
    removeError,
    clearErrors,
    showErrors,
    hideErrors,
    handleApiError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook to use error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Helper functions
const getErrorTypeFromCode = (code) => {
  if (!code) return ERROR_TYPES.UNKNOWN;
  
  const codeMap = {
    'VALIDATION_ERROR': ERROR_TYPES.VALIDATION,
    'UNAUTHORIZED': ERROR_TYPES.AUTH,
    'FORBIDDEN': ERROR_TYPES.AUTH,
    'NOT_FOUND': ERROR_TYPES.SERVER,
    'CONFLICT': ERROR_TYPES.SERVER,
    'SERVER_ERROR': ERROR_TYPES.SERVER,
    'BAD_REQUEST': ERROR_TYPES.VALIDATION
  };
  
  return codeMap[code] || ERROR_TYPES.UNKNOWN;
};

const getSeverityFromHttpCode = (status) => {
  if (status >= 500) return ERROR_SEVERITY.HIGH;
  if (status >= 400) return ERROR_SEVERITY.MEDIUM;
  return ERROR_SEVERITY.LOW;
};

const getTitleFromHttpCode = (status) => {
  const titleMap = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Validation Error',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  
  return titleMap[status] || 'Error';
};
