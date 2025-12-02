import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import ErrorBoundary from './ErrorBoundary';
import { renderWithProviders } from '../test-utils';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Mock component that doesn't throw
const NoErrorComponent = () => <div>No error</div>;

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true
});

// Mock console.error
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
    mockReload.mockClear();
  });

  describe('Normal Rendering (No Error)', () => {
    test('renders children when no error occurs', () => {
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <NoErrorComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(container.querySelector('.text-center')).not.toBeInTheDocument();
    });

    test('renders multiple children when no error occurs', () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Error Catching and Fallback UI', () => {
    test('catches errors and shows fallback UI', () => {
      // Suppress console.error for this test since we expect an error
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Should show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText("We're sorry, but something unexpected happened. This error has been logged and our team will look into it.")).toBeInTheDocument();
      
      // Restore console.error
      console.error = originalError;
    });

    test('shows error icon and styling', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      const { container } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Check for error icon
      const icon = container.querySelector('.fa-exclamation-triangle');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-warning');
      
      // Check for alert
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      console.error = originalError;
    });

    test('shows action buttons', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
      
      console.error = originalError;
    });
  });

  describe('User Interactions', () => {
    test('Try Again button exists and is clickable', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Should show error UI initially
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      // Try Again button should exist and be clickable
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
      expect(tryAgainButton).not.toBeDisabled();
      
      // Click the button (we can't easily test the reset behavior in this test environment)
      fireEvent.click(tryAgainButton);
      
      console.error = originalError;
    });

    test('Reload Page button calls window.location.reload', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      fireEvent.click(reloadButton);
      
      expect(mockReload).toHaveBeenCalledTimes(1);
      
      console.error = originalError;
    });
  });

  describe('Error Logging', () => {
    test('logs error to console when error occurs', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
      
      console.error = originalError;
    });

    test('logs production error details when in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(console.error).toHaveBeenCalledWith(
        'Production Error:',
        expect.objectContaining({
          message: 'Test error message',
          stack: expect.any(String),
          componentStack: expect.any(String),
          timestamp: expect.any(String)
        })
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
      console.error = originalError;
    });
  });

  describe('Development vs Production Behavior', () => {
    test('shows error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
      expect(screen.getByText('Error Message:')).toBeInTheDocument();
      expect(screen.getByText('Component Stack:')).toBeInTheDocument();
      
      // Restore
      process.env.NODE_ENV = originalEnv;
      console.error = originalError;
    });

    test('hides error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();
      expect(screen.queryByText('Error Message:')).not.toBeInTheDocument();
      expect(screen.queryByText('Component Stack:')).not.toBeInTheDocument();
      
      // Restore
      process.env.NODE_ENV = originalEnv;
      console.error = originalError;
    });
  });

  describe('Error State Management', () => {
    test('getDerivedStateFromError sets hasError to true', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Should show error UI, indicating hasError is true
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      console.error = originalError;
    });

    test('componentDidCatch updates error and errorInfo state', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // In development, error details should be shown
      expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
      
      // Restore
      process.env.NODE_ENV = originalEnv;
      console.error = originalError;
    });
  });

  describe('Error Recovery', () => {
    test('provides reset functionality through Try Again button', () => {
      const originalError = console.error;
      console.error = vi.fn();
      
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      // Should show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      // Try Again button should be available for reset
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
      
      // The button should be functional
      // TODO: Test the actual reset behavior
      fireEvent.click(tryAgainButton);
      
      console.error = originalError;
    });
  });
});
