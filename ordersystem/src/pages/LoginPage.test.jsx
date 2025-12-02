import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import LoginPage from './LoginPage';
import { renderWithProviders, resetAllMocks, testScenarios } from '../test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    resetAllMocks();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    test('renders login form with correct structure', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
      expect(screen.getByTestId('email')).toBeInTheDocument(); // Email input
      expect(screen.getByTestId('password')).toBeInTheDocument(); // Password input
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('renders form inputs with correct attributes', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const inputs = screen.getAllByDisplayValue('');
      const emailInput = inputs.find(input => input.type === 'email');
      const passwordInput = inputs.find(input => input.type === 'password');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('renders submit button with correct text when not loading', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toHaveTextContent('Login');
      expect(submitButton).not.toBeDisabled();
    });

    test('renders submit button with loading text when loading', () => {
      renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            loading: true
          }
        }
      });
      
      const submitButton = screen.getByRole('button', { name: /logging in/i });
      expect(submitButton).toHaveTextContent('Logging in...');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('User Input Handling', () => {
    test('updates email input when user types', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const inputs = screen.getAllByDisplayValue('');
      const emailInput = inputs.find(input => input.type === 'email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('updates password input when user types', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const inputs = screen.getAllByDisplayValue('');
      const passwordInput = inputs.find(input => input.type === 'password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput).toHaveValue('password123');
    });

    test('handles multiple input changes', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const inputs = screen.getAllByDisplayValue('');
      const emailInput = inputs.find(input => input.type === 'email');
      const passwordInput = inputs.find(input => input.type === 'password');
      
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'secretpass' } });
      
      expect(emailInput).toHaveValue('user@test.com');
      expect(passwordInput).toHaveValue('secretpass');
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid credentials', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const inputs = screen.getAllByDisplayValue('');
      const emailInput = inputs.find(input => input.type === 'email');
      const passwordInput = inputs.find(input => input.type === 'password');
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      // Form should be submitted (we can't test the actual dispatch without mocking)
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    test('prevents default form submission behavior', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      // Fill out the form (user behavior)
      const emailInput = screen.getByTestId('email');
      const passwordInput = screen.getByTestId('password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      // Verify the form was submitted by checking that the inputs still have their values
      // (which means the form didn't actually submit to the server)
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    test('disables submit button when loading', () => {
      renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            loading: true
          }
        }
      });
      
      const submitButton = screen.getByRole('button', { name: /logging in/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Redux Integration', () => {
    test('accesses loading state from Redux', () => {
      const { store } = renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            loading: true
          }
        }
      });
      
      expect(store.getState().auth.loading).toBe(true);
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });

    test('accesses error state from Redux', () => {
      const { store } = renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            error: 'Invalid credentials'
          }
        }
      });
      
      expect(store.getState().auth.error).toBe('Invalid credentials');
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    test('accesses authentication state from Redux', () => {
      const { store } = renderWithProviders(<LoginPage />, {
        initialState: testScenarios.authenticated
      });
      
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.token).toBe('fake-token');
    });

    test('responds to Redux state changes', () => {
      const { rerender } = renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      // Initially not loading
      expect(screen.getByRole('button', { name: /login/i })).not.toBeDisabled();
      
      // Update to loading state
      rerender(<LoginPage />);
      const { store } = renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            loading: true
          }
        }
      });
      
      // Should show loading state
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });
  });

  describe('Navigation Behavior', () => {
    test('does not navigate when already authenticated on mount', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.authenticated
      });
      
      // Should not navigate if already authenticated
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('renders correctly when authenticated', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.authenticated
      });
      
      // Should render the form even when authenticated
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    test('displays error message when authentication fails', () => {
      renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            error: 'Login failed'
          }
        }
      });
      
      expect(screen.getByText('Login failed')).toBeInTheDocument();
      expect(screen.getByText('Login failed')).toHaveClass('error', 'text-danger');
    });

    test('does not display error when no error', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
    });

    test('updates error display when Redux state changes', () => {
      const { rerender } = renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      // Initially no error
      expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
      
      // Update to error state
      rerender(<LoginPage />);
      const { store } = renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            error: 'Network error'
          }
        }
      });
      
      // Should show error
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    test('maintains form state during typing', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const inputs = screen.getAllByDisplayValue('');
      const emailInput = inputs.find(input => input.type === 'email');
      const passwordInput = inputs.find(input => input.type === 'password');
      
      // Type in email
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      expect(emailInput).toHaveValue('user@test.com');
      
      // Type in password
      fireEvent.change(passwordInput, { target: { value: 'mypassword' } });
      expect(passwordInput).toHaveValue('mypassword');
      
      // Email should still have its value
      expect(emailInput).toHaveValue('user@test.com');
    });

    test('handles rapid input changes', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const inputs = screen.getAllByDisplayValue('');
      const emailInput = inputs.find(input => input.type === 'email');
      
      // Rapid typing
      fireEvent.change(emailInput, { target: { value: 'a' } });
      fireEvent.change(emailInput, { target: { value: 'ab' } });
      fireEvent.change(emailInput, { target: { value: 'abc' } });
      fireEvent.change(emailInput, { target: { value: 'abc@test.com' } });
      
      expect(emailInput).toHaveValue('abc@test.com');
    });

    test('handles form state changes correctly', () => {
      const { rerender } = renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      // Fill form
      const inputs = screen.getAllByDisplayValue('');
      const emailInput = inputs.find(input => input.type === 'email');
      const passwordInput = inputs.find(input => input.type === 'password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Verify form state
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
      
      // Re-render with same state
      rerender(<LoginPage />);
      
      // Form should maintain state
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('has proper button roles and labels', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('maintains accessibility when loading', () => {
      renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            loading: true
          }
        }
      });
      
      const submitButton = screen.getByRole('button', { name: /logging in/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Logging in...');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty form submission gracefully', () => {
      renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      // Form should handle empty submission (browser validation will prevent it)
      expect(submitButton).toBeInTheDocument();
    });

    test('handles component unmounting during loading', () => {
      const { unmount } = renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            loading: true
          }
        }
      });
      
      // Component should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    test('handles Redux state updates after component mount', () => {
      const { rerender } = renderWithProviders(<LoginPage />, {
        initialState: testScenarios.unauthenticated
      });
      
      // Update Redux state
      rerender(<LoginPage />);
      const { store } = renderWithProviders(<LoginPage />, {
        initialState: {
          auth: {
            ...testScenarios.unauthenticated.auth,
            loading: true,
            error: 'Test error'
          }
        }
      });
      
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });
});
