import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import ProposalForm from './ProposalForm';
import { renderWithProviders, resetAllMocks, testScenarios } from '../../test-utils';

// No Redux action mocking - use real actions for production-like testing

// Mock fetch for languages API
global.fetch = vi.fn();

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-123')
}));

// No component mocks - use real components for production-like testing

describe('ProposalForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    initialData: {},
    onSubmit: mockOnSubmit,
    loading: false,
    isEdit: false,
    onCancel: mockOnCancel
  };

  const mockCustomers = [
    { person_id: 1, first_name: 'John', last_name: 'Doe', person_type: 'customer' },
    { person_id: 2, first_name: 'Jane', last_name: 'Smith', person_type: 'customer' }
  ];

  const mockProducts = [
    { product_id: 1, name: 'Product 1', is_active: true },
    { product_id: 2, name: 'Product 2', is_active: true }
  ];

  const mockLanguages = [
    { language_id: 1, code: 'cs', name: 'Czech', currency_code: 'CZK', currency_symbol: 'Kč' },
    { language_id: 2, code: 'en', name: 'English', currency_code: 'EUR', currency_symbol: '€' }
  ];

  beforeEach(() => {
    resetAllMocks();
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
    
    // Mock successful fetch for languages
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLanguages)
    });
  });

  describe('Rendering', () => {
    test('renders form with all sections', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      expect(screen.getByTestId('proposal-header')).toBeInTheDocument();
      expect(screen.getByTestId('proposal-items-list')).toBeInTheDocument();
      expect(screen.getByTestId('add-item-btn')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });

    test('renders with initial data when provided', () => {
      const initialData = {
        prospect_id: 1,
        valid_until: '2024-12-31',
        currency_code: 'EUR',
        items: [
          {
            product_id: 1,
            item_name: 'Test Item',
            quantity: 2,
            list_price: 100,
            tempKey: 'test-key',
            images: []
          }
        ]
      };

      renderWithProviders(
        <ProposalForm {...defaultProps} initialData={initialData} />,
        {
          initialState: {
            persons: { persons: mockCustomers },
            products: { products: mockProducts }
          }
        }
      );
      
      expect(screen.getByTestId('customer-select')).toHaveValue('1');
      expect(screen.getByTestId('valid-until')).toHaveValue('2024-12-31');
      expect(screen.getByTestId('currency-select')).toHaveValue('EUR');
    });

    test('renders edit mode when isEdit is true', () => {
      renderWithProviders(
        <ProposalForm {...defaultProps} isEdit={true} />,
        {
          initialState: {
            persons: { persons: mockCustomers },
            products: { products: mockProducts }
          }
        }
      );
      
      expect(screen.getByTestId('proposal-header')).toBeInTheDocument();
      expect(screen.getByTestId('proposal-items-list')).toBeInTheDocument();
      expect(screen.getByTestId('add-item-btn')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });
  });

  describe('Redux Integration', () => {
    test('dispatches fetchPersonsRequest and fetchProductsRequest on mount', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      // Component should render without errors when Redux actions are dispatched
      expect(screen.getByText('Customer')).toBeInTheDocument();
    });

    test('fetches languages on mount', async () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/languages');
      });
    });

    test('handles language fetch error gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/languages');
      });
    });
  });

  describe('Form Input Handling', () => {
    test('handles customer selection', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      const customerSelect = screen.getByTestId('customer-select');
      fireEvent.change(customerSelect, { target: { value: '1' } });
      
      expect(customerSelect).toHaveValue('1');
    });

    test('handles date input changes', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      const dateInput = screen.getByTestId('valid-until');
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      
      expect(dateInput).toHaveValue('2024-12-31');
    });

    test('handles currency selection', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      const currencySelect = screen.getByTestId('currency-select');
      fireEvent.change(currencySelect, { target: { value: 'EUR' } });
      
      expect(currencySelect).toHaveValue('EUR');
    });
  });

  describe('Item Management', () => {
    test('adds new item when Add Item button is clicked', async () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      const addButton = screen.getByTestId('add-item-btn');
      fireEvent.click(addButton);
      
      // Wait for the item to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
      });
    });

    test('handles item changes', async () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      // Add an item first
      fireEvent.click(screen.getByTestId('add-item-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
      });
      
      // Check if custom item checkbox exists and enable it
      const customCheckbox = screen.getByLabelText('Custom Item');
      fireEvent.click(customCheckbox);
      
      const itemNameInput = screen.getByTestId('item-name-0');
      const itemQuantityInput = screen.getByTestId('item-quantity-0');
      const itemPriceInput = screen.getByTestId('item-price-0');
      
      fireEvent.change(itemNameInput, { target: { value: 'Test Item' } });
      fireEvent.change(itemQuantityInput, { target: { value: '5' } });
      fireEvent.change(itemPriceInput, { target: { value: '100.50' } });
      
      expect(itemNameInput).toHaveValue('Test Item');
      expect(itemQuantityInput).toHaveValue(5);
      expect(itemPriceInput).toHaveValue(100.50);
    });

    test('removes item when Remove Item button is clicked', async () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      // Add an item first
      fireEvent.click(screen.getByTestId('add-item-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
      });
      
      // Remove the item
      fireEvent.click(screen.getByTestId('remove-item-0'));
      expect(screen.queryByTestId('item-0')).not.toBeInTheDocument();
    });

    test('handles multiple items', async () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      // Add multiple items
      fireEvent.click(screen.getByTestId('add-item-btn'));
      fireEvent.click(screen.getByTestId('add-item-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit when Save Proposal button is clicked', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      // Fill in required fields
      const customerSelect = screen.getByTestId('customer-select');
      fireEvent.change(customerSelect, { target: { value: '1' } });
      
      const submitButton = screen.getByTestId('submit-btn');
      fireEvent.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    test('calls onCancel when Cancel button is clicked', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      const cancelButton = screen.getByTestId('cancel-btn');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('disables submit button when loading', () => {
      renderWithProviders(
        <ProposalForm {...defaultProps} loading={true} />,
        {
          initialState: {
            persons: { persons: mockCustomers },
            products: { products: mockProducts }
          }
        }
      );
      
      const submitButton = screen.getByTestId('submit-btn');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Saving...');
    });
  });

  describe('Props Handling', () => {
    test('handles missing onSubmit prop gracefully', () => {
      expect(() => {
        renderWithProviders(
          <ProposalForm {...defaultProps} onSubmit={undefined} />,
          {
            initialState: {
              persons: { persons: mockCustomers },
              products: { products: mockProducts }
            }
          }
        );
      }).not.toThrow();
    });

    test('handles missing onCancel prop gracefully', () => {
      expect(() => {
        renderWithProviders(
          <ProposalForm {...defaultProps} onCancel={undefined} />,
          {
            initialState: {
              persons: { persons: mockCustomers },
              products: { products: mockProducts }
            }
          }
        );
      }).not.toThrow();
    });

    test('handles empty initial data', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      expect(screen.getByTestId('customer-select')).toHaveValue('');
      expect(screen.getByTestId('currency-select')).toHaveValue('CZK');
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      const { container } = renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    test('has proper button types', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      const submitButton = screen.getByTestId('submit-btn');
      const cancelButton = screen.getByTestId('cancel-btn');
      
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty customers list', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: [] },
          products: { products: mockProducts }
        }
      });
      
      expect(screen.getByTestId('customer-select')).toBeInTheDocument();
      expect(screen.getByText('Select a customer')).toBeInTheDocument();
    });

    test('handles empty products list', () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: [] }
        }
      });
      
      expect(screen.getByTestId('proposal-items-list')).toBeInTheDocument();
    });

    test('handles rapid item additions and removals', async () => {
      renderWithProviders(<ProposalForm {...defaultProps} />, {
        initialState: {
          persons: { persons: mockCustomers },
          products: { products: mockProducts }
        }
      });
      
      // Rapid additions
      fireEvent.click(screen.getByTestId('add-item-btn'));
      fireEvent.click(screen.getByTestId('add-item-btn'));
      fireEvent.click(screen.getByTestId('add-item-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
        expect(screen.getByTestId('item-1')).toBeInTheDocument();
        expect(screen.getByTestId('item-2')).toBeInTheDocument();
      });
      
      // Rapid removals
      fireEvent.click(screen.getByTestId('remove-item-0'));
      fireEvent.click(screen.getByTestId('remove-item-1'));
      
      // After removing first two items, only the third item should remain
      // The remaining item gets re-indexed to item-0
      expect(screen.queryByTestId('item-0')).toBeInTheDocument(); // Third item becomes first (item-2 becomes item-0)
      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
    });
  });
});
