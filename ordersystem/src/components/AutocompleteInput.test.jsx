import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import AutocompleteInput from './AutocompleteInput';
import { renderWithProviders, resetAllMocks } from '../test-utils';

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('AutocompleteInput Component', () => {
  const mockSearchFunction = vi.fn();
  const mockOnChange = vi.fn();
  const mockOnSelect = vi.fn();
  const mockRenderOption = vi.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onSelect: mockOnSelect,
    placeholder: 'Type to search...',
    searchFunction: mockSearchFunction,
    minChars: 3,
    renderOption: mockRenderOption,
    className: ''
  };

  const mockOptions = [
    { id: 1, name: 'Option 1', code: 'OPT1' },
    { id: 2, name: 'Option 2', code: 'OPT2' },
    { id: 3, name: 'Option 3', code: 'OPT3' }
  ];

  beforeEach(() => {
    resetAllMocks();
    mockSearchFunction.mockClear();
    mockOnChange.mockClear();
    mockOnSelect.mockClear();
    mockRenderOption.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Rendering', () => {
    test('renders input with correct attributes', () => {
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveValue('');
      expect(input).toHaveAttribute('placeholder', 'Type to search...');
    });

    test('renders with custom placeholder', () => {
      renderWithProviders(
        <AutocompleteInput {...defaultProps} placeholder="Custom placeholder" />
      );
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    test('renders with initial value', () => {
      renderWithProviders(
        <AutocompleteInput {...defaultProps} value="Initial value" />
      );
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Initial value');
    });

    test('applies custom className', () => {
      const { container } = renderWithProviders(
        <AutocompleteInput {...defaultProps} className="custom-class" />
      );
      
      const wrapper = container.querySelector('.relative');
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Input Handling', () => {
    test('calls onChange when input value changes', () => {
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('test');
    });

    test('updates internal value when input changes', () => {
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(input).toHaveValue('test value');
    });

    test('handles input focus', () => {
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.focus(input);
      
      // Should not open dropdown if value is too short
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('calls search function when input reaches minChars', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      
      renderWithProviders(<AutocompleteInput {...defaultProps} minChars={3} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(mockSearchFunction).toHaveBeenCalledWith('test');
      });
    });

    test('does not call search function when input is below minChars', async () => {
      renderWithProviders(<AutocompleteInput {...defaultProps} minChars={5} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Wait a bit to ensure search function is not called
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockSearchFunction).not.toHaveBeenCalled();
    });

    test('shows loading state during search', async () => {
      mockSearchFunction.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockOptions), 100)
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Should show loading spinner (check for the spinner element by class)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    test('displays search results when available', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id}>{option.name}</div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    test('handles search errors gracefully', async () => {
      mockSearchFunction.mockRejectedValue(new Error('Search failed'));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Search error:', expect.any(Error));
      });
      
      // Should not show any options
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    test('closes dropdown when input is cleared', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id}>{option.name}</div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      
      // Search and show results
      fireEvent.change(input, { target: { value: 'test' } });
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      // Clear input
      fireEvent.change(input, { target: { value: '' } });
      
      // Results should be hidden
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    test('calls onSelect when option is clicked', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id} data-testid={`option-${option.id}`}>
          {option.name}
        </div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      // Click on first option
      fireEvent.click(screen.getByTestId('option-1'));
      
      expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
    });

    test('clears input after selection', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id} data-testid={`option-${option.id}`}>
          {option.name}
        </div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      // Click on first option
      fireEvent.click(screen.getByTestId('option-1'));
      
      // Input should be cleared
      expect(input).toHaveValue('');
    });

    test('closes dropdown after selection', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id} data-testid={`option-${option.id}`}>
          {option.name}
        </div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      // Click on first option
      fireEvent.click(screen.getByTestId('option-1'));
      
      // Dropdown should be closed
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Click Outside Handling', () => {
    test('closes dropdown when clicking outside', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id}>{option.name}</div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      // Click outside the component
      fireEvent.mouseDown(document.body);
      
      // Dropdown should be closed
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Focus Behavior', () => {
    test('opens dropdown on focus if value meets minChars and has results', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id}>{option.name}</div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      
      // Test focus behavior with a value that meets minChars
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Wait for search to complete and results to appear
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      // Clear input
      fireEvent.change(input, { target: { value: '' } });
      
      // Wait for input to be cleared
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
      
      // Set value again and focus
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.focus(input);
      
      // Wait for results to appear again
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });
  });

  describe('Default Rendering', () => {
    test('uses default renderOption when none provided', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      
      renderWithProviders(
        <AutocompleteInput {...defaultProps} renderOption={undefined} />
      );
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Code: OPT1')).toBeInTheDocument();
      });
    });

    test('handles options without name property', async () => {
      const optionsWithoutName = [
        { id: 1, internal_manufacturer_code: 'CODE1' },
        { id: 2, internal_manufacturer_code: 'CODE2' }
      ];
      
      mockSearchFunction.mockResolvedValue(optionsWithoutName);
      
      renderWithProviders(
        <AutocompleteInput {...defaultProps} renderOption={undefined} />
      );
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('CODE1')).toBeInTheDocument();
        expect(screen.getByText('CODE2')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty search results', async () => {
      mockSearchFunction.mockResolvedValue([]);
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(mockSearchFunction).toHaveBeenCalledWith('test');
      });
      
      // Should not show any options
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    test('handles rapid input changes', async () => {
      mockSearchFunction.mockImplementation((query) => 
        Promise.resolve(mockOptions.filter(opt => opt.name.includes(query)))
      );
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      
      // Rapid changes
      fireEvent.change(input, { target: { value: 't' } });
      fireEvent.change(input, { target: { value: 'te' } });
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(mockSearchFunction).toHaveBeenCalledWith('test');
      });
    });

    test('handles selection state correctly', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id} data-testid={`option-${option.id}`}>
          {option.name}
        </div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      
      // Search and select
      fireEvent.change(input, { target: { value: 'test' } });
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('option-1'));
      
      // Type again after selection
      fireEvent.change(input, { target: { value: 'new search' } });
      
      // Should call search function again
      await waitFor(() => {
        expect(mockSearchFunction).toHaveBeenCalledWith('new search');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper input attributes', () => {
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder', 'Type to search...');
    });

    test('renders options with proper structure', async () => {
      mockSearchFunction.mockResolvedValue(mockOptions);
      mockRenderOption.mockImplementation((option) => (
        <div key={option.id} role="option">
          {option.name}
        </div>
      ));
      
      renderWithProviders(<AutocompleteInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Type to search...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(3);
      });
    });
  });
});
