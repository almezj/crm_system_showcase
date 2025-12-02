import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import { 
  renderWithProviders, 
  resetAllMocks, 
  mockLocalStorage, 
  testScenarios,
  mockActions,
  commonAssertions
} from '../test-utils';

// Example 1: Simple Presentational Component
const SimpleButton = ({ onClick, children, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} data-testid="simple-button">
    {children}
  </button>
);

// Example 2: Component with Redux State
const UserProfile = ({ user }) => (
  <div data-testid="user-profile">
    <h2>{user?.name || 'No user'}</h2>
    <p>{user?.email || 'No email'}</p>
  </div>
);

// Example 3: Component with Redux Actions
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
        placeholder="Password"
      />
      <button type="submit" data-testid="login-button">Login</button>
    </form>
  );
};

// Example 4: Component with localStorage
const ThemeToggle = () => {
  const [theme, setTheme] = React.useState(() => 
    localStorage.getItem('theme') || 'light'
  );

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button onClick={toggleTheme} data-testid="theme-toggle">
      Current theme: {theme}
    </button>
  );
};

// Example 5: Component with Loading/Error States
const DataList = ({ data, loading, error }) => {
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">Error: {error}</div>;
  if (!data || data.length === 0) return <div data-testid="empty">No data available</div>;

  return (
    <ul data-testid="data-list">
      {data.map((item, index) => (
        <li key={index} data-testid={`item-${index}`}>
          {item.name}
        </li>
      ))}
    </ul>
  );
};

describe('Component Testing Examples', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Simple Presentational Component', () => {
    test('renders button with correct text', () => {
      renderWithProviders(<SimpleButton>Click me</SimpleButton>);
      
      const button = screen.getByTestId('simple-button');
      expect(button).toHaveTextContent('Click me');
    });

    test('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      renderWithProviders(<SimpleButton onClick={handleClick}>Click me</SimpleButton>);
      
      const button = screen.getByTestId('simple-button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('is disabled when disabled prop is true', () => {
      renderWithProviders(<SimpleButton disabled={true}>Click me</SimpleButton>);
      
      const button = screen.getByTestId('simple-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Component with Redux State', () => {
    test('displays user information when user is present', () => {
      const user = { name: 'John Doe', email: 'john@example.com' };
      
      renderWithProviders(<UserProfile user={user} />, {
        initialState: { auth: { user } }
      });
      
      expect(screen.getByTestId('user-profile')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('john@example.com');
    });

    test('displays fallback when user is null', () => {
      renderWithProviders(<UserProfile user={null} />);
      
      expect(screen.getByTestId('user-profile')).toHaveTextContent('No user');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('No email');
    });
  });

  describe('Component with Redux Actions', () => {
    test('calls onLogin with form data when submitted', () => {
      const handleLogin = vi.fn();
      renderWithProviders(<LoginForm onLogin={handleLogin} />);
      
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      expect(handleLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('updates input values when typing', () => {
      renderWithProviders(<LoginForm onLogin={vi.fn()} />);
      
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Component with localStorage', () => {
    test('reads theme from localStorage on mount', () => {
      mockLocalStorage({ theme: 'dark' });
      
      renderWithProviders(<ThemeToggle />);
      
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Current theme: dark');
    });

    test('updates theme and saves to localStorage when clicked', () => {
      mockLocalStorage({ theme: 'light' });
      
      renderWithProviders(<ThemeToggle />);
      
      const toggleButton = screen.getByTestId('theme-toggle');
      fireEvent.click(toggleButton);
      
      expect(toggleButton).toHaveTextContent('Current theme: dark');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('Component with Loading/Error States', () => {
    test('shows loading state when loading is true', () => {
      renderWithProviders(<DataList data={[]} loading={true} error={null} />);
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
    });

    test('shows error state when error is present', () => {
      const errorMessage = 'Failed to fetch data';
      renderWithProviders(<DataList data={[]} loading={false} error={errorMessage} />);
      
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByTestId('error')).toHaveTextContent('Error: Failed to fetch data');
    });

    test('shows empty state when no data', () => {
      renderWithProviders(<DataList data={[]} loading={false} error={null} />);
      
      expect(screen.getByTestId('empty')).toBeInTheDocument();
      expect(screen.getByTestId('empty')).toHaveTextContent('No data available');
    });

    test('shows data list when data is present', () => {
      const data = [
        { name: 'Item 1' },
        { name: 'Item 2' },
        { name: 'Item 3' }
      ];
      
      renderWithProviders(<DataList data={data} loading={false} error={null} />);
      
      expect(screen.getByTestId('data-list')).toBeInTheDocument();
      expect(screen.getByTestId('item-0')).toHaveTextContent('Item 1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Item 2');
      expect(screen.getByTestId('item-2')).toHaveTextContent('Item 3');
    });
  });

  describe('Integration Tests', () => {
    test('component works with Redux store and localStorage together', () => {
      mockLocalStorage({ theme: 'dark' });
      
      const { store } = renderWithProviders(
        <div>
          <UserProfile user={{ name: 'John', email: 'john@example.com' }} />
          <ThemeToggle />
        </div>,
        {
          initialState: testScenarios.authenticated
        }
      );
      
      // Check Redux state
      expect(store.getState().auth.token).toBe('fake-token');
      
      // Check localStorage integration
      expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Current theme: dark');
      
      // Check component rendering
      expect(screen.getByTestId('user-profile')).toHaveTextContent('John');
    });
  });
});
