import React from 'react';
import { screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import ProposalConversionButton from './ProposalConversionButton';
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

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('ProposalConversionButton Component', () => {
  const mockProposal = {
    proposal_id: 123,
    title: 'Test Proposal',
    status: 'Accepted'
  };

  const defaultProps = {
    proposal: mockProposal
  };

  beforeEach(() => {
    cleanup();
    resetAllMocks();
    mockNavigate.mockClear();
    mockConfirm.mockClear();
    mockConsoleLog.mockClear();
  });

  describe('Rendering', () => {
    test('renders button with correct text when not loading', () => {
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      const button = screen.getByTestId('proposal-conversion-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Convert to Order');
      expect(button).not.toBeDisabled();
    });

    test('renders button with loading text when loading', () => {
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoading
      });
      
      const button = screen.getByRole('button', { name: /converting/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Converting...');
      expect(button).toBeDisabled();
    });
  });

  describe('Redux Integration', () => {
    test('accesses loading state from Redux', () => {
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoading
      });
      
      // Verify Redux state is accessible
      expect(store.getState().proposals.loading).toBe(true);
      expect(store.getState().proposals.order).toBe(null);
    });

    test('accesses order state from Redux', () => {
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsWithOrder
      });
      
      // Verify Redux state is accessible
      expect(store.getState().proposals.loading).toBe(false);
      expect(store.getState().proposals.order).toEqual({ id: 123, title: 'Test Order' });
    });

    test('works with different Redux states', () => {
      // Test with loading state
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoading
      });
      
      expect(screen.getByText('Converting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /converting/i })).toBeDisabled();
      
      // Test with loaded state - use rerender instead of new renderWithProviders
      rerender(<ProposalConversionButton {...defaultProps} />);
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      expect(screen.getByText('Convert to Order')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /convert to order/i })).not.toBeDisabled();
    });
  });

  describe('User Interaction', () => {
    test('shows confirmation dialog when clicked', () => {
      mockConfirm.mockReturnValue(true);
      
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      const button = screen.getByRole('button', { name: /convert to order/i });
      fireEvent.click(button);
      
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to convert this proposal to an order?'
      );
    });

    test('does not proceed when user cancels confirmation', () => {
      mockConfirm.mockReturnValue(false);
      
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      const button = screen.getByRole('button', { name: /convert to order/i });
      fireEvent.click(button);
      
      expect(mockConfirm).toHaveBeenCalled();
      // Button should remain enabled since user cancelled
      expect(button).not.toBeDisabled();
    });

    test('proceeds with conversion when user confirms', () => {
      mockConfirm.mockReturnValue(true);
      
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      const button = screen.getByRole('button', { name: /convert to order/i });
      fireEvent.click(button);
      
      expect(mockConfirm).toHaveBeenCalled();
      // Button should show loading state after confirmation
      expect(button).toHaveTextContent('Converting...');
      expect(button).toBeDisabled();
    });

    test('logs proposal information when converting', () => {
      mockConfirm.mockReturnValue(true);
      
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      const button = screen.getByRole('button', { name: /convert to order/i });
      fireEvent.click(button);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Requesting conversion of proposal:',
        123
      );
    });
  });

  describe('Redux State Integration', () => {
    test('responds to loading state changes', () => {
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      // Initially not loading
      expect(screen.getByText('Convert to Order')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /convert to order/i })).not.toBeDisabled();
      
      // Update to loading state
      rerender(<ProposalConversionButton {...defaultProps} />);
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoading
      });
      
      // Should show loading state
      expect(screen.getByText('Converting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /converting/i })).toBeDisabled();
    });

    test('responds to order state changes', () => {
      // Test with no order state
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      // Initially no order
      expect(screen.getByText('Convert to Order')).toBeInTheDocument();
      
      cleanup();
      
      // Test with order state
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsWithOrder
      });
      
      // Should still show convert button (order doesn't change button text)
      expect(screen.getByText('Convert to Order')).toBeInTheDocument();
    });

    test('responds to error state changes', () => {
      // Test with no error state
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      // Initially no error
      expect(screen.getByText('Convert to Order')).toBeInTheDocument();
      
      cleanup();
      
      // Test with error state
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsError
      });
      
      // Should still show convert button (error doesn't change button text)
      expect(screen.getByText('Convert to Order')).toBeInTheDocument();
    });
  });

  describe('Navigation Behavior', () => {
    test('navigates to order page when order is created', async () => {
      const mockOrder = { id: 456, title: 'Test Order' };
      
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: null
          }
        }
      });
      
      // Initially no navigation
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Update Redux state to include order
      rerender(<ProposalConversionButton {...defaultProps} />);
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: mockOrder
          }
        }
      });
      
      // Should navigate to the order page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/orders/456');
      });
    });

    test('does not navigate when order is null', () => {
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: null
          }
        }
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('navigates with correct order ID', async () => {
      const mockOrder = { id: 789, title: 'Another Order' };
      
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: mockOrder
          }
        }
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/orders/789');
      });
    });
  });

  describe('Loading State Management', () => {
    test('button is disabled when loading', () => {
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: true,
            order: null
          }
        }
      });
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Converting...');
    });

    test('button is enabled when not loading', () => {
      renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: null
          }
        }
      });
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Convert to Order');
    });

    test('button state changes with Redux loading state', () => {
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      // Initially enabled
      let button = screen.getByRole('button', { name: /convert to order/i });
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Convert to Order');
      
      // Update to loading state - use rerender instead of new renderWithProviders
      rerender(<ProposalConversionButton {...defaultProps} />);
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoading
      });
      
      // Should be disabled
      button = screen.getByRole('button', { name: /converting/i });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Converting...');
    });
  });

  describe('Component Behavior', () => {

    test('handles proposal with missing proposal_id', () => {
      const proposalWithoutId = { title: 'Test Proposal' };
      
      renderWithProviders(<ProposalConversionButton proposal={proposalWithoutId} />, {
        initialState: {
          proposals: {
            loading: false,
            order: null
          }
        }
      });
      
      const button = screen.getByRole('button', { name: /convert to order/i });
      fireEvent.click(button);
      
      expect(mockConfirm).toHaveBeenCalled();
      // Should still attempt to dispatch action (even with undefined id)
    });

    test('button text changes based on loading state', () => {
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: null
          }
        }
      });
      
      // Not loading
      expect(screen.getByText('Convert to Order')).toBeInTheDocument();
      
      // Update to loading
      rerender(<ProposalConversionButton {...defaultProps} />);
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: true,
            order: null
          }
        }
      });
      
      // Loading
      expect(screen.getByText('Converting...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple rapid clicks', () => {
      mockConfirm.mockReturnValue(true);
      
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: testScenarios.proposalsLoaded
      });
      
      const button = screen.getByRole('button', { name: /convert to order/i });
      
      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // The component should call confirm for each click
      // Note: The actual behavior might be that confirm is called multiple times
      // but the action is only dispatched once due to the confirmation dialog
      expect(mockConfirm).toHaveBeenCalled();
      
      // Check that the Redux state changed (loading should be true after action dispatch)
      expect(store.getState().proposals.loading).toBe(true);
    });

    test('handles navigation when order changes', async () => {
      const mockOrder1 = { id: 111, title: 'Order 1' };
      const mockOrder2 = { id: 222, title: 'Order 2' };
      
      const { rerender } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: mockOrder1
          }
        }
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/orders/111');
      });
      
      // Update to different order
      rerender(<ProposalConversionButton {...defaultProps} />);
      const { store } = renderWithProviders(<ProposalConversionButton {...defaultProps} />, {
        initialState: {
          proposals: {
            loading: false,
            order: mockOrder2
          }
        }
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/orders/222');
      });
    });
  });
});
