import axios from "axios";
import { API_BASE_URL } from "../config/environment";
import store from "../redux/store";
import { renewSessionSuccess, renewSessionFailure, updateToken } from "../redux/auth/actions";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});


let isRenewing = false;
let renewalPromise = null;

// Helper
const attemptTokenRenewal = async () => {
  if (isRenewing && renewalPromise) {
    return renewalPromise;
  }

  isRenewing = true;
  renewalPromise = (async () => {
    try {
      console.log('🔄 Attempting token renewal...');
      
      // Create a temporary axios instance without interceptors to avoid recursion
      const renewalAxios = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
      });
      
      // Add current token to renewal request
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        // RFC 6750
        renewalAxios.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
      }
      
      const response = await renewalAxios.post("/auth/renew");
      const { token, user } = response.data;
      
      // Update token in localStorage and axios defaults
      localStorage.setItem("token", token);
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Update Redux store - only update token
      store.dispatch(updateToken(token));
      
      console.log('✅ Token renewed successfully');
      return { token, user };
      
    } catch (error) {
      console.error('❌ Token renewal failed:', error);
      
      // Clear auth state on renewal failure
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];
      store.dispatch(renewSessionFailure(error.message));
      
      throw error;
    } finally {
      isRenewing = false;
      renewalPromise = null;
    }
  })();

  return renewalPromise;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Use standard Authorization header (RFC 6750)
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with auto-renewal
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with auto-renewal
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 401 detected, attempting token renewal...');
        
        // Attempt token renewal
        await attemptTokenRenewal();
        
        // Update the original request with new token
        const newToken = localStorage.getItem("token");
        if (newToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        }
        
        // Retry the original request
        console.log('🔄 Retrying original request with new token...');
        return axiosInstance(originalRequest);
        
      } catch (renewalError) {
        console.error('❌ Token renewal failed, redirecting to login...');
        
        // Renewal failed - redirect to login
        localStorage.removeItem("token");
        delete axiosInstance.defaults.headers.common["Authorization"];
        
        // Redirect to login page (avoid redirect if already on login page)
        if (window.location.pathname !== '/login') {
          console.log('🔄 Redirecting to login page...');
          window.location.href = '/login';
        }
        
        return Promise.reject(renewalError);
      }
    }

    // Enhanced error logging for non-401 errors
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Show toast notification for all errors (except 401 which is handled above)
    const userMessage = extractUserFriendlyMessage(error);
    toast.error(userMessage);

    // Enhance error object with additional information
    const enhancedError = {
      ...error,
      // Add request context
      requestContext: {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        timestamp: new Date().toISOString()
      },
      // Extract server error details
      serverError: error.response?.data || null,
      // Add user-friendly message
      userMessage: userMessage
    };

    return Promise.reject(enhancedError);
  }
);

// Helper function to extract user-friendly error messages
const extractUserFriendlyMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
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
  
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export default axiosInstance;
