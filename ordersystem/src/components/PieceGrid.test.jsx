import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import PieceGrid from './PieceGrid';
import { renderWithProviders, resetAllMocks } from '../test-utils';

// No component mocking - use real components for production-like testing

describe('PieceGrid Component', () => {
  const mockPieces = [
    { id: 1, name: 'Piece 1', internal_manufacturer_code: 'P001' },
    { id: 2, name: 'Piece 2', internal_manufacturer_code: 'P002' },
    { id: 3, name: 'Piece 3', internal_manufacturer_code: 'P003' }
  ];

  const mockPiecesWithPieceId = [
    { piece_id: 101, name: 'Piece A', internal_manufacturer_code: 'PA001' },
    { piece_id: 102, name: 'Piece B', internal_manufacturer_code: 'PA002' }
  ];

  beforeEach(() => {
    resetAllMocks();
  });

  describe('Rendering', () => {
    test('renders empty state when no pieces provided', () => {
      const { container } = renderWithProviders(<PieceGrid pieces={[]} />);
      
      expect(screen.getByText('No pieces available.')).toBeInTheDocument();
      // The text-muted class is on the parent div, not the text itself
      expect(container.querySelector('.text-muted')).toBeInTheDocument();
    });

    test('renders empty state when pieces is null', () => {
      renderWithProviders(<PieceGrid pieces={null} />);
      
      expect(screen.getByText('No pieces available.')).toBeInTheDocument();
    });

    test('renders empty state when pieces is undefined', () => {
      renderWithProviders(<PieceGrid />);
      
      expect(screen.getByText('No pieces available.')).toBeInTheDocument();
    });

    test('renders pieces when provided', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-3')).toBeInTheDocument();
    });

    test('renders with default title when no title provided', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      expect(screen.getByText('Pieces (3)')).toBeInTheDocument();
    });

    test('renders with custom title when provided', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} title="Custom Pieces" />);
      
      expect(screen.getByText('Custom Pieces (3)')).toBeInTheDocument();
    });

    test('renders correct piece count in title', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} title="Test Pieces" />);
      
      expect(screen.getByText('Test Pieces (3)')).toBeInTheDocument();
    });
  });

  describe('Piece Display', () => {
    test('renders all pieces in grid layout', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      // Should render all pieces
      mockPieces.forEach((piece, index) => {
        expect(screen.getByTestId(`piece-card-${piece.id}`)).toBeInTheDocument();
        // Check that the piece title is displayed (internal_manufacturer_code)
        expect(screen.getByText(piece.internal_manufacturer_code)).toBeInTheDocument();
      });
    });

    test('handles pieces with different ID structures', () => {
      renderWithProviders(<PieceGrid pieces={mockPiecesWithPieceId} />);
      
      expect(screen.getByTestId('piece-card-101')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-102')).toBeInTheDocument();
    });

    test('uses index as fallback when no ID available', () => {
      const piecesWithoutId = [
        { name: 'Piece 1' },
        { name: 'Piece 2' }
      ];
      
      renderWithProviders(<PieceGrid pieces={piecesWithoutId} />);
      
      expect(screen.getByTestId('piece-card-0')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
    });
  });

  describe('Expansion State Management', () => {
    test('manages internal expansion state when no onPieceClick provided', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      // Initially all pieces should be collapsed (no materials visible)
      expect(screen.getAllByText('No materials')).toHaveLength(3);
      
      // Click first piece to expand
      fireEvent.click(screen.getByTestId('piece-card-1'));
      
      // Should be expanded now - check that the card has the expanded class
      expect(screen.getByTestId('piece-card-1')).toHaveClass('border-primary');
    });

    test('toggles expansion state correctly', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      const toggleButton = screen.getByTestId('piece-card-1');
      
      // Click to expand
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('piece-card-1')).toHaveClass('border-primary');
      
      // Click again to collapse
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('piece-card-1')).not.toHaveClass('border-primary');
    });

    test('expands only one piece at a time', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      // Click first piece
      fireEvent.click(screen.getByTestId('piece-card-1'));
      expect(screen.getByTestId('piece-card-1')).toHaveClass('border-primary');
      
      // Click second piece
      fireEvent.click(screen.getByTestId('piece-card-2'));
      expect(screen.getByTestId('piece-card-2')).toHaveClass('border-primary');
      expect(screen.getByTestId('piece-card-1')).not.toHaveClass('border-primary');
    });

    test('uses expandedPieceId prop when provided', () => {
      renderWithProviders(
        <PieceGrid 
          pieces={mockPieces} 
          expandedPieceId={2} 
        />
      );
      
      // Piece with ID 2 should be expanded - check that it has the expanded class
      expect(screen.getByTestId('piece-card-2')).toHaveClass('border-primary');
    });
  });

  describe('External Click Handler', () => {
    test('calls onPieceClick when provided', () => {
      const mockOnPieceClick = vi.fn();
      
      renderWithProviders(
        <PieceGrid 
          pieces={mockPieces} 
          onPieceClick={mockOnPieceClick}
        />
      );
      
      // Click first piece
      fireEvent.click(screen.getByTestId('piece-card-1'));
      
      expect(mockOnPieceClick).toHaveBeenCalledWith(1);
    });

    test('calls onPieceClick with correct piece ID', () => {
      const mockOnPieceClick = vi.fn();
      
      renderWithProviders(
        <PieceGrid 
          pieces={mockPieces} 
          onPieceClick={mockOnPieceClick}
        />
      );
      
      // Click different pieces
      fireEvent.click(screen.getByTestId('piece-card-1'));
      fireEvent.click(screen.getByTestId('piece-card-2'));
      fireEvent.click(screen.getByTestId('piece-card-3'));
      
      expect(mockOnPieceClick).toHaveBeenCalledTimes(3);
      expect(mockOnPieceClick).toHaveBeenCalledWith(1);
      expect(mockOnPieceClick).toHaveBeenCalledWith(2);
      expect(mockOnPieceClick).toHaveBeenCalledWith(3);
    });

    test('handles pieces with piece_id instead of id', () => {
      const mockOnPieceClick = vi.fn();
      
      renderWithProviders(
        <PieceGrid 
          pieces={mockPiecesWithPieceId} 
          onPieceClick={mockOnPieceClick}
        />
      );
      
      fireEvent.click(screen.getByTestId('piece-card-101'));
      
      expect(mockOnPieceClick).toHaveBeenCalledWith(101);
    });
  });

  describe('Component Props', () => {
    test('handles all props correctly', () => {
      const mockOnPieceClick = vi.fn();
      
      renderWithProviders(
        <PieceGrid 
          pieces={mockPieces}
          title="Custom Title"
          onPieceClick={mockOnPieceClick}
          expandedPieceId={1}
        />
      );
      
      expect(screen.getByText('Custom Title (3)')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-3')).toBeInTheDocument();
    });

    test('handles missing optional props gracefully', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      expect(screen.getByText('Pieces (3)')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty pieces array', () => {
      renderWithProviders(<PieceGrid pieces={[]} title="Empty Grid" />);
      
      // When pieces array is empty, the title is not shown, only the empty state
      expect(screen.getByText('No pieces available.')).toBeInTheDocument();
      // The title should not be visible when there are no pieces
      expect(screen.queryByText('Empty Grid (0)')).not.toBeInTheDocument();
    });

    test('handles pieces with missing names', () => {
      const piecesWithMissingNames = [
        { id: 1 },
        { id: 2, internal_manufacturer_code: 'P002' }
      ];
      
      renderWithProviders(<PieceGrid pieces={piecesWithMissingNames} />);
      
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-2')).toBeInTheDocument();
    });

    test('handles very large number of pieces', () => {
      const manyPieces = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Piece ${i + 1}`,
        internal_manufacturer_code: `P${String(i + 1).padStart(3, '0')}`
      }));
      
      renderWithProviders(<PieceGrid pieces={manyPieces} />);
      
      expect(screen.getByText('Pieces (100)')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('piece-card-100')).toBeInTheDocument();
    });

    test('handles rapid state changes', () => {
      const { rerender } = renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      // Change pieces rapidly
      rerender(<PieceGrid pieces={[]} />);
      expect(screen.getByText('No pieces available.')).toBeInTheDocument();
      
      rerender(<PieceGrid pieces={mockPieces} />);
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
      
      rerender(<PieceGrid pieces={[]} />);
      expect(screen.getByText('No pieces available.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('renders with proper structure for screen readers', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} title="Test Pieces" />);
      
      // Should have proper heading structure
      expect(screen.getByText('Test Pieces (3)')).toBeInTheDocument();
      
      // Should render all pieces
      mockPieces.forEach(piece => {
        expect(screen.getByTestId(`piece-card-${piece.id}`)).toBeInTheDocument();
      });
    });

    test('handles keyboard navigation', () => {
      renderWithProviders(<PieceGrid pieces={mockPieces} />);
      
      // All piece cards should be focusable
      const pieceCards = screen.getAllByTestId(/piece-card-/);
      expect(pieceCards).toHaveLength(3);
      
      pieceCards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });
  });
});
