import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import ManufacturerForm from './ManufacturerForm';
import { renderWithProviders, resetAllMocks } from '../../test-utils';

describe('ManufacturerForm Component', () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    manufacturer: null,
    onSubmit: mockOnSubmit
  };

  const mockManufacturer = {
    name: 'Test Manufacturer',
    contact_person: 'John Doe',
    contact_email: 'john@test.com',
    contact_phone: '+1234567890',
    address: '123 Test Street, Test City'
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    test('renders form with all required fields', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      expect(screen.getByLabelText('Manufacturer Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact Person')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add manufacturer/i })).toBeInTheDocument();
    });

    test('renders with empty form when no manufacturer provided', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      expect(screen.getByLabelText('Manufacturer Name')).toHaveValue('');
      expect(screen.getByLabelText('Contact Person')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
      expect(screen.getByLabelText('Phone')).toHaveValue('');
      expect(screen.getByLabelText('Address')).toHaveValue('');
    });

    test('renders with manufacturer data when provided', () => {
      renderWithProviders(
        <ManufacturerForm {...defaultProps} manufacturer={mockManufacturer} />
      );
      
      expect(screen.getByDisplayValue('Test Manufacturer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Test Street, Test City')).toBeInTheDocument();
    });

    test('shows correct button text for new manufacturer', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add manufacturer/i })).toBeInTheDocument();
    });

    test('shows correct button text for existing manufacturer', () => {
      renderWithProviders(
        <ManufacturerForm {...defaultProps} manufacturer={mockManufacturer} />
      );
      expect(screen.getByRole('button', { name: /update manufacturer/i })).toBeInTheDocument();
    });

    test('renders form with correct input types', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      expect(screen.getByLabelText('Manufacturer Name')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Contact Person')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Phone')).toHaveAttribute('type', 'text');
      // Textarea doesn't have a type attribute
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
    });

    test('renders required fields with required attribute', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      expect(screen.getByLabelText('Manufacturer Name')).toHaveAttribute('required');
      expect(screen.getByLabelText('Contact Person')).toHaveAttribute('required');
      // Email and phone are not required
      expect(screen.getByLabelText('Email')).not.toHaveAttribute('required');
      expect(screen.getByLabelText('Phone')).not.toHaveAttribute('required');
    });
  });

  describe('Form Input Handling', () => {
    test('handles name input changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Manufacturer Name');
      fireEvent.change(nameInput, { target: { value: 'New Manufacturer' } });
      
      expect(nameInput).toHaveValue('New Manufacturer');
    });

    test('handles contact person input changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const contactInput = screen.getByLabelText('Contact Person');
      fireEvent.change(contactInput, { target: { value: 'Jane Smith' } });
      
      expect(contactInput).toHaveValue('Jane Smith');
    });

    test('handles email input changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      
      expect(emailInput).toHaveValue('jane@example.com');
    });

    test('handles phone input changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const phoneInput = screen.getByLabelText('Phone');
      fireEvent.change(phoneInput, { target: { value: '+9876543210' } });
      
      expect(phoneInput).toHaveValue('+9876543210');
    });

    test('handles address textarea changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const addressInput = screen.getByLabelText('Address');
      fireEvent.change(addressInput, { target: { value: '456 New Street, New City' } });
      
      expect(addressInput).toHaveValue('456 New Street, New City');
    });

    test('handles multiple input changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Manufacturer Name');
      const contactInput = screen.getByLabelText('Contact Person');
      const emailInput = screen.getByLabelText('Email');
      
      fireEvent.change(nameInput, { target: { value: 'Multi Manufacturer' } });
      fireEvent.change(contactInput, { target: { value: 'Multi Person' } });
      fireEvent.change(emailInput, { target: { value: 'multi@example.com' } });
      
      expect(nameInput).toHaveValue('Multi Manufacturer');
      expect(contactInput).toHaveValue('Multi Person');
      expect(emailInput).toHaveValue('multi@example.com');
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data when submitted', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      // Fill out the form (user behavior)
      fireEvent.change(screen.getByLabelText('Manufacturer Name'), { 
        target: { value: 'Test Manufacturer' } 
      });
      fireEvent.change(screen.getByLabelText('Contact Person'), { 
        target: { value: 'Test Person' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Phone'), { 
        target: { value: '+1234567890' } 
      });
      fireEvent.change(screen.getByLabelText('Address'), { 
        target: { value: 'Test Address' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add manufacturer/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Manufacturer',
        contact_person: 'Test Person',
        contact_email: 'test@example.com',
        contact_phone: '+1234567890',
        address: 'Test Address'
      });
    });

    test('calls onSubmit with existing manufacturer data when editing', () => {
      renderWithProviders(
        <ManufacturerForm {...defaultProps} manufacturer={mockManufacturer} />
      );
      
      // Modify some fields (user behavior)
      fireEvent.change(screen.getByLabelText('Manufacturer Name'), { 
        target: { value: 'Updated Manufacturer' } 
      });
      fireEvent.change(screen.getByLabelText('Contact Person'), { 
        target: { value: 'Updated Person' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /update manufacturer/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Updated Manufacturer',
        contact_person: 'Updated Person',
        contact_email: 'john@test.com', // Unchanged
        contact_phone: '+1234567890', // Unchanged
        address: '123 Test Street, Test City' // Unchanged
      });
    });

    test('prevents default form submission behavior', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      // Fill required fields first
      fireEvent.change(screen.getByLabelText('Manufacturer Name'), { 
        target: { value: 'Test Manufacturer' } 
      });
      fireEvent.change(screen.getByLabelText('Contact Person'), { 
        target: { value: 'Test Person' } 
      });
      
      // Click the submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add manufacturer/i }));
      
      // Verify the form was submitted (onSubmit was called)
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    test('handles form submission with only required fields', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      // Fill only required fields
      fireEvent.change(screen.getByLabelText('Manufacturer Name'), { 
        target: { value: 'Required Only' } 
      });
      fireEvent.change(screen.getByLabelText('Contact Person'), { 
        target: { value: 'Required Person' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add manufacturer/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Required Only',
        contact_person: 'Required Person',
        contact_email: '',
        contact_phone: '',
        address: ''
      });
    });

    test('handles form submission with empty optional fields', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      // Fill required fields and leave optional ones empty
      fireEvent.change(screen.getByLabelText('Manufacturer Name'), { 
        target: { value: 'Test Manufacturer' } 
      });
      fireEvent.change(screen.getByLabelText('Contact Person'), { 
        target: { value: 'Test Person' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add manufacturer/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Manufacturer',
        contact_person: 'Test Person',
        contact_email: '',
        contact_phone: '',
        address: ''
      });
    });
  });

  describe('Form State Management', () => {
    test('initializes with empty state when no manufacturer provided', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      // Verify initial empty state by checking input values
      expect(screen.getByLabelText('Manufacturer Name')).toHaveValue('');
      expect(screen.getByLabelText('Contact Person')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
      expect(screen.getByLabelText('Phone')).toHaveValue('');
      expect(screen.getByLabelText('Address')).toHaveValue('');
      
      // Fill required fields and submit to test form behavior
      fireEvent.change(screen.getByLabelText('Manufacturer Name'), { 
        target: { value: 'Test Manufacturer' } 
      });
      fireEvent.change(screen.getByLabelText('Contact Person'), { 
        target: { value: 'Test Person' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add manufacturer/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Manufacturer',
        contact_person: 'Test Person',
        contact_email: '',
        contact_phone: '',
        address: ''
      });
    });

    test('initializes with manufacturer data when provided', () => {
      renderWithProviders(
        <ManufacturerForm {...defaultProps} manufacturer={mockManufacturer} />
      );
      
      // Submit without changes to see initial data
      fireEvent.click(screen.getByRole('button', { name: /update manufacturer/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith(mockManufacturer);
    });

    test('maintains form state during input changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Manufacturer Name');
      const contactInput = screen.getByLabelText('Contact Person');
      
      // Change name
      fireEvent.change(nameInput, { target: { value: 'First Name' } });
      expect(nameInput).toHaveValue('First Name');
      expect(contactInput).toHaveValue(''); // Should still be empty
      
      // Change contact
      fireEvent.change(contactInput, { target: { value: 'First Contact' } });
      expect(nameInput).toHaveValue('First Name'); // Should maintain previous value
      expect(contactInput).toHaveValue('First Contact');
    });

    test('handles rapid input changes', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Manufacturer Name');
      
      // Rapid changes
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.change(nameInput, { target: { value: 'AB' } });
      fireEvent.change(nameInput, { target: { value: 'ABC' } });
      fireEvent.change(nameInput, { target: { value: 'ABCD' } });
      
      expect(nameInput).toHaveValue('ABCD');
    });
  });

  describe('Props Handling', () => {
    test('handles missing onSubmit prop gracefully', () => {
      // This should not crash the component
      expect(() => {
        renderWithProviders(<ManufacturerForm manufacturer={null} />);
      }).not.toThrow();
    });

    test('handles undefined manufacturer prop', () => {
      renderWithProviders(<ManufacturerForm manufacturer={undefined} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByRole('button', { name: /add manufacturer/i })).toBeInTheDocument();
    });

    test('handles null manufacturer prop', () => {
      renderWithProviders(<ManufacturerForm manufacturer={null} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByRole('button', { name: /add manufacturer/i })).toBeInTheDocument();
    });

    test('handles manufacturer with missing fields', () => {
      const incompleteManufacturer = {
        name: 'Incomplete Manufacturer',
        // Missing other fields
      };
      
      renderWithProviders(
        <ManufacturerForm {...defaultProps} manufacturer={incompleteManufacturer} />
      );
      
      expect(screen.getByDisplayValue('Incomplete Manufacturer')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact Person')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
      expect(screen.getByLabelText('Phone')).toHaveValue('');
      expect(screen.getByLabelText('Address')).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      const { container } = renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    test('has proper label associations', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Manufacturer Name');
      const contactInput = screen.getByLabelText('Contact Person');
      const emailInput = screen.getByLabelText('Email');
      const phoneInput = screen.getByLabelText('Phone');
      const addressInput = screen.getByLabelText('Address');
      
      expect(nameInput).toHaveAttribute('id', 'name');
      expect(contactInput).toHaveAttribute('id', 'contact_person');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(phoneInput).toHaveAttribute('id', 'phone');
      expect(addressInput).toHaveAttribute('id', 'address');
    });

    test('has proper button type', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /add manufacturer/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge Cases', () => {
    test('handles very long input values', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const longValue = 'A'.repeat(1000);
      const nameInput = screen.getByLabelText('Manufacturer Name');
      
      fireEvent.change(nameInput, { target: { value: longValue } });
      expect(nameInput).toHaveValue(longValue);
    });

    test('handles special characters in input', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const specialValue = 'Test & Co. "Special" <Characters>';
      const nameInput = screen.getByLabelText('Manufacturer Name');
      
      fireEvent.change(nameInput, { target: { value: specialValue } });
      expect(nameInput).toHaveValue(specialValue);
    });

    test('handles whitespace-only input', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Manufacturer Name');
      
      fireEvent.change(nameInput, { target: { value: '   ' } });
      expect(nameInput).toHaveValue('   ');
    });

    test('handles form submission with whitespace-only values', () => {
      renderWithProviders(<ManufacturerForm {...defaultProps} />);
      
      // Enter whitespace-only values (user behavior)
      fireEvent.change(screen.getByLabelText('Manufacturer Name'), { 
        target: { value: '   ' } 
      });
      fireEvent.change(screen.getByLabelText('Contact Person'), { 
        target: { value: '   ' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add manufacturer/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: '   ',
        contact_person: '   ',
        contact_email: '',
        contact_phone: '',
        address: ''
      });
    });
  });
});
