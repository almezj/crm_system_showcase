import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import PieceDisplayCard from './PieceDisplayCard';
import { renderWithProviders, resetAllMocks } from '../test-utils';

// No component mocking - use real components for production-like testing

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('PieceDisplayCard Component', () => {
  const mockPiece = {
    id: 1,
    piece_id: 101,
    internal_manufacturer_code: 'P001',
    description: 'Test piece description',
    materials: [
      { id: 1, name: 'Material 1', code: 'M001', color: 'Red', type: 'Fabric' },
      { id: 2, name: 'Material 2', code: 'M002', color: 'Blue', type: 'Leather' }
    ]
  };

  const mockOnToggleExpand = vi.fn();

  const defaultProps = {
    piece: mockPiece,
    index: 0,
    isExpanded: false,
    onToggleExpand: mockOnToggleExpand
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnToggleExpand.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleWarn.mockClear();
  });

  describe('Rendering', () => {
    test('renders piece card with correct structure', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      // Check for the main card element
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
      // Check for piece title (internal manufacturer code)
      expect(screen.getByText('P001')).toBeInTheDocument();
      // Check for materials count
      expect(screen.getByText('Materials (2)')).toBeInTheDocument();
    });

    test('renders piece title correctly', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      expect(screen.getByText('P001')).toBeInTheDocument();
    });

    test('renders piece title with piece_id when no internal_manufacturer_code', () => {
      const pieceWithoutCode = { ...mockPiece, internal_manufacturer_code: null };
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithoutCode} />
      );
      
      expect(screen.getByText('Piece ID: 101')).toBeInTheDocument();
    });

    test('renders piece title with index when no piece_id or internal_manufacturer_code', () => {
      const pieceWithoutIds = { ...mockPiece, piece_id: null, internal_manufacturer_code: null };
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithoutIds} />
      );
      
      expect(screen.getByText('Piece #1')).toBeInTheDocument();
    });

    test('renders materials count correctly', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      expect(screen.getByText('Materials (2)')).toBeInTheDocument();
    });

    test('renders description when provided', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      expect(screen.getByText('Test piece description')).toBeInTheDocument();
    });

    test('truncates long descriptions', () => {
      const longDescription = 'This is a very long description that should be truncated when it exceeds fifty characters';
      const pieceWithLongDesc = { ...mockPiece, description: longDescription };
      
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithLongDesc} />
      );
      
      expect(screen.getByText(/This is a very long description that should be tru\.\.\./)).toBeInTheDocument();
    });

    test('does not render description when not provided', () => {
      const pieceWithoutDesc = { ...mockPiece, description: null };
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithoutDesc} />
      );
      
      expect(screen.queryByText('Test piece description')).not.toBeInTheDocument();
    });

    test('renders materials badges when materials are present', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      // Check for material badges specifically
      const materialBadges = screen.getAllByText('Material 1');
      expect(materialBadges).toHaveLength(2); // One in badge, one in detailed view
      expect(screen.getAllByText('Material 2')).toHaveLength(2);
    });

    test('renders no materials badge when no materials', () => {
      const pieceWithoutMaterials = { ...mockPiece, materials: [] };
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithoutMaterials} />
      );
      
      expect(screen.getByText('No materials')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onToggleExpand when card is clicked', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      const card = screen.getByTestId('piece-card-1');
      fireEvent.click(card);
      
      expect(mockOnToggleExpand).toHaveBeenCalledWith(1);
    });

    test('calls onToggleExpand with piece_id when id is not available', () => {
      const pieceWithOnlyPieceId = { ...mockPiece, id: null };
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithOnlyPieceId} />
      );
      
      const card = screen.getByTestId('piece-card-101');
      fireEvent.click(card);
      
      expect(mockOnToggleExpand).toHaveBeenCalledWith(101);
    });

    test('does not call onToggleExpand when onToggleExpand is not provided', () => {
      const propsWithoutToggle = { ...defaultProps, onToggleExpand: null };
      renderWithProviders(<PieceDisplayCard {...propsWithoutToggle} />);
      
      const card = screen.getByTestId('piece-card-1');
      fireEvent.click(card);
      
      expect(mockOnToggleExpand).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles null piece gracefully', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} piece={null} />);
      
      // Component should not render anything when piece is null
      expect(screen.queryByTestId('piece-card-1')).not.toBeInTheDocument();
    });

    test('handles piece with only piece_id', () => {
      const pieceWithOnlyId = { piece_id: 123 };
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithOnlyId} />
      );
      
      expect(screen.getByText('Piece ID: 123')).toBeInTheDocument();
    });

    test('handles piece with no identifiers', () => {
      const pieceWithoutIds = { materials: [] };
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithoutIds} index={3} />
      );
      
      expect(screen.getByText('Piece #4')).toBeInTheDocument();
    });

    test('handles materials with missing fields', () => {
      const pieceWithIncompleteMaterials = {
        ...mockPiece,
        materials: [
          { name: 'Material 1' }, // Missing other fields
          { code: 'M002', color: 'Blue' }, // Missing name
          { name: 'Material 3', color: 'Red' } // Missing code
        ]
      };
      
      renderWithProviders(
        <PieceDisplayCard {...defaultProps} piece={pieceWithIncompleteMaterials} />
      );
      
      expect(screen.getByText('Materials (3)')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    test('handles missing optional props', () => {
      const minimalProps = { piece: mockPiece, index: 0 };
      renderWithProviders(<PieceDisplayCard {...minimalProps} />);
      
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
    });

    test('handles different index values', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} index={5} />);
      
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
    });

    test('handles different expansion states', () => {
      renderWithProviders(<PieceDisplayCard {...defaultProps} isExpanded={true} />);
      
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
    });
  });

  describe('Performance and State Management', () => {
    test('handles rapid state changes', () => {
      const { rerender } = renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      // Rapidly change props
      rerender(<PieceDisplayCard {...defaultProps} isExpanded={true} />);
      rerender(<PieceDisplayCard {...defaultProps} isExpanded={false} />);
      rerender(<PieceDisplayCard {...defaultProps} isExpanded={true} />);
      
      expect(screen.getByTestId('piece-card-1')).toBeInTheDocument();
    });

    test('handles prop changes gracefully', () => {
      const { rerender } = renderWithProviders(<PieceDisplayCard {...defaultProps} />);
      
      const updatedPiece = { ...mockPiece, internal_manufacturer_code: 'P002' };
      rerender(<PieceDisplayCard {...defaultProps} piece={updatedPiece} />);
      
      expect(screen.getByText('P002')).toBeInTheDocument();
    });
  });
});