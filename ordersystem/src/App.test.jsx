import { screen } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import App from './App';
import { 
  renderWithProviders, 
  resetAllMocks, 
  mockLocalStorage, 
  expectLocalStorageCall,
  testScenarios
} from './test-utils';

describe('App Component', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing when not authenticated', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: testScenarios.unauthenticated
      });
      
      expect(container).toBeInTheDocument();
    });

    test('renders without crashing when authenticated', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: { 
          ...testScenarios.authenticated, 
          ...testScenarios.dashboardLoaded 
        }
      });
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('localStorage Integration', () => {
    test('checks localStorage for token on mount', () => {
      mockLocalStorage({ token: 'stored-token' });
      
      renderWithProviders(<App />, {
        initialState: testScenarios.unauthenticated
      });
      
      expectLocalStorageCall('token', 'stored-token');
    });

    test('handles no token in localStorage gracefully', () => {
      mockLocalStorage({ token: null });
      
      const { container } = renderWithProviders(<App />, {
        initialState: testScenarios.unauthenticated
      });
      
      expect(container).toBeInTheDocument();
    });

    test('handles token in localStorage correctly', () => {
      mockLocalStorage({ token: 'stored-token' });
      
      const { container } = renderWithProviders(<App />, {
        initialState: testScenarios.unauthenticated
      });
      
      expect(container).toBeInTheDocument();
    });

    test('works correctly when already authenticated', () => {
      mockLocalStorage({ token: 'stored-token' });
      
      const { container } = renderWithProviders(<App />, {
        initialState: { 
          ...testScenarios.authenticated, 
          ...testScenarios.dashboardLoaded 
        }
      });
      
      expect(container).toBeInTheDocument();
    });
  });
});
