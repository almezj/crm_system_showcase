import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import UserForm from './UserForm';
import { renderWithProviders, resetAllMocks } from '../../test-utils';

describe('UserForm Component', () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    user: {},
    roles: [],
    onSubmit: mockOnSubmit,
    loading: false
  };

  const mockRoles = [
    { role_id: 1, role_name: 'Admin' },
    { role_id: 2, role_name: 'Manager' },
    { role_id: 3, role_name: 'User' }
  ];

  const mockUser = {
    user_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    roles: [1, 2], // Admin and Manager roles
    is_active: true
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    test('renders form with all required fields', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByText('Assign Roles')).toBeInTheDocument();
      expect(screen.getByLabelText('Active')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('renders with empty form when no user provided', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
      expect(screen.getByLabelText('Phone Number')).toHaveValue('');
      expect(screen.getByLabelText('Password')).toHaveValue('');
      expect(screen.getByLabelText('Active')).toBeChecked();
    });

    test('renders with user data when provided', () => {
      renderWithProviders(
        <UserForm {...defaultProps} user={mockUser} roles={mockRoles} />
      );
      
      expect(screen.getByLabelText('First Name')).toHaveValue('John');
      expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
      expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
      expect(screen.getByLabelText('Phone Number')).toHaveValue('+1234567890');
      expect(screen.getByLabelText('Password')).toHaveValue('');
      expect(screen.getByLabelText('Active')).toBeChecked();
    });

    test('shows correct button text for new user', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('shows correct button text for existing user', () => {
      renderWithProviders(
        <UserForm {...defaultProps} user={mockUser} roles={mockRoles} />
      );
      expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument();
    });

    test('shows loading state when loading', () => {
      renderWithProviders(
        <UserForm {...defaultProps} loading={true} roles={mockRoles} />
      );
      
      const button = screen.getByRole('button', { name: /saving/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    test('renders form with correct input types', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      expect(screen.getByLabelText('First Name')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Last Name')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Phone Number')).toHaveAttribute('type', 'tel');
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    test('renders required fields with required attribute', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      expect(screen.getByLabelText('First Name')).toHaveAttribute('required');
      expect(screen.getByLabelText('Last Name')).toHaveAttribute('required');
      expect(screen.getByLabelText('Email')).toHaveAttribute('required');
      // Phone and password are not required
      expect(screen.getByLabelText('Phone Number')).not.toHaveAttribute('required');
      expect(screen.getByLabelText('Password')).not.toHaveAttribute('required');
    });

    test('renders role checkboxes for all provided roles', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      expect(screen.getByLabelText('Admin')).toBeInTheDocument();
      expect(screen.getByLabelText('Manager')).toBeInTheDocument();
      expect(screen.getByLabelText('User')).toBeInTheDocument();
    });

    test('shows correct password placeholder for new user', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('placeholder', '');
    });

    test('shows correct password placeholder for existing user', () => {
      renderWithProviders(
        <UserForm {...defaultProps} user={mockUser} roles={mockRoles} />
      );
      
      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Leave blank to keep current password');
    });
  });

  describe('Form Input Handling', () => {
    test('handles first name input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const firstNameInput = screen.getByLabelText('First Name');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      
      expect(firstNameInput).toHaveValue('Jane');
    });

    test('handles last name input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const lastNameInput = screen.getByLabelText('Last Name');
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
      
      expect(lastNameInput).toHaveValue('Smith');
    });

    test('handles email input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      
      expect(emailInput).toHaveValue('jane@example.com');
    });

    test('handles phone number input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const phoneInput = screen.getByLabelText('Phone Number');
      fireEvent.change(phoneInput, { target: { value: '+9876543210' } });
      
      expect(phoneInput).toHaveValue('+9876543210');
    });

    test('handles password input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      
      expect(passwordInput).toHaveValue('newpassword123');
    });

    test('handles active checkbox changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const activeCheckbox = screen.getByLabelText('Active');
      expect(activeCheckbox).toBeChecked();
      
      fireEvent.click(activeCheckbox);
      expect(activeCheckbox).not.toBeChecked();
      
      fireEvent.click(activeCheckbox);
      expect(activeCheckbox).toBeChecked();
    });

    test('handles multiple input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');
      const emailInput = screen.getByLabelText('Email');
      
      fireEvent.change(firstNameInput, { target: { value: 'Multi' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'multi@example.com' } });
      
      expect(firstNameInput).toHaveValue('Multi');
      expect(lastNameInput).toHaveValue('User');
      expect(emailInput).toHaveValue('multi@example.com');
    });
  });

  describe('Role Selection', () => {
    test('handles role checkbox selection', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const adminCheckbox = screen.getByLabelText('Admin');
      const managerCheckbox = screen.getByLabelText('Manager');
      
      // Initially unchecked
      expect(adminCheckbox).not.toBeChecked();
      expect(managerCheckbox).not.toBeChecked();
      
      // Select Admin role
      fireEvent.click(adminCheckbox);
      expect(adminCheckbox).toBeChecked();
      
      // Select Manager role
      fireEvent.click(managerCheckbox);
      expect(managerCheckbox).toBeChecked();
    });

    test('handles role checkbox deselection', () => {
      renderWithProviders(
        <UserForm {...defaultProps} user={mockUser} roles={mockRoles} />
      );
      
      const adminCheckbox = screen.getByLabelText('Admin');
      const managerCheckbox = screen.getByLabelText('Manager');
      
      // Initially checked (from mockUser)
      expect(adminCheckbox).toBeChecked();
      expect(managerCheckbox).toBeChecked();
      
      // Deselect Admin role
      fireEvent.click(adminCheckbox);
      expect(adminCheckbox).not.toBeChecked();
      
      // Deselect Manager role
      fireEvent.click(managerCheckbox);
      expect(managerCheckbox).not.toBeChecked();
    });

    test('handles multiple role selections', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const adminCheckbox = screen.getByLabelText('Admin');
      const managerCheckbox = screen.getByLabelText('Manager');
      const userCheckbox = screen.getByLabelText('User');
      
      // Select all roles
      fireEvent.click(adminCheckbox);
      fireEvent.click(managerCheckbox);
      fireEvent.click(userCheckbox);
      
      expect(adminCheckbox).toBeChecked();
      expect(managerCheckbox).toBeChecked();
      expect(userCheckbox).toBeChecked();
    });

    test('handles rapid role selection changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const adminCheckbox = screen.getByLabelText('Admin');
      
      // Rapid clicks
      fireEvent.click(adminCheckbox);
      fireEvent.click(adminCheckbox);
      fireEvent.click(adminCheckbox);
      
      // Should end up checked after 3 clicks (unchecked -> checked -> unchecked -> checked)
      expect(adminCheckbox).toBeChecked();
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data when submitted', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      // Fill out the form (user behavior)
      fireEvent.change(screen.getByLabelText('First Name'), { 
        target: { value: 'Test' } 
      });
      fireEvent.change(screen.getByLabelText('Last Name'), { 
        target: { value: 'User' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText('Phone Number'), { 
        target: { value: '+1234567890' } 
      });
      fireEvent.change(screen.getByLabelText('Password'), { 
        target: { value: 'password123' } 
      });
      
      // Select roles
      fireEvent.click(screen.getByLabelText('Admin'));
      fireEvent.click(screen.getByLabelText('Manager'));
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add user/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone_number: '+1234567890',
        password: 'password123',
        roles: [1, 2], // Admin and Manager
        is_active: true
      });
    });

    test('calls onSubmit with existing user data when editing', () => {
      renderWithProviders(
        <UserForm {...defaultProps} user={mockUser} roles={mockRoles} />
      );
      
      // Modify some fields (user behavior)
      fireEvent.change(screen.getByLabelText('First Name'), { 
        target: { value: 'Updated' } 
      });
      fireEvent.change(screen.getByLabelText('Last Name'), { 
        target: { value: 'Name' } 
      });
      
      // Add a role
      fireEvent.click(screen.getByLabelText('User'));
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /update user/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: 'Updated',
        last_name: 'Name',
        email: 'john@example.com', // Unchanged
        phone_number: '+1234567890', // Unchanged
        password: '', // Unchanged
        roles: [1, 2, 3], // Original roles + User role
        is_active: true // Unchanged
      });
    });

    test('handles form submission with only required fields', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      // Fill only required fields
      fireEvent.change(screen.getByLabelText('First Name'), { 
        target: { value: 'Required' } 
      });
      fireEvent.change(screen.getByLabelText('Last Name'), { 
        target: { value: 'Only' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'required@example.com' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add user/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: 'Required',
        last_name: 'Only',
        email: 'required@example.com',
        phone_number: '',
        password: '',
        roles: [],
        is_active: true
      });
    });

    test('handles form submission with no roles selected', () => {
      renderWithProviders(
        <UserForm {...defaultProps} user={mockUser} roles={mockRoles} />
      );
      
      // Deselect all roles
      fireEvent.click(screen.getByLabelText('Admin'));
      fireEvent.click(screen.getByLabelText('Manager'));
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /update user/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_number: '+1234567890',
        password: '',
        roles: [], // No roles selected
        is_active: true
      });
    });

    test('handles form submission with inactive user', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      // Fill required fields
      fireEvent.change(screen.getByLabelText('First Name'), { 
        target: { value: 'Inactive' } 
      });
      fireEvent.change(screen.getByLabelText('Last Name'), { 
        target: { value: 'User' } 
      });
      fireEvent.change(screen.getByLabelText('Email'), { 
        target: { value: 'inactive@example.com' } 
      });
      
      // Uncheck active status
      fireEvent.click(screen.getByLabelText('Active'));
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /add user/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        first_name: 'Inactive',
        last_name: 'User',
        email: 'inactive@example.com',
        phone_number: '',
        password: '',
        roles: [],
        is_active: false
      });
    });
  });

  describe('Form State Management', () => {
    test('initializes with empty state when no user provided', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      // Verify initial empty state by checking input values
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
      expect(screen.getByLabelText('Phone Number')).toHaveValue('');
      expect(screen.getByLabelText('Password')).toHaveValue('');
      expect(screen.getByLabelText('Active')).toBeChecked();
      
      // Verify no roles are selected
      expect(screen.getByLabelText('Admin')).not.toBeChecked();
      expect(screen.getByLabelText('Manager')).not.toBeChecked();
      expect(screen.getByLabelText('User')).not.toBeChecked();
    });

    test('initializes with user data when provided', () => {
      renderWithProviders(
        <UserForm {...defaultProps} user={mockUser} roles={mockRoles} />
      );
      
      // Verify user data is loaded
      expect(screen.getByLabelText('First Name')).toHaveValue('John');
      expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
      expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
      expect(screen.getByLabelText('Phone Number')).toHaveValue('+1234567890');
      expect(screen.getByLabelText('Password')).toHaveValue('');
      expect(screen.getByLabelText('Active')).toBeChecked();
      
      // Verify roles are selected
      expect(screen.getByLabelText('Admin')).toBeChecked();
      expect(screen.getByLabelText('Manager')).toBeChecked();
      expect(screen.getByLabelText('User')).not.toBeChecked();
    });

    test('maintains form state during input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');
      
      // Change first name
      fireEvent.change(firstNameInput, { target: { value: 'First' } });
      expect(firstNameInput).toHaveValue('First');
      expect(lastNameInput).toHaveValue(''); // Should still be empty
      
      // Change last name
      fireEvent.change(lastNameInput, { target: { value: 'Last' } });
      expect(firstNameInput).toHaveValue('First'); // Should maintain previous value
      expect(lastNameInput).toHaveValue('Last');
    });

    test('handles rapid input changes', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const firstNameInput = screen.getByLabelText('First Name');
      
      // Rapid changes
      fireEvent.change(firstNameInput, { target: { value: 'A' } });
      fireEvent.change(firstNameInput, { target: { value: 'AB' } });
      fireEvent.change(firstNameInput, { target: { value: 'ABC' } });
      fireEvent.change(firstNameInput, { target: { value: 'ABCD' } });
      
      expect(firstNameInput).toHaveValue('ABCD');
    });
  });

  describe('Props Handling', () => {
    test('handles missing onSubmit prop gracefully', () => {
      // This should not crash the component
      expect(() => {
        renderWithProviders(<UserForm user={{}} roles={mockRoles} />);
      }).not.toThrow();
    });

    test('handles undefined user prop', () => {
      renderWithProviders(<UserForm {...defaultProps} user={undefined} roles={mockRoles} />);
      
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('handles null user prop', () => {
      renderWithProviders(<UserForm {...defaultProps} user={null} roles={mockRoles} />);
      
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toHaveValue('');
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
    });

    test('handles empty roles array', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={[]} />);
      
      expect(screen.getByText('Assign Roles')).toBeInTheDocument();
      expect(screen.queryByLabelText('Admin')).not.toBeInTheDocument();
    });

    test('handles user with missing fields', () => {
      const incompleteUser = {
        user_id: 1,
        first_name: 'Incomplete',
        // Missing other fields
      };
      
      renderWithProviders(
        <UserForm {...defaultProps} user={incompleteUser} roles={mockRoles} />
      );
      
      expect(screen.getByDisplayValue('Incomplete')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
    });

    test('handles loading state changes', () => {
      const { rerender } = renderWithProviders(
        <UserForm {...defaultProps} loading={false} roles={mockRoles} />
      );
      
      // Initially not loading
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add user/i })).not.toBeDisabled();
      
      // Update to loading state
      rerender(<UserForm {...defaultProps} loading={true} roles={mockRoles} />);
      
      // Should show loading state
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      const { container } = renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    test('has proper label associations', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');
      const emailInput = screen.getByLabelText('Email');
      const phoneInput = screen.getByLabelText('Phone Number');
      const passwordInput = screen.getByLabelText('Password');
      const activeCheckbox = screen.getByLabelText('Active');
      
      expect(firstNameInput).toHaveAttribute('id', 'first_name');
      expect(lastNameInput).toHaveAttribute('id', 'last_name');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(phoneInput).toHaveAttribute('id', 'phone_number');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(activeCheckbox).toHaveAttribute('id', 'is_active');
    });

    test('has proper role checkbox associations', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const adminCheckbox = screen.getByLabelText('Admin');
      const managerCheckbox = screen.getByLabelText('Manager');
      const userCheckbox = screen.getByLabelText('User');
      
      expect(adminCheckbox).toHaveAttribute('id', 'role-1');
      expect(managerCheckbox).toHaveAttribute('id', 'role-2');
      expect(userCheckbox).toHaveAttribute('id', 'role-3');
    });

    test('has proper button type', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const submitButton = screen.getByRole('button', { name: /add user/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge Cases', () => {
    test('handles very long input values', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const longValue = 'A'.repeat(1000);
      const firstNameInput = screen.getByLabelText('First Name');
      
      fireEvent.change(firstNameInput, { target: { value: longValue } });
      expect(firstNameInput).toHaveValue(longValue);
    });

    test('handles special characters in input', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const specialValue = 'Test & Co. "Special" <Characters>';
      const firstNameInput = screen.getByLabelText('First Name');
      
      fireEvent.change(firstNameInput, { target: { value: specialValue } });
      expect(firstNameInput).toHaveValue(specialValue);
    });

    test('handles whitespace-only input', () => {
      renderWithProviders(<UserForm {...defaultProps} roles={mockRoles} />);
      
      const firstNameInput = screen.getByLabelText('First Name');
      
      fireEvent.change(firstNameInput, { target: { value: '   ' } });
      expect(firstNameInput).toHaveValue('   ');
    });


    test('handles user with complex role data', () => {
      const complexUser = {
        user_id: 1,
        first_name: 'Complex',
        last_name: 'User',
        email: 'complex@example.com',
        phone_number: '+1234567890',
        roles: [1, 3], // Admin and User roles
        is_active: false
      };
      
      renderWithProviders(
        <UserForm {...defaultProps} user={complexUser} roles={mockRoles} />
      );
      
      // Verify complex user data is loaded correctly
      expect(screen.getByLabelText('First Name')).toHaveValue('Complex');
      expect(screen.getByLabelText('Last Name')).toHaveValue('User');
      expect(screen.getByLabelText('Email')).toHaveValue('complex@example.com');
      expect(screen.getByLabelText('Phone Number')).toHaveValue('+1234567890');
      expect(screen.getByLabelText('Active')).not.toBeChecked();
      
      // Verify correct roles are selected
      expect(screen.getByLabelText('Admin')).toBeChecked();
      expect(screen.getByLabelText('Manager')).not.toBeChecked();
      expect(screen.getByLabelText('User')).toBeChecked();
    });
  });
});
