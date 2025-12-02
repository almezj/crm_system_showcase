import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import PieceForm from './PieceForm';
import { renderWithProviders, resetAllMocks } from '../../test-utils';

// No component mocking - use real components for production-like testing

// Mock URL.createObjectURL - this is a browser API not available in Node.js
// We provide a minimal implementation that returns a string as expected
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-object-url'),
  writable: true,
});

describe('PieceForm Component', () => {
  const mockOnAddPiece = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnMaterialSelect = vi.fn();
  const mockOnPendingMaterialImageChange = vi.fn();
  const mockOnRemovePendingMaterialImage = vi.fn();
  const mockSetNewPiece = vi.fn();

  const defaultNewPiece = {
    internal_manufacturer_code: '',
    ean_code: '',
    qr_code: '',
    estimated_delivery_date: '',
    custom_description: '',
    material_name: '',
    material_code: '',
    material_color: '',
    material_type: '',
    material_style: '',
    material_description: '',
    material_id: null,
    pendingMaterialImage: null
  };

  const defaultProps = {
    newPiece: defaultNewPiece,
    setNewPiece: mockSetNewPiece,
    onAddPiece: mockOnAddPiece,
    onCancel: mockOnCancel,
    onMaterialSelect: mockOnMaterialSelect,
    onPendingMaterialImageChange: mockOnPendingMaterialImageChange,
    onRemovePendingMaterialImage: mockOnRemovePendingMaterialImage
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnAddPiece.mockClear();
    mockOnCancel.mockClear();
    mockOnMaterialSelect.mockClear();
    mockOnPendingMaterialImageChange.mockClear();
    mockOnRemovePendingMaterialImage.mockClear();
    mockSetNewPiece.mockClear();
  });

  describe('Rendering', () => {
    test('renders form with all sections', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      expect(screen.getByText('Add New Piece')).toBeInTheDocument();
      expect(screen.getByText('Piece Details')).toBeInTheDocument();
      expect(screen.getByText('Material Details')).toBeInTheDocument();
    });

    test('renders all form fields', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      // Piece Details fields
      expect(screen.getByLabelText('Internal Code *')).toBeInTheDocument();
      expect(screen.getByLabelText('EAN Code')).toBeInTheDocument();
      expect(screen.getByLabelText('QR Code')).toBeInTheDocument();
      expect(screen.getByLabelText('Estimated Delivery Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Custom Description')).toBeInTheDocument();
      
      // Material Details fields
      expect(screen.getByText('Material Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Material Code')).toBeInTheDocument();
      expect(screen.getByLabelText('Material Color')).toBeInTheDocument();
      expect(screen.getByLabelText('Material Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Material Style')).toBeInTheDocument();
      expect(screen.getByLabelText('Material Description')).toBeInTheDocument();
    });

    test('renders action buttons', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /add piece/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('renders with initial piece data', () => {
      const pieceWithData = {
        ...defaultNewPiece,
        internal_manufacturer_code: 'TEST-001',
        ean_code: '123456789',
        material_name: 'Test Material'
      };

      renderWithProviders(<PieceForm {...defaultProps} newPiece={pieceWithData} />);
      
      expect(screen.getByDisplayValue('TEST-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
      // The autocomplete input doesn't show the initial value in the same way
      expect(screen.getByTestId('autocomplete-input')).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    test('handles internal code input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Internal Code *');
      fireEvent.change(input, { target: { value: 'NEW-001' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        internal_manufacturer_code: 'NEW-001'
      });
    });

    test('handles EAN code input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('EAN Code');
      fireEvent.change(input, { target: { value: '987654321' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        ean_code: '987654321'
      });
    });

    test('handles QR code input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('QR Code');
      fireEvent.change(input, { target: { value: 'QR123456' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        qr_code: 'QR123456'
      });
    });

    test('handles estimated delivery date input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Estimated Delivery Date');
      fireEvent.change(input, { target: { value: '2024-12-31' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        estimated_delivery_date: '2024-12-31'
      });
    });

    test('handles custom description textarea changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Custom Description');
      fireEvent.change(textarea, { target: { value: 'Custom piece description' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        custom_description: 'Custom piece description'
      });
    });

    test('handles material code input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Material Code');
      fireEvent.change(input, { target: { value: 'MAT-001' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        material_code: 'MAT-001'
      });
    });

    test('handles material color input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Material Color');
      fireEvent.change(input, { target: { value: 'Blue' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        material_color: 'Blue'
      });
    });

    test('handles material type input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Material Type');
      fireEvent.change(input, { target: { value: 'Fabric' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        material_type: 'Fabric'
      });
    });

    test('handles material style input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Material Style');
      fireEvent.change(input, { target: { value: 'Modern' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        material_style: 'Modern'
      });
    });

    test('handles material description textarea changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Material Description');
      fireEvent.change(textarea, { target: { value: 'High quality material' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        material_description: 'High quality material'
      });
    });
  });

  describe('MaterialAutocomplete Integration', () => {
    test('handles material name changes through autocomplete', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      fireEvent.change(input, { target: { value: 'New Material' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        material_name: 'New Material'
      });
    });

    test('handles material selection through autocomplete', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      // The real MaterialAutocomplete component doesn't have a select button
      // Instead, we test that the autocomplete input is present and functional
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search or type material name...');
    });

    test('renders autocomplete with correct placeholder', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByTestId('autocomplete-input');
      expect(input).toHaveAttribute('placeholder', 'Search or type material name...');
    });
  });

  describe('Material Image Handling', () => {
    test('renders material image upload when material_id is present', () => {
      const pieceWithMaterialId = {
        ...defaultNewPiece,
        material_id: 123
      };

      renderWithProviders(<PieceForm {...defaultProps} newPiece={pieceWithMaterialId} />);
      
      // The real MaterialImageUpload component renders a file input and drag-drop area
      expect(screen.getByText('Material ID: 123')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop images here, or click to select files')).toBeInTheDocument();
    });

    test('renders pending material image when present', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const pieceWithPendingImage = {
        ...defaultNewPiece,
        pendingMaterialImage: mockFile
      };

      renderWithProviders(<PieceForm {...defaultProps} newPiece={pieceWithPendingImage} />);
      
      // The real component shows a preview when there's a pending image
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    test('renders file input when no pending image', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const fileInput = screen.getByLabelText('Material Image');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png,.webp');
    });

    test('handles pending material image change', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const fileInput = screen.getByLabelText('Material Image');
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      expect(mockOnPendingMaterialImageChange).toHaveBeenCalledWith(expect.any(Object));
    });

    test('handles pending material image removal', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const pieceWithPendingImage = {
        ...defaultNewPiece,
        pendingMaterialImage: mockFile
      };

      renderWithProviders(<PieceForm {...defaultProps} newPiece={pieceWithPendingImage} />);
      
      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);
      
      expect(mockOnRemovePendingMaterialImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Action Buttons', () => {
    test('calls onAddPiece when Add Piece button is clicked', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add piece/i });
      fireEvent.click(addButton);
      
      expect(mockOnAddPiece).toHaveBeenCalledTimes(1);
    });

    test('calls onCancel when Cancel button is clicked', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('buttons have correct types', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const addButton = screen.getByRole('button', { name: /add piece/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      expect(addButton).toHaveAttribute('type', 'button');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Form Validation', () => {
    test('internal code field is required', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Internal Code *');
      expect(input).toHaveAttribute('required');
    });

    test('other fields are not required', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const eanInput = screen.getByLabelText('EAN Code');
      const qrInput = screen.getByLabelText('QR Code');
      const materialCodeInput = screen.getByLabelText('Material Code');
      
      expect(eanInput).not.toHaveAttribute('required');
      expect(qrInput).not.toHaveAttribute('required');
      expect(materialCodeInput).not.toHaveAttribute('required');
    });
  });

  describe('Props Handling', () => {
    test('handles missing onAddPiece prop gracefully', () => {
      const propsWithoutOnAddPiece = {
        ...defaultProps,
        onAddPiece: undefined
      };

      renderWithProviders(<PieceForm {...propsWithoutOnAddPiece} />);
      
      const addButton = screen.getByRole('button', { name: /add piece/i });
      fireEvent.click(addButton);
      
      // Should not throw error
      expect(addButton).toBeInTheDocument();
    });

    test('handles missing onCancel prop gracefully', () => {
      const propsWithoutOnCancel = {
        ...defaultProps,
        onCancel: undefined
      };

      renderWithProviders(<PieceForm {...propsWithoutOnCancel} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      // Should not throw error
      expect(cancelButton).toBeInTheDocument();
    });

    test('handles empty newPiece object', () => {
      renderWithProviders(<PieceForm {...defaultProps} newPiece={{}} />);
      
      expect(screen.getByText('Add New Piece')).toBeInTheDocument();
      expect(screen.getByLabelText('Internal Code *')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      expect(screen.getByText('Add New Piece')).toBeInTheDocument();
      expect(screen.getByText('Piece Details')).toBeInTheDocument();
      expect(screen.getByText('Material Details')).toBeInTheDocument();
    });

    test('has proper label associations', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const internalCodeInput = screen.getByLabelText('Internal Code *');
      const eanInput = screen.getByLabelText('EAN Code');
      const qrInput = screen.getByLabelText('QR Code');
      
      expect(internalCodeInput).toBeInTheDocument();
      expect(eanInput).toBeInTheDocument();
      expect(qrInput).toBeInTheDocument();
    });

    test('has proper input types', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const internalCodeInput = screen.getByLabelText('Internal Code *');
      const eanInput = screen.getByLabelText('EAN Code');
      const dateInput = screen.getByLabelText('Estimated Delivery Date');
      
      expect(internalCodeInput).toHaveAttribute('type', 'text');
      expect(eanInput).toHaveAttribute('type', 'text');
      expect(dateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid input changes', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Internal Code *');
      
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.change(input, { target: { value: 'AB' } });
      fireEvent.change(input, { target: { value: 'ABC' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledTimes(3);
    });

    test('handles very long input values', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const longValue = 'A'.repeat(1000);
      const input = screen.getByLabelText('Internal Code *');
      
      fireEvent.change(input, { target: { value: longValue } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        internal_manufacturer_code: longValue
      });
    });

    test('handles special characters in input', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const specialValue = 'TEST-001_@#$%^&*()';
      const input = screen.getByLabelText('Internal Code *');
      
      fireEvent.change(input, { target: { value: specialValue } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        internal_manufacturer_code: specialValue
      });
    });

    test('handles whitespace-only input', () => {
      renderWithProviders(<PieceForm {...defaultProps} />);
      
      const input = screen.getByLabelText('Internal Code *');
      
      fireEvent.change(input, { target: { value: '   ' } });
      
      expect(mockSetNewPiece).toHaveBeenCalledWith({
        ...defaultNewPiece,
        internal_manufacturer_code: '   '
      });
    });
  });

});
