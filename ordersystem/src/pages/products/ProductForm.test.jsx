import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import ProductForm from './ProductForm';
import { renderWithProviders, resetAllMocks, testScenarios } from '../../test-utils';

// No Redux action mocking - use real actions for production-like testing

// No axios mocking - use real axios for production-like testing

// No imageUtils mocking - use real implementation for production-like testing

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-preview-url');

describe('ProductForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    product: null,
    manufacturers: [],
    onSubmit: mockOnSubmit,
    onSuccess: mockOnSuccess
  };

  const mockManufacturers = [
    { manufacturer_id: 1, name: 'Manufacturer 1' },
    { manufacturer_id: 2, name: 'Manufacturer 2' },
    { manufacturer_id: 3, name: 'Manufacturer 3' }
  ];

  const mockProduct = {
    product_id: 1,
    name: 'Test Product',
    description: 'Test Description',
    base_price: '99.99',
    manufacturer_id: 1,
    is_customizable: true
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnSubmit.mockClear();
    mockOnSuccess.mockClear();
    global.URL.createObjectURL.mockClear();
  });

  describe('Rendering', () => {
    test('renders form with all required fields', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Base Price *')).toBeInTheDocument();
      expect(screen.getByLabelText('Manufacturer *')).toBeInTheDocument();
      expect(screen.getByLabelText('Customizable')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument();
    });

    test('renders with empty form when no product provided', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Base Price *')).toHaveValue(null);
      expect(screen.getByLabelText('Manufacturer *')).toHaveValue('');
      expect(screen.getByLabelText('Customizable')).not.toBeChecked();
    });

    test('renders with product data when provided', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} product={mockProduct} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveValue('Test Product');
      expect(screen.getByLabelText('Description')).toHaveValue('Test Description');
      expect(screen.getByLabelText('Base Price *')).toHaveValue(99.99);
      expect(screen.getByLabelText('Manufacturer *')).toHaveValue('1');
      expect(screen.getByLabelText('Customizable')).toBeChecked();
    });

    test('shows update button when editing existing product', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} product={mockProduct} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByRole('button', { name: /update product/i })).toBeInTheDocument();
    });

    test('shows create button when creating new product', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument();
    });

    test('renders form with correct input types', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Base Price *')).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText('Customizable')).toHaveAttribute('type', 'checkbox');
    });

    test('renders required fields with required attribute', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveAttribute('required');
      expect(screen.getByLabelText('Base Price *')).toHaveAttribute('required');
      expect(screen.getByLabelText('Manufacturer *')).toHaveAttribute('required');
      expect(screen.getByLabelText('Description')).not.toHaveAttribute('required');
    });

    test('renders metadata section', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByText('Product Metadata')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add metadata field/i })).toBeInTheDocument();
    });

    test('renders image upload section', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByText('Product Images')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload Images')).toBeInTheDocument();
    });
  });

  describe('Redux Integration', () => {
    test('renders without errors when mounted', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      // Component should render without errors
      expect(screen.getByLabelText('Product Name *')).toBeInTheDocument();
    });

    test('uses manufacturers from props', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const manufacturerSelect = screen.getByLabelText('Manufacturer *');
      expect(manufacturerSelect).toBeInTheDocument();
      
      // Check that manufacturer options are rendered
      expect(screen.getByText('Manufacturer 1')).toBeInTheDocument();
      expect(screen.getByText('Manufacturer 2')).toBeInTheDocument();
      expect(screen.getByText('Manufacturer 3')).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    test('handles basic form input changes', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const nameInput = screen.getByLabelText('Product Name *');
      const descriptionInput = screen.getByLabelText('Description');
      const priceInput = screen.getByLabelText('Base Price *');
      const manufacturerSelect = screen.getByLabelText('Manufacturer *');
      const customizableCheckbox = screen.getByLabelText('Customizable');
      
      fireEvent.change(nameInput, { target: { value: 'New Product' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
      fireEvent.change(priceInput, { target: { value: '149.99' } });
      fireEvent.change(manufacturerSelect, { target: { value: '2' } });
      fireEvent.click(customizableCheckbox);
      
      expect(nameInput).toHaveValue('New Product');
      expect(descriptionInput).toHaveValue('New Description');
      expect(priceInput).toHaveValue(149.99);
      expect(manufacturerSelect).toHaveValue('2');
      expect(customizableCheckbox).toBeChecked();
    });

    test('handles rapid input changes', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const nameInput = screen.getByLabelText('Product Name *');
      
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.change(nameInput, { target: { value: 'AB' } });
      fireEvent.change(nameInput, { target: { value: 'ABC' } });
      fireEvent.change(nameInput, { target: { value: 'ABCD' } });
      
      expect(nameInput).toHaveValue('ABCD');
    });
  });

  describe('Metadata Management', () => {
    test('handles adding metadata fields', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const addButton = screen.getByRole('button', { name: /add metadata field/i });
      fireEvent.click(addButton);
      
      expect(screen.getByText('Metadata Field 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Key Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Default Value')).toBeInTheDocument();
      expect(screen.getByLabelText('Mandatory field (proposal items must provide this value)')).toBeInTheDocument();
    });

    test('handles multiple metadata fields', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      // Add first metadata field
      fireEvent.click(screen.getByRole('button', { name: /add metadata field/i }));
      fireEvent.change(screen.getByLabelText('Key Name *'), { target: { value: 'dimensions' } });
      fireEvent.change(screen.getByLabelText('Default Value'), { target: { value: '10x10' } });
      fireEvent.click(screen.getByLabelText('Mandatory field (proposal items must provide this value)'));
      
      // Add second metadata field
      fireEvent.click(screen.getByRole('button', { name: /add metadata field/i }));
      fireEvent.change(screen.getAllByLabelText('Key Name *')[1], { target: { value: 'weight' } });
      fireEvent.change(screen.getAllByLabelText('Default Value')[1], { target: { value: '5kg' } });
      
      expect(screen.getByText('Metadata Field 1')).toBeInTheDocument();
      expect(screen.getByText('Metadata Field 2')).toBeInTheDocument();
      expect(screen.getAllByLabelText('Key Name *')[0]).toHaveValue('dimensions');
      expect(screen.getAllByLabelText('Default Value')[0]).toHaveValue('10x10');
      expect(screen.getAllByLabelText('Mandatory field (proposal items must provide this value)')[0]).toBeChecked();
      expect(screen.getAllByLabelText('Key Name *')[1]).toHaveValue('weight');
      expect(screen.getAllByLabelText('Default Value')[1]).toHaveValue('5kg');
      expect(screen.getAllByLabelText('Mandatory field (proposal items must provide this value)')[1]).not.toBeChecked();
    });

    test('handles removing metadata fields', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      // Add two metadata fields
      fireEvent.click(screen.getByRole('button', { name: /add metadata field/i }));
      fireEvent.click(screen.getByRole('button', { name: /add metadata field/i }));
      
      expect(screen.getByText('Metadata Field 1')).toBeInTheDocument();
      expect(screen.getByText('Metadata Field 2')).toBeInTheDocument();
      
      // Remove first field
      fireEvent.click(screen.getByTestId('remove-metadata-0'));
      
      // After removing first field, the second field becomes the first
      expect(screen.getByText('Metadata Field 1')).toBeInTheDocument();
      expect(screen.queryByText('Metadata Field 2')).not.toBeInTheDocument();
    });
  });

  describe('Image Management', () => {
    test('handles image upload for new product', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload Images');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    test('handles multiple image uploads', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload Images');
      
      fireEvent.change(fileInput, { target: { files: [file1, file2] } });
      
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data when creating new product', async () => {
      mockOnSubmit.mockResolvedValue({ product_id: 1 });
      
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      // Fill out the form (user behavior)
      fireEvent.change(screen.getByLabelText('Product Name *'), { target: { value: 'New Product' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
      fireEvent.change(screen.getByLabelText('Base Price *'), { target: { value: '99.99' } });
      fireEvent.change(screen.getByLabelText('Manufacturer *'), { target: { value: '1' } });
      fireEvent.click(screen.getByLabelText('Customizable'));
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /create product/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'New Product',
          description: 'New Description',
          base_price: '99.99',
          manufacturer_id: '1',
          is_customizable: 1
        });
      });
    });

    test('calls onSubmit with form data when updating existing product', async () => {
      mockOnSubmit.mockResolvedValue({ product_id: 1 });
      
      renderWithProviders(
        <ProductForm {...defaultProps} product={mockProduct} manufacturers={mockManufacturers} />
      );
      
      // Modify form data
      fireEvent.change(screen.getByLabelText('Product Name *'), { target: { value: 'Updated Product' } });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /update product/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Updated Product',
          description: 'Test Description',
          base_price: '99.99',
          manufacturer_id: 1,
          is_customizable: 1
        });
      });
    });

    test('calls onSuccess callback after successful submission', async () => {
      mockOnSubmit.mockResolvedValue({ product_id: 1 });
      
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      // Fill out and submit form
      fireEvent.change(screen.getByLabelText('Product Name *'), { target: { value: 'Success Product' } });
      fireEvent.change(screen.getByLabelText('Base Price *'), { target: { value: '99.99' } });
      fireEvent.change(screen.getByLabelText('Manufacturer *'), { target: { value: '1' } });
      fireEvent.click(screen.getByRole('button', { name: /create product/i }));
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    test('handles submission errors gracefully', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      // Fill out and submit form
      fireEvent.change(screen.getByLabelText('Product Name *'), { target: { value: 'Error Product' } });
      fireEvent.change(screen.getByLabelText('Base Price *'), { target: { value: '99.99' } });
      fireEvent.change(screen.getByLabelText('Manufacturer *'), { target: { value: '1' } });
      fireEvent.click(screen.getByRole('button', { name: /create product/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    test('initializes with empty state when no product provided', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Base Price *')).toHaveValue(null);
      expect(screen.getByLabelText('Manufacturer *')).toHaveValue('');
      expect(screen.getByLabelText('Customizable')).not.toBeChecked();
    });

    test('initializes with product data when provided', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} product={mockProduct} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveValue('Test Product');
      expect(screen.getByLabelText('Description')).toHaveValue('Test Description');
      expect(screen.getByLabelText('Base Price *')).toHaveValue(99.99);
      expect(screen.getByLabelText('Manufacturer *')).toHaveValue('1');
      expect(screen.getByLabelText('Customizable')).toBeChecked();
    });

    test('maintains form state during input changes', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const nameInput = screen.getByLabelText('Product Name *');
      const descriptionInput = screen.getByLabelText('Description');
      
      fireEvent.change(nameInput, { target: { value: 'Product Name' } });
      expect(nameInput).toHaveValue('Product Name');
      expect(descriptionInput).toHaveValue(''); // Should remain empty
      
      fireEvent.change(descriptionInput, { target: { value: 'Product Description' } });
      expect(nameInput).toHaveValue('Product Name'); // Should maintain previous value
      expect(descriptionInput).toHaveValue('Product Description');
    });
  });

  describe('Props Handling', () => {
    test('handles missing onSubmit prop gracefully', () => {
      expect(() => {
        renderWithProviders(
          <ProductForm {...defaultProps} onSubmit={undefined} manufacturers={mockManufacturers} />
        );
      }).not.toThrow();
    });

    test('handles missing onSuccess prop gracefully', () => {
      expect(() => {
        renderWithProviders(
          <ProductForm {...defaultProps} onSuccess={undefined} manufacturers={mockManufacturers} />
        );
      }).not.toThrow();
    });

    test('handles empty manufacturers array', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={[]} />
      );
      
      const manufacturerSelect = screen.getByLabelText('Manufacturer *');
      expect(manufacturerSelect).toBeInTheDocument();
      expect(screen.getByText('Select a manufacturer')).toBeInTheDocument();
    });

    test('handles undefined product prop', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} product={undefined} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveValue('');
      expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      const { container } = renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    test('has proper label associations', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const nameInput = screen.getByLabelText('Product Name *');
      const descriptionInput = screen.getByLabelText('Description');
      const priceInput = screen.getByLabelText('Base Price *');
      const manufacturerSelect = screen.getByLabelText('Manufacturer *');
      const customizableCheckbox = screen.getByLabelText('Customizable');
      
      expect(nameInput).toHaveAttribute('name', 'name');
      expect(descriptionInput).toHaveAttribute('name', 'description');
      expect(priceInput).toHaveAttribute('name', 'base_price');
      expect(manufacturerSelect).toHaveAttribute('name', 'manufacturer_id');
      expect(customizableCheckbox).toHaveAttribute('name', 'is_customizable');
    });

    test('has proper button type', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const submitButton = screen.getByRole('button', { name: /create product/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge Cases', () => {
    test('handles very long input values', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const longValue = 'A'.repeat(1000);
      const nameInput = screen.getByLabelText('Product Name *');
      
      fireEvent.change(nameInput, { target: { value: longValue } });
      expect(nameInput).toHaveValue(longValue);
    });

    test('handles special characters in input', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const specialValue = 'Product & Co. "Special" <Characters>';
      const nameInput = screen.getByLabelText('Product Name *');
      
      fireEvent.change(nameInput, { target: { value: specialValue } });
      expect(nameInput).toHaveValue(specialValue);
    });

    test('handles product with complex data', () => {
      const complexProduct = {
        product_id: 1,
        name: 'Complex Product',
        description: 'Complex product with special characters & symbols',
        base_price: '999.99',
        manufacturer_id: 2,
        is_customizable: true
      };
      
      renderWithProviders(
        <ProductForm {...defaultProps} product={complexProduct} manufacturers={mockManufacturers} />
      );
      
      expect(screen.getByLabelText('Product Name *')).toHaveValue('Complex Product');
      expect(screen.getByLabelText('Description')).toHaveValue('Complex product with special characters & symbols');
      expect(screen.getByLabelText('Base Price *')).toHaveValue(999.99);
      expect(screen.getByLabelText('Manufacturer *')).toHaveValue('2');
      expect(screen.getByLabelText('Customizable')).toBeChecked();
    });

    test('handles rapid form interactions', () => {
      renderWithProviders(
        <ProductForm {...defaultProps} manufacturers={mockManufacturers} />
      );
      
      const nameInput = screen.getByLabelText('Product Name *');
      const addMetadataButton = screen.getByRole('button', { name: /add metadata field/i });
      
      // Rapid input changes
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.change(nameInput, { target: { value: 'AB' } });
      fireEvent.change(nameInput, { target: { value: 'ABC' } });
      
      // Rapid metadata additions
      fireEvent.click(addMetadataButton);
      fireEvent.click(addMetadataButton);
      fireEvent.click(addMetadataButton);
      
      expect(nameInput).toHaveValue('ABC');
      expect(screen.getByText('Metadata Field 1')).toBeInTheDocument();
      expect(screen.getByText('Metadata Field 2')).toBeInTheDocument();
      expect(screen.getByText('Metadata Field 3')).toBeInTheDocument();
    });
  });
});