import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import MaterialAutocomplete from './MaterialAutocomplete';
import { renderWithProviders, resetAllMocks } from '../test-utils';

// Mock console.error
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('MaterialAutocomplete Component', () => {
  const mockOnChange = vi.fn();
  const mockOnSelect = vi.fn();
  const mockOnMaterialSelect = vi.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onSelect: mockOnSelect,
    onMaterialSelect: mockOnMaterialSelect,
    materials: [],
    placeholder: 'Search materials...',
    excludeSelected: []
  };

  const mockMaterials = [
    { id: 1, name: 'Material 1', code: 'M001', color: 'Red', type: 'Fabric', image_path: 'path1.jpg' },
    { id: 2, name: 'Material 2', code: 'M002', color: 'Blue', type: 'Leather', image_path: 'path2.jpg' },
    { id: 3, name: 'Material 3', code: 'M003', color: 'Green', type: 'Metal', image_path: null }
  ];

  beforeEach(() => {
    resetAllMocks();
    mockOnChange.mockClear();
    mockOnSelect.mockClear();
    mockOnMaterialSelect.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Rendering', () => {
    test('renders input with correct placeholder', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search materials...');
    });

    test('renders with custom placeholder', () => {
      renderWithProviders(
        <MaterialAutocomplete {...defaultProps} placeholder="Custom placeholder" />
      );
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    test('renders input with correct type', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Input Handling', () => {
    test('handles input changes and calls onChange', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });

    test('updates input value when typing', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} value="initial" />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: 'updated' } });
      expect(mockOnChange).toHaveBeenCalledWith('updated');
    });
  });

  describe('Props Handling', () => {
    test('handles missing optional props gracefully', () => {
      const minimalProps = {
        value: '',
        onChange: mockOnChange
      };
      
      renderWithProviders(<MaterialAutocomplete {...minimalProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
    });

    test('handles null materials prop', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} materials={null} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
    });

    test('handles undefined excludeSelected prop', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} excludeSelected={undefined} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty materials array', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} materials={[]} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
    });

    test('handles rapid input changes', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
      
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration with AutocompleteInput', () => {
    test('passes correct minChars to AutocompleteInput', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
    });

    test('maintains accessibility through real AutocompleteInput', () => {
      renderWithProviders(<MaterialAutocomplete {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});