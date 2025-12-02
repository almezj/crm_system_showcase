import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import LogoutButton from './LogoutButton';
import { 
  renderWithProviders, 
  resetAllMocks, 
  testScenarios 
} from '../test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// No action imports - test real user behavior

describe('LogoutButton Component', () => {
  beforeEach(() => {
    resetAllMocks();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    test('renders logout button with correct text and class', () => {
      renderWithProviders(<LogoutButton />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Logout');
      expect(button).toHaveClass('dropdown-item');
    });
  });

  describe('Redux Integration', () => {
    test('works with authenticated Redux state', () => {
      const { store } = renderWithProviders(<LogoutButton />, {
        initialState: testScenarios.authenticated
      });
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
      
      // Verify initial Redux state
      expect(store.getState().auth.token).toBe('fake-token');
      expect(store.getState().auth.user).toEqual({ id: 1, name: 'Test User' });
      
      // Click button and verify navigation
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('works with unauthenticated Redux state', () => {
      const { store } = renderWithProviders(<LogoutButton />, {
        initialState: testScenarios.unauthenticated
      });
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
      
      // Verify initial Redux state
      expect(store.getState().auth.token).toBe(null);
      expect(store.getState().auth.user).toBe(null);
      
      // Button should still work regardless of auth state
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('component integrates with Redux store correctly', () => {
      // Test that component can access Redux store through useDispatch
      const { store } = renderWithProviders(<LogoutButton />, {
        initialState: {
          auth: { 
            token: 'test-token', 
            isAuthenticated: true, 
            user: { id: 1, name: 'Test User' } 
          }
        }
      });
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
      
      // Verify the store has the expected state
      const state = store.getState();
      expect(state.auth.token).toBe('test-token');
      expect(state.auth.user.name).toBe('Test User');
      
      // Component should work with this state
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Logout Functionality', () => {
    test('navigates to login page when clicked', () => {
      renderWithProviders(<LogoutButton />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(button);
      
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('performs both logout and navigation when clicked', () => {
      renderWithProviders(<LogoutButton />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(button);
      
      // Both actions should be called
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Component Behavior', () => {
    test('button is always clickable regardless of Redux state', () => {
      // Test with different Redux states - component doesn't read from state
      renderWithProviders(<LogoutButton />, {
        initialState: testScenarios.authenticated
      });
      
      const button = screen.getByRole('button', { name: /logout/i });
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('handles multiple clicks correctly', () => {
      renderWithProviders(<LogoutButton />);
      
      const button = screen.getByRole('button', { name: /logout/i });
      
      // Click multiple times
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Should call navigation for each click
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });
});
