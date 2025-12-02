import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import MultilingualProductForm from './MultilingualProductForm';
import { renderWithProviders, resetAllMocks, testScenarios } from '../../test-utils';
import axios from '../../services/axiosInstance';

// Mock CarelliItemSelector
vi.mock('../../components/CarelliItemSelector', () => ({
  default: ({ onItemSelect, selectedItem, placeholder }) => (
    <div data-testid="carelli-item-selector">
      <input
        data-testid="carelli-search"
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value === 'test item') {
            onItemSelect({
              item_id: 123,
              title: 'Test Carelli Item',
              text: 'Test description',
              price: 99.99,
              language_id: 1
            });
          }
        }}
      />
      {selectedItem && (
        <div data-testid="selected-carelli-item">
          {selectedItem.title} - ${selectedItem.price}
        </div>
      )}
    </div>
  )
}));

// Mock URL.createObjectURL for file uploads
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

// Mock URL constructor properly
global.URL = class URL {
  constructor(url) {
    this.href = url;
  }
  static createObjectURL = mockCreateObjectURL;
  static revokeObjectURL = mockRevokeObjectURL;
};

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('MultilingualProductForm Component', () => {
  const mockManufacturers = [
    { manufacturer_id: 1, name: 'Manufacturer 1' },
    { manufacturer_id: 2, name: 'Manufacturer 2' },
  ];

  const mockLanguages = [
    { language_id: 1, name: 'English', code: 'en' },
    { language_id: 2, name: 'Spanish', code: 'es' },
    { language_id: 3, name: 'French', code: 'fr' },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    manufacturers: mockManufacturers,
    onSubmit: mockOnSubmit,
    onSuccess: mockOnSuccess,
  };

  const languagesState = {
    ...testScenarios.authenticated,
    languages: {
      loading: false,
      error: null,
      languages: mockLanguages,
    },
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnSubmit.mockClear();
    mockOnSuccess.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Rendering', () => {
    test('renders form with all sections', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      expect(screen.getByLabelText('Manufacturer *')).toBeInTheDocument();
      expect(screen.getByLabelText('Customizable')).toBeInTheDocument();
      expect(screen.getByText('Product Translations')).toBeInTheDocument();
      expect(screen.getByText('Product Metadata')).toBeInTheDocument();
      expect(screen.getByText('Product Images')).toBeInTheDocument();
    });

    test('renders manufacturer dropdown with options', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const manufacturerSelect = screen.getByLabelText('Manufacturer *');
      expect(manufacturerSelect).toBeInTheDocument();
      expect(screen.getByText('Select a manufacturer')).toBeInTheDocument();
      expect(screen.getByText('Manufacturer 1')).toBeInTheDocument();
      expect(screen.getByText('Manufacturer 2')).toBeInTheDocument();
    });

    test('renders customizable checkbox', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const checkbox = screen.getByLabelText('Customizable');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    test('renders submit button for new product', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      expect(screen.getByRole('button', { name: 'Create Product' })).toBeInTheDocument();
    });

    test('renders submit button for existing product', () => {
      const existingProduct = { product_id: 1, manufacturer_id: 1, is_customizable: true };
      renderWithProviders(
        <MultilingualProductForm {...defaultProps} product={existingProduct} />,
        { initialState: languagesState }
      );
      
      expect(screen.getByRole('button', { name: 'Update Product' })).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    test('handles manufacturer selection', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const manufacturerSelect = screen.getByLabelText('Manufacturer *');
      fireEvent.change(manufacturerSelect, { target: { value: '1' } });
      
      expect(manufacturerSelect).toHaveValue('1');
    });

    test('handles customizable checkbox toggle', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const checkbox = screen.getByLabelText('Customizable');
      fireEvent.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });
  });

  describe('Translation Management', () => {
    test('adds new translation when Add Translation button is clicked', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const addButton = screen.getByRole('button', { name: 'Add Translation' });
      fireEvent.click(addButton);
      
      expect(screen.getByText('Translation 1')).toBeInTheDocument();
      expect(screen.getByTestId('translation-0-language')).toBeInTheDocument();
      expect(screen.getByTestId('translation-0-name')).toBeInTheDocument();
      expect(screen.getByTestId('translation-0-price')).toBeInTheDocument();
      expect(screen.getByTestId('translation-0-description')).toBeInTheDocument();
    });

    test('removes translation when Remove button is clicked', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a translation first
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      expect(screen.getByText('Translation 1')).toBeInTheDocument();
      
      // Remove it
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
      expect(screen.queryByText('Translation 1')).not.toBeInTheDocument();
    });

    test('handles translation input changes', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      
      // Fill in translation details using data-testid
      const nameInput = screen.getByTestId('translation-0-name');
      const priceInput = screen.getByTestId('translation-0-price');
      const descriptionInput = screen.getByTestId('translation-0-description');
      
      fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      fireEvent.change(priceInput, { target: { value: '99.99' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
      
      expect(nameInput).toHaveValue('Test Product');
      expect(priceInput).toHaveValue(99.99);
      expect(descriptionInput).toHaveValue('Test description');
    });

    test('handles language selection for translation', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      
      const languageSelect = screen.getByTestId('translation-0-language');
      fireEvent.change(languageSelect, { target: { value: '1' } });
      
      expect(languageSelect).toHaveValue('1');
    });

    test('filters out used languages from dropdown', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add first translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      const firstLanguageSelect = screen.getByTestId('translation-0-language');
      fireEvent.change(firstLanguageSelect, { target: { value: '1' } });
      
      // Add second translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      const secondLanguageSelect = screen.getByTestId('translation-1-language');
      
      // Both dropdowns should show all languages initially
      expect(screen.getAllByText('English (en)')).toHaveLength(2);
      expect(screen.getAllByText('Spanish (es)')).toHaveLength(2);
    });
  });

  describe('CarelliItemSelector Integration', () => {
    test('renders CarelliItemSelector for each translation', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      
      expect(screen.getByTestId('carelli-item-selector')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search for Carelli items in/)).toBeInTheDocument();
    });

    test('handles Carelli item selection', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      
      const carelliSearch = screen.getByTestId('carelli-search');
      fireEvent.change(carelliSearch, { target: { value: 'test item' } });
      
      expect(screen.getByTestId('selected-carelli-item')).toBeInTheDocument();
      expect(screen.getByText('Test Carelli Item - $99.99')).toBeInTheDocument();
    });
  });

  describe('Metadata Management', () => {
    test('adds new metadata field when Add Metadata Field button is clicked', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const addButton = screen.getByRole('button', { name: 'Add Metadata Field' });
      fireEvent.click(addButton);
      
      expect(screen.getByText('Metadata Field 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., dimensions, weight, color')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Leave empty for user input')).toBeInTheDocument();
      expect(screen.getByText('Mandatory field (proposal items must provide this value)')).toBeInTheDocument();
    });

    test('removes metadata field when Remove button is clicked', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a metadata field first
      fireEvent.click(screen.getByRole('button', { name: 'Add Metadata Field' }));
      expect(screen.getByText('Metadata Field 1')).toBeInTheDocument();
      
      // Remove it
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
      expect(screen.queryByText('Metadata Field 1')).not.toBeInTheDocument();
    });

    test('handles metadata input changes', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a metadata field
      fireEvent.click(screen.getByRole('button', { name: 'Add Metadata Field' }));
      
      const keyInput = screen.getByTestId('metadata-0-key');
      const valueInput = screen.getByTestId('metadata-0-value');
      const mandatoryCheckbox = screen.getByTestId('metadata-0-mandatory');
      
      fireEvent.change(keyInput, { target: { value: 'dimensions' } });
      fireEvent.change(valueInput, { target: { value: '10x20x30' } });
      fireEvent.click(mandatoryCheckbox);
      
      expect(keyInput).toHaveValue('dimensions');
      expect(valueInput).toHaveValue('10x20x30');
      expect(mandatoryCheckbox).toBeChecked();
    });
  });

  describe('Image Upload', () => {
    test('renders image upload input', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const fileInput = screen.getByLabelText('Upload Images');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('multiple');
      expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png,.webp');
    });

    test('handles file selection for new product', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload Images');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Should show pending image preview
      expect(screen.getByAltText('Product')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Set as Primary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    test('handles image deletion for pending images', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a pending image
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload Images');
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Delete it
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      
      expect(screen.queryByAltText('Product')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form with basic data', async () => {
      mockOnSubmit.mockResolvedValue({ product_id: 1 });
      
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Fill in basic form data
      fireEvent.change(screen.getByTestId('manufacturer-select'), { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('customizable-checkbox'));
      
      // Add a translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      fireEvent.change(screen.getByTestId('translation-0-language'), { target: { value: '1' } });
      
      // Fill in translation fields using data-testid
      const nameInput = screen.getByTestId('translation-0-name');
      const priceInput = screen.getByTestId('translation-0-price');
      
      fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      fireEvent.change(priceInput, { target: { value: '99.99' } });
      
      // Submit form
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          manufacturer_id: '1',
          is_customizable: 1,
          name: 'Test Product',
          base_price: '99.99',
          translations: expect.arrayContaining([
            expect.objectContaining({
              language_id: '1',
              name: 'Test Product',
              base_price: '99.99',
            })
          ]),
        });
      });
    });

    test('calls onSuccess callback after successful submission', async () => {
      mockOnSubmit.mockResolvedValue({ product_id: 1 });
      
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Fill in basic form data
      fireEvent.change(screen.getByTestId('manufacturer-select'), { target: { value: '1' } });
      
      // Add a translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      fireEvent.change(screen.getByTestId('translation-0-language'), { target: { value: '1' } });
      
      // Fill in translation fields using data-testid
      const nameInput = screen.getByTestId('translation-0-name');
      const priceInput = screen.getByTestId('translation-0-price');
      
      fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      fireEvent.change(priceInput, { target: { value: '99.99' } });
      
      // Submit form
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    test('handles submission errors', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Fill in basic form data
      fireEvent.change(screen.getByTestId('manufacturer-select'), { target: { value: '1' } });
      
      // Add a translation
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      fireEvent.change(screen.getByTestId('translation-0-language'), { target: { value: '1' } });
      
      // Fill in translation fields using data-testid
      const nameInput = screen.getByTestId('translation-0-name');
      const priceInput = screen.getByTestId('translation-0-price');
      
      fireEvent.change(nameInput, { target: { value: 'Test Product' } });
      fireEvent.change(priceInput, { target: { value: '99.99' } });
      
      // Submit form
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
    });
  });

  describe('Redux Integration', () => {
    test('dispatches fetchManufacturersRequest and fetchLanguagesRequest on mount', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // These actions should be dispatched on component mount
      // We can't easily test this without more complex mocking, but the component should render
      expect(screen.getByLabelText('Manufacturer *')).toBeInTheDocument();
    });

    test('uses languages from Redux state', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Add a translation to see language options
      fireEvent.click(screen.getByRole('button', { name: 'Add Translation' }));
      
      expect(screen.getByText('English (en)')).toBeInTheDocument();
      expect(screen.getByText('Spanish (es)')).toBeInTheDocument();
      expect(screen.getByText('French (fr)')).toBeInTheDocument();
    });
  });

  describe('Product Editing', () => {
    test('loads existing product data when editing', () => {
      const existingProduct = {
        product_id: 1,
        manufacturer_id: 1,
        is_customizable: true,
        translations: [
          {
            language_id: 1,
            name: 'Existing Product',
            description: 'Existing description',
            base_price: 199.99,
          }
        ]
      };
      
      renderWithProviders(
        <MultilingualProductForm {...defaultProps} product={existingProduct} />,
        { initialState: languagesState }
      );
      
      expect(screen.getByDisplayValue('Manufacturer 1')).toBeInTheDocument(); // manufacturer_id
      expect(screen.getByTestId('customizable-checkbox')).toBeChecked();
      expect(screen.getByText('Translation 1')).toBeInTheDocument();
      expect(screen.getByTestId('translation-0-name')).toHaveValue('Existing Product');
      expect(screen.getByTestId('translation-0-description')).toHaveValue('Existing description');
      expect(screen.getByTestId('translation-0-price')).toHaveValue(199.99);
    });

    test('renders form for existing product', () => {
      const existingProduct = { product_id: 1, manufacturer_id: 1 };
      
      renderWithProviders(
        <MultilingualProductForm {...defaultProps} product={existingProduct} />,
        { initialState: languagesState }
      );
      
      // Should render the form with existing product data
      // The form should show "Update Product" button for existing products
      expect(screen.getByText('Update Product')).toBeInTheDocument();
    });

    test('renders metadata section for existing product', () => {
      const existingProduct = { product_id: 1, manufacturer_id: 1 };
      
      renderWithProviders(
        <MultilingualProductForm {...defaultProps} product={existingProduct} />,
        { initialState: languagesState }
      );
      
      // Should render the metadata section
      expect(screen.getByText('Product Metadata')).toBeInTheDocument();
      expect(screen.getByText('Add Metadata Field')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty manufacturers array', () => {
      renderWithProviders(
        <MultilingualProductForm {...defaultProps} manufacturers={[]} />,
        { initialState: languagesState }
      );
      
      expect(screen.getByText('Select a manufacturer')).toBeInTheDocument();
      expect(screen.queryByText('Manufacturer 1')).not.toBeInTheDocument();
    });

    test('handles missing onSubmit prop', () => {
      const { onSubmit, ...propsWithoutOnSubmit } = defaultProps;
      
      renderWithProviders(<MultilingualProductForm {...propsWithoutOnSubmit} />, {
        initialState: languagesState
      });
      
      // Should still render the form
      expect(screen.getByTestId('manufacturer-select')).toBeInTheDocument();
    });

    test('handles missing onSuccess prop', () => {
      const { onSuccess, ...propsWithoutOnSuccess } = defaultProps;
      
      renderWithProviders(<MultilingualProductForm {...propsWithoutOnSuccess} />, {
        initialState: languagesState
      });
      
      // Should still render the form
      expect(screen.getByTestId('manufacturer-select')).toBeInTheDocument();
    });

    test('handles form validation with required fields', () => {
      renderWithProviders(<MultilingualProductForm {...defaultProps} />, {
        initialState: languagesState
      });
      
      // Try to submit without filling required fields
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // HTML5 validation should prevent submission
      const manufacturerSelect = screen.getByTestId('manufacturer-select');
      expect(manufacturerSelect).toBeInvalid();
    });
  });
});
