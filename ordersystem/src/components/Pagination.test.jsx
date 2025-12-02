import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import Pagination from './Pagination';
import { renderWithProviders, resetAllMocks } from '../test-utils';

describe('Pagination Component', () => {
  const mockOnPageChange = vi.fn();

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: mockOnPageChange,
    showPageInfo: true,
    maxVisiblePages: 7
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnPageChange.mockClear();
  });

  describe('Rendering', () => {
    test('renders nothing when totalPages is 1 or less', () => {
      const { container } = renderWithProviders(
        <Pagination {...defaultProps} totalPages={1} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    test('renders nothing when totalPages is 0', () => {
      const { container } = renderWithProviders(
        <Pagination {...defaultProps} totalPages={0} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    test('renders pagination when totalPages is greater than 1', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Page navigation')).toBeInTheDocument();
    });

    test('renders page info when showPageInfo is true', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      expect(screen.getByText('Page 1 of 10 • 10 total pages')).toBeInTheDocument();
    });

    test('does not render page info when showPageInfo is false', () => {
      renderWithProviders(
        <Pagination {...defaultProps} showPageInfo={false} />
      );
      
      expect(screen.queryByText('Page 1 of 10 • 10 total pages')).not.toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    test('renders previous and next buttons', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    test('disables previous button on first page', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={1} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
      expect(prevButton.closest('li')).toHaveClass('disabled');
    });

    test('enables previous button when not on first page', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={3} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).not.toBeDisabled();
      expect(prevButton.closest('li')).not.toHaveClass('disabled');
    });

    test('disables next button on last page', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={10} />);
      
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDisabled();
      expect(nextButton.closest('li')).toHaveClass('disabled');
    });

    test('enables next button when not on last page', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={5} />);
      
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).not.toBeDisabled();
      expect(nextButton.closest('li')).not.toHaveClass('disabled');
    });

    test('calls onPageChange with correct page when previous button is clicked', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={3} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      fireEvent.click(prevButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    test('calls onPageChange with correct page when next button is clicked', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={3} />);
      
      const nextButton = screen.getByLabelText('Next page');
      fireEvent.click(nextButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    test('does not call onPageChange when previous button is disabled', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={1} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      fireEvent.click(prevButton);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    test('does not call onPageChange when next button is disabled', () => {
      renderWithProviders(<Pagination {...defaultProps} currentPage={10} />);
      
      const nextButton = screen.getByLabelText('Next page');
      fireEvent.click(nextButton);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Page Numbers Display', () => {
    test('shows all pages when totalPages is less than or equal to maxVisiblePages', () => {
      renderWithProviders(
        <Pagination {...defaultProps} totalPages={5} maxVisiblePages={7} />
      );
      
      // Should show pages 1, 2, 3, 4, 5
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    test('shows ellipsis when near the beginning', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={2} totalPages={20} maxVisiblePages={7} />
      );
      
      // Should show: 1, 2, 3, 4, 5, 6, ..., 20
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 6')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    test('shows ellipsis when near the end', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={18} totalPages={20} maxVisiblePages={7} />
      );
      
      // Should show: 1, ..., 15, 16, 17, 18, 19, 20
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 15')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    test('shows ellipsis on both sides when in the middle', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={10} totalPages={20} maxVisiblePages={7} />
      );
      
      // Should show: 1, ..., 7, 8, 9, 10, 11, 12, 13, ..., 20
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
      
      const ellipsis = screen.getAllByText('...');
      expect(ellipsis).toHaveLength(2);
    });

    test('highlights current page', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={5} />
      );
      
      const currentPageButton = screen.getByLabelText('Page 5');
      expect(currentPageButton.closest('li')).toHaveClass('active');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    test('does not highlight non-current pages', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={5} />
      );
      
      const otherPageButton = screen.getByLabelText('Page 3');
      expect(otherPageButton.closest('li')).not.toHaveClass('active');
      expect(otherPageButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('Page Number Clicks', () => {
    test('calls onPageChange when page number is clicked', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      const pageButton = screen.getByLabelText('Page 3');
      fireEvent.click(pageButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    test('calls onPageChange for different page numbers', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('Page 2'));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
      
      fireEvent.click(screen.getByLabelText('Page 5'));
      expect(mockOnPageChange).toHaveBeenCalledWith(5);
      
      fireEvent.click(screen.getByLabelText('Page 10'));
      expect(mockOnPageChange).toHaveBeenCalledWith(10);
    });

    test('does not call onPageChange when ellipsis is clicked', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={10} totalPages={20} maxVisiblePages={7} />
      );
      
      const ellipsis = screen.getAllByText('...')[0];
      fireEvent.click(ellipsis);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles totalPages of 2', () => {
      renderWithProviders(
        <Pagination {...defaultProps} totalPages={2} currentPage={1} />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    test('handles very large totalPages', () => {
      renderWithProviders(
        <Pagination {...defaultProps} totalPages={1000} currentPage={500} maxVisiblePages={7} />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 1000')).toBeInTheDocument();
      expect(screen.getAllByText('...')).toHaveLength(2);
    });

    test('handles maxVisiblePages of 3', () => {
      renderWithProviders(
        <Pagination {...defaultProps} totalPages={10} currentPage={5} maxVisiblePages={3} />
      );
      
      // Should show: 1, ..., 5, ..., 10
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 10')).toBeInTheDocument();
      expect(screen.getAllByText('...')).toHaveLength(2);
    });

    test('handles currentPage at exact boundaries', () => {
      // Test at beginning
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={1} totalPages={20} maxVisiblePages={7} />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 6')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
    });

    test('handles currentPage at end boundary', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={20} totalPages={20} maxVisiblePages={7} />
      );
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 15')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    test('handles missing optional props with defaults', () => {
      renderWithProviders(
        <Pagination 
          currentPage={1} 
          totalPages={5} 
          onPageChange={mockOnPageChange} 
        />
      );
      
      // Should use default values
      expect(screen.getByText('Page 1 of 5 • 5 total pages')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
    });

    test('handles custom maxVisiblePages', () => {
      renderWithProviders(
        <Pagination {...defaultProps} maxVisiblePages={5} totalPages={20} />
      );
      
      // Should show fewer pages
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    test('handles showPageInfo false', () => {
      renderWithProviders(
        <Pagination {...defaultProps} showPageInfo={false} />
      );
      
      expect(screen.queryByText('Page 1 of 10 • 10 total pages')).not.toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      expect(screen.getByLabelText('Page navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    });

    test('has proper ARIA current attribute for current page', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={3} />
      );
      
      const currentPageButton = screen.getByLabelText('Page 3');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
      
      const otherPageButton = screen.getByLabelText('Page 1');
      expect(otherPageButton).not.toHaveAttribute('aria-current');
    });

    test('has proper disabled states', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={1} />
      );
      
      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
      
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).not.toBeDisabled();
    });

    test('maintains keyboard navigation', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      const pageButtons = screen.getAllByRole('button');
      pageButtons.forEach(button => {
        expect(button).toBeInTheDocument();
        // All buttons should be focusable unless disabled
        if (!button.disabled) {
          expect(button).not.toHaveAttribute('tabindex', '-1');
        }
      });
    });
  });

  describe('Visual States', () => {
    test('applies correct CSS classes for active page', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={3} />
      );
      
      const activePageItem = screen.getByLabelText('Page 3').closest('li');
      expect(activePageItem).toHaveClass('active');
    });

    test('applies correct CSS classes for disabled buttons', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={1} />
      );
      
      const disabledPrevItem = screen.getByLabelText('Previous page').closest('li');
      expect(disabledPrevItem).toHaveClass('disabled');
    });

    test('renders ellipsis with correct class', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={10} totalPages={20} maxVisiblePages={7} />
      );
      
      const ellipsis = screen.getAllByText('...')[0];
      expect(ellipsis).toHaveClass('pagination-ellipsis');
    });
  });

  describe('Component Behavior', () => {
    test('updates when props change', () => {
      const { rerender } = renderWithProviders(
        <Pagination {...defaultProps} currentPage={1} />
      );
      
      expect(screen.getByText('Page 1 of 10 • 10 total pages')).toBeInTheDocument();
      
      rerender(
        <Pagination {...defaultProps} currentPage={5} />
      );
      
      expect(screen.getByText('Page 5 of 10 • 10 total pages')).toBeInTheDocument();
    });

    test('handles rapid page changes', () => {
      renderWithProviders(<Pagination {...defaultProps} />);
      
      // Click multiple pages rapidly
      fireEvent.click(screen.getByLabelText('Page 2'));
      fireEvent.click(screen.getByLabelText('Page 3'));
      fireEvent.click(screen.getByLabelText('Page 4'));
      
      expect(mockOnPageChange).toHaveBeenCalledTimes(3);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    test('maintains state consistency', () => {
      renderWithProviders(
        <Pagination {...defaultProps} currentPage={5} totalPages={10} />
      );
      
      // All page numbers should be within valid range
      const pageButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.startsWith('Page ')
      );
      
      pageButtons.forEach(button => {
        const pageNumber = parseInt(button.textContent);
        expect(pageNumber).toBeGreaterThanOrEqual(1);
        expect(pageNumber).toBeLessThanOrEqual(10);
      });
    });
  });
});
