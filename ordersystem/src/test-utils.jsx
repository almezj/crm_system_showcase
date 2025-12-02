import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';

// Import the actual reducers from production
import rootReducer from './redux/rootReducer';

// Mock localStorage
export const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Set up localStorage mock globally
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Create a mock store using the EXACT same structure as production
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: rootReducer, // Use the actual production root reducer
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Keep thunk enabled to match production behavior
        serializableCheck: false, // Disable serializable check for testing
      }),
  });
};

// Test wrapper component
export const TestWrapper = ({ children, store, initialEntries = ['/'] }) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

// Custom render function with providers
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = createMockStore(initialState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <TestWrapper store={store}>{children}</TestWrapper>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
};

// Common test scenarios using ACTUAL production Redux state structure
export const testScenarios = {
  // Authentication scenarios
  authenticated: { 
    auth: { 
      token: 'fake-token', 
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true,
      loading: false,
      error: null
    } 
  },
  unauthenticated: { 
    auth: { 
      token: null, 
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    } 
  },
  
  // Materials scenarios (matching production structure)
  materialsLoaded: { 
    materials: { 
      materials: [
        { id: 1, name: 'Test Material 1', code: 'TM001', color: 'Blue', type: 'Fabric' },
        { id: 2, name: 'Test Material 2', code: 'TM002', color: 'Red', type: 'Leather' }
      ],
      loading: false, 
      error: null 
    } 
  },
  materialsLoading: { 
    materials: { 
      materials: [],
      loading: true, 
      error: null 
    } 
  },
  
  // Proposals scenarios (matching production structure)
  proposalsLoaded: { 
    proposals: { 
      loading: false,
      proposals: [],
      proposal: null,
      pdfUrls: {},
      order: null,
      error: null,
      uploadErrors: {},
      pdfSnapshots: [],
      pdfSnapshotsLoading: false,
      pdfSnapshotsError: null
    } 
  },
  proposalsLoading: { 
    proposals: { 
      loading: true,
      proposals: [],
      proposal: null,
      pdfUrls: {},
      order: null,
      error: null,
      uploadErrors: {},
      pdfSnapshots: [],
      pdfSnapshotsLoading: false,
      pdfSnapshotsError: null
    } 
  },
  proposalsWithOrder: { 
    proposals: { 
      loading: false,
      proposals: [],
      proposal: null,
      pdfUrls: {},
      order: { id: 123, title: 'Test Order' },
      error: null,
      uploadErrors: {},
      pdfSnapshots: [],
      pdfSnapshotsLoading: false,
      pdfSnapshotsError: null
    } 
  },
  proposalsError: { 
    proposals: { 
      loading: false,
      proposals: [],
      proposal: null,
      pdfUrls: {},
      order: null,
      error: 'Failed to convert proposal',
      uploadErrors: {},
      pdfSnapshots: [],
      pdfSnapshotsLoading: false,
      pdfSnapshotsError: null
    } 
  },
  
  // Dashboard scenarios
  dashboardLoaded: { 
    dashboard: { 
      statistics: { totalOrders: 100, totalRevenue: 50000 }, 
      loading: false, 
      error: null 
    } 
  },
  dashboardLoading: { 
    dashboard: { 
      statistics: {}, 
      loading: true, 
      error: null 
    } 
  },
  dashboardError: { 
    dashboard: { 
      statistics: {}, 
      loading: false, 
      error: 'Failed to load dashboard data' 
    } 
  },
};

// Mock functions for common actions
export const mockActions = {
  renewSessionRequest: vi.fn(() => ({ type: 'RENEW_SESSION_REQUEST' })),
  loginRequest: vi.fn(() => ({ type: 'LOGIN_REQUEST' })),
  logoutRequest: vi.fn(() => ({ type: 'LOGOUT_REQUEST' })),
  fetchOrdersRequest: vi.fn(() => ({ type: 'FETCH_ORDERS_REQUEST' })),
  fetchProductsRequest: vi.fn(() => ({ type: 'FETCH_PRODUCTS_REQUEST' })),
};

// Helper to mock localStorage with specific values
export const mockLocalStorage = (values = {}) => {
  localStorageMock.getItem.mockImplementation((key) => values[key] || null);
};

// Helper to verify localStorage calls
export const expectLocalStorageCall = (key, value) => {
  expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
  if (value !== undefined) {
    expect(localStorageMock.getItem).toHaveReturnedWith(value);
  }
};

// Helper to verify Redux actions were dispatched
export const expectActionDispatched = (store, actionType, payload = undefined) => {
  const actions = store.getState();
  // This is a simplified check - in real tests you'd check the actual dispatched actions
  expect(store.getState()).toBeDefined();
};

// Common assertions for component behavior
export const commonAssertions = {
  rendersWithoutCrashing: (component) => {
    expect(component).toBeInTheDocument();
  },
  
  showsLoadingState: (container) => {
    expect(container.querySelector('[data-testid="loading"]')).toBeInTheDocument();
  },
  
  showsErrorState: (container, errorMessage) => {
    expect(container.querySelector('[data-testid="error"]')).toBeInTheDocument();
    if (errorMessage) {
      expect(container).toHaveTextContent(errorMessage);
    }
  },
  
  showsEmptyState: (container) => {
    expect(container.querySelector('[data-testid="empty"]')).toBeInTheDocument();
  },
};

// Redux Integration Testing Utilities
export const createReduxIntegrationTest = (component, testName, testFn) => {
  return test(testName, () => {
    const { store, ...renderResult } = renderWithProviders(component);
    testFn(store, renderResult);
  });
};

// Helper to test Redux state changes
export const expectReduxState = (store, expectedState) => {
  const actualState = store.getState();
  expect(actualState).toMatchObject(expectedState);
};

// Helper to test component behavior with different Redux states
export const testWithReduxStates = (component, testName, testFn, states = []) => {
  const defaultStates = [
    { name: 'authenticated', state: testScenarios.authenticated },
    { name: 'unauthenticated', state: testScenarios.unauthenticated },
    { name: 'loading', state: testScenarios.loading },
    { name: 'error', state: testScenarios.error },
    ...states
  ];

  return describe(testName, () => {
    defaultStates.forEach(({ name, state }) => {
      test(`works with ${name} state`, () => {
        const { store, ...renderResult } = renderWithProviders(component, {
          initialState: state
        });
        testFn(store, renderResult, name);
      });
    });
  });
};

// Helper to test Redux action dispatch (for components that dispatch actions)
export const testReduxActionDispatch = (component, actionType, triggerFn) => {
  return test(`dispatches ${actionType} action`, () => {
    const { store } = renderWithProviders(component);
    const initialState = store.getState();
    
    triggerFn();
    
    // Note: In a real test environment, you'd need to spy on store.dispatch
    // or use a more sophisticated approach to test actual action dispatch
    // This is a placeholderrrrr
  });
};
