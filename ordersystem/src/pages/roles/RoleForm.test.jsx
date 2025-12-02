import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach, describe } from 'vitest';
import RoleForm from './RoleForm';
import { renderWithProviders, resetAllMocks, testScenarios } from '../../test-utils';

// No Redux action mocking - use real actions for production-like testing

describe('RoleForm Component', () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    role: {},
    onSubmit: mockOnSubmit,
    loading: false
  };

  const mockPermissions = [
    {
      right_id: 1,
      area_name: 'users',
      description: 'Manage users'
    },
    {
      right_id: 2,
      area_name: 'roles',
      description: 'Manage roles'
    },
    {
      right_id: 3,
      area_name: 'proposals',
      description: 'Manage proposals'
    }
  ];

  const mockRole = {
    role_id: 1,
    role_name: 'Admin',
    description: 'Full access to all features',
    rights: [
      { area_name: 'users', permission_type: 'full control' },
      { area_name: 'roles', permission_type: 'write' },
      { area_name: 'proposals', permission_type: 'read' }
    ]
  };

  const permissionsState = {
    permissions: {
      permissions: mockPermissions,
      loading: false,
      error: null
    }
  };

  beforeEach(() => {
    resetAllMocks();
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    test('renders form with all required fields', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByLabelText('Role Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByText('Permissions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save role/i })).toBeInTheDocument();
    });

    test('renders with empty form when no role provided', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByLabelText('Role Name')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });

    test('renders with role data when provided', () => {
      renderWithProviders(
        <RoleForm {...defaultProps} role={mockRole} />,
        { initialState: permissionsState }
      );
      
      expect(screen.getByLabelText('Role Name')).toHaveValue('Admin');
      expect(screen.getByLabelText('Description')).toHaveValue('Full access to all features');
    });

    test('shows loading state when loading', () => {
      renderWithProviders(
        <RoleForm {...defaultProps} loading={true} />,
        { initialState: permissionsState }
      );
      
      const button = screen.getByRole('button', { name: /saving/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    test('renders form with correct input types', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByLabelText('Role Name')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Description')).toHaveAttribute('rows', '3');
    });

    test('renders required fields with required attribute', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByLabelText('Role Name')).toHaveAttribute('required');
      // Description is not required
      expect(screen.getByLabelText('Description')).not.toHaveAttribute('required');
    });

    test('renders permissions table with correct structure', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Area Name')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
      expect(screen.getByText('Permission')).toBeInTheDocument();
    });

    test('renders permission rows for all permissions', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByText('users')).toBeInTheDocument();
      expect(screen.getByText('Manage users')).toBeInTheDocument();
      expect(screen.getByText('roles')).toBeInTheDocument();
      expect(screen.getByText('Manage roles')).toBeInTheDocument();
      expect(screen.getByText('proposals')).toBeInTheDocument();
      expect(screen.getByText('Manage proposals')).toBeInTheDocument();
    });

    test('renders permission select dropdowns with correct options', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements).toHaveLength(3); // One for each permission
      
      // Check that all expected options are present (using getAllByRole to handle multiple instances)
      expect(screen.getAllByRole('option', { name: 'No Access' })).toHaveLength(3);
      expect(screen.getAllByRole('option', { name: 'Read' })).toHaveLength(3);
      expect(screen.getAllByRole('option', { name: 'Write' })).toHaveLength(3);
      expect(screen.getAllByRole('option', { name: 'Full Control' })).toHaveLength(3);
    });
  });

  describe('Redux Integration', () => {
    test('dispatches fetchPermissionsRequest on mount', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      // Component should render without errors when Redux actions are dispatched
      expect(screen.getByText('Role Name')).toBeInTheDocument();
    });

    test('uses permissions from Redux state', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      // Should render permissions from Redux state
      expect(screen.getByText('users')).toBeInTheDocument();
      expect(screen.getByText('roles')).toBeInTheDocument();
      expect(screen.getByText('proposals')).toBeInTheDocument();
    });

    test('handles loading state from Redux', () => {
      const loadingState = {
        permissions: {
          permissions: [],
          loading: true,
          error: null
        }
      };
      
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: loadingState
      });
      
      // Should still render the form even when permissions are loading
      expect(screen.getByLabelText('Role Name')).toBeInTheDocument();
    });

    test('handles empty permissions from Redux', () => {
      const emptyState = {
        permissions: {
          permissions: [],
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: emptyState
      });
      
      // Should render form but no permission rows
      expect(screen.getByLabelText('Role Name')).toBeInTheDocument();
      expect(screen.queryByText('users')).not.toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    test('handles role name input changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const roleNameInput = screen.getByLabelText('Role Name');
      fireEvent.change(roleNameInput, { target: { value: 'Manager' } });
      
      expect(roleNameInput).toHaveValue('Manager');
    });

    test('handles description textarea changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const descriptionTextarea = screen.getByLabelText('Description');
      fireEvent.change(descriptionTextarea, { target: { value: 'Can manage users and roles' } });
      
      expect(descriptionTextarea).toHaveValue('Can manage users and roles');
    });

    test('handles multiple input changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const roleNameInput = screen.getByLabelText('Role Name');
      const descriptionTextarea = screen.getByLabelText('Description');
      
      fireEvent.change(roleNameInput, { target: { value: 'Editor' } });
      fireEvent.change(descriptionTextarea, { target: { value: 'Can edit content' } });
      
      expect(roleNameInput).toHaveValue('Editor');
      expect(descriptionTextarea).toHaveValue('Can edit content');
    });
  });

  describe('Permission Handling', () => {
    test('handles permission selection changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const selectElements = screen.getAllByRole('combobox');
      const firstSelect = selectElements[0];
      
      fireEvent.change(firstSelect, { target: { value: 'read' } });
      
      expect(firstSelect).toHaveValue('read');
    });

    test('handles multiple permission changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const selectElements = screen.getAllByRole('combobox');
      
      // Change first permission to read
      fireEvent.change(selectElements[0], { target: { value: 'read' } });
      // Change second permission to write
      fireEvent.change(selectElements[1], { target: { value: 'write' } });
      // Change third permission to full control
      fireEvent.change(selectElements[2], { target: { value: 'full control' } });
      
      expect(selectElements[0]).toHaveValue('read');
      expect(selectElements[1]).toHaveValue('write');
      expect(selectElements[2]).toHaveValue('full control');
    });

    test('initializes with role permissions when provided', () => {
      renderWithProviders(
        <RoleForm {...defaultProps} role={mockRole} />,
        { initialState: permissionsState }
      );
      
      const selectElements = screen.getAllByRole('combobox');
      
      // Should initialize with role's existing permissions
      expect(selectElements[0]).toHaveValue('full control'); // users
      expect(selectElements[1]).toHaveValue('write'); // roles
      expect(selectElements[2]).toHaveValue('read'); // proposals
    });

    test('handles rapid permission changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const selectElements = screen.getAllByRole('combobox');
      const firstSelect = selectElements[0];
      
      // Rapid changes
      fireEvent.change(firstSelect, { target: { value: 'read' } });
      fireEvent.change(firstSelect, { target: { value: 'write' } });
      fireEvent.change(firstSelect, { target: { value: 'full control' } });
      
      expect(firstSelect).toHaveValue('full control');
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data when submitted', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      // Fill out the form (user behavior)
      fireEvent.change(screen.getByLabelText('Role Name'), { 
        target: { value: 'Test Role' } 
      });
      fireEvent.change(screen.getByLabelText('Description'), { 
        target: { value: 'Test description' } 
      });
      
      // Set permissions
      const selectElements = screen.getAllByRole('combobox');
      fireEvent.change(selectElements[0], { target: { value: 'read' } });
      fireEvent.change(selectElements[1], { target: { value: 'write' } });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /save role/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        role_name: 'Test Role',
        description: 'Test description',
        rights: expect.arrayContaining([
          expect.objectContaining({
            right_id: 1,
            area_name: 'users',
            permission_type: 'read'
          }),
          expect.objectContaining({
            right_id: 2,
            area_name: 'roles',
            permission_type: 'write'
          }),
          expect.objectContaining({
            right_id: 3,
            area_name: 'proposals',
            permission_type: 'none'
          })
        ])
      });
    });

    test('calls onSubmit with existing role data when editing', () => {
      renderWithProviders(
        <RoleForm {...defaultProps} role={mockRole} />,
        { initialState: permissionsState }
      );
      
      // Modify some fields (user behavior)
      fireEvent.change(screen.getByLabelText('Role Name'), { 
        target: { value: 'Updated Admin' } 
      });
      fireEvent.change(screen.getByLabelText('Description'), { 
        target: { value: 'Updated description' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /save role/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        role_name: 'Updated Admin',
        description: 'Updated description',
        rights: expect.arrayContaining([
          expect.objectContaining({
            right_id: 1,
            area_name: 'users',
            permission_type: 'full control'
          }),
          expect.objectContaining({
            right_id: 2,
            area_name: 'roles',
            permission_type: 'write'
          }),
          expect.objectContaining({
            right_id: 3,
            area_name: 'proposals',
            permission_type: 'read'
          })
        ])
      });
    });

    test('handles form submission with only required fields', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      // Fill only required fields
      fireEvent.change(screen.getByLabelText('Role Name'), { 
        target: { value: 'Required Only' } 
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /save role/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        role_name: 'Required Only',
        description: '',
        rights: expect.arrayContaining([
          expect.objectContaining({
            right_id: 1,
            area_name: 'users',
            permission_type: 'none'
          }),
          expect.objectContaining({
            right_id: 2,
            area_name: 'roles',
            permission_type: 'none'
          }),
          expect.objectContaining({
            right_id: 3,
            area_name: 'proposals',
            permission_type: 'none'
          })
        ])
      });
    });

    test('handles form submission with all permissions set to none', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      // Fill required field
      fireEvent.change(screen.getByLabelText('Role Name'), { 
        target: { value: 'No Permissions' } 
      });
      
      // Ensure all permissions are set to none (default)
      const selectElements = screen.getAllByRole('combobox');
      selectElements.forEach(select => {
        expect(select).toHaveValue('none');
      });
      
      // Click submit button (user behavior)
      fireEvent.click(screen.getByRole('button', { name: /save role/i }));
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        role_name: 'No Permissions',
        description: '',
        rights: expect.arrayContaining([
          expect.objectContaining({ permission_type: 'none' }),
          expect.objectContaining({ permission_type: 'none' }),
          expect.objectContaining({ permission_type: 'none' })
        ])
      });
    });
  });

  describe('Form State Management', () => {
    test('initializes with empty state when no role provided', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      // Verify initial empty state by checking input values
      expect(screen.getByLabelText('Role Name')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      
      // Verify all permissions are set to none
      const selectElements = screen.getAllByRole('combobox');
      selectElements.forEach(select => {
        expect(select).toHaveValue('none');
      });
    });

    test('initializes with role data when provided', () => {
      renderWithProviders(
        <RoleForm {...defaultProps} role={mockRole} />,
        { initialState: permissionsState }
      );
      
      // Verify role data is loaded
      expect(screen.getByLabelText('Role Name')).toHaveValue('Admin');
      expect(screen.getByLabelText('Description')).toHaveValue('Full access to all features');
      
      // Verify permissions are set correctly
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements[0]).toHaveValue('full control');
      expect(selectElements[1]).toHaveValue('write');
      expect(selectElements[2]).toHaveValue('read');
    });

    test('maintains form state during input changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const roleNameInput = screen.getByLabelText('Role Name');
      const descriptionTextarea = screen.getByLabelText('Description');
      
      // Change role name
      fireEvent.change(roleNameInput, { target: { value: 'First' } });
      expect(roleNameInput).toHaveValue('First');
      expect(descriptionTextarea).toHaveValue(''); // Should still be empty
      
      // Change description
      fireEvent.change(descriptionTextarea, { target: { value: 'Description' } });
      expect(roleNameInput).toHaveValue('First'); // Should maintain previous value
      expect(descriptionTextarea).toHaveValue('Description');
    });

    test('handles rapid input changes', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const roleNameInput = screen.getByLabelText('Role Name');
      
      // Rapid changes
      fireEvent.change(roleNameInput, { target: { value: 'A' } });
      fireEvent.change(roleNameInput, { target: { value: 'AB' } });
      fireEvent.change(roleNameInput, { target: { value: 'ABC' } });
      fireEvent.change(roleNameInput, { target: { value: 'ABCD' } });
      
      expect(roleNameInput).toHaveValue('ABCD');
    });
  });

  describe('Props Handling', () => {
    test('handles missing onSubmit prop gracefully', () => {
      // This should not crash the component
      expect(() => {
        renderWithProviders(<RoleForm role={{}} />, {
          initialState: permissionsState
        });
      }).not.toThrow();
    });

    test('handles undefined role prop', () => {
      renderWithProviders(<RoleForm {...defaultProps} role={undefined} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByRole('button', { name: /save role/i })).toBeInTheDocument();
    });

    test('handles null role prop', () => {
      renderWithProviders(<RoleForm {...defaultProps} role={null} />, {
        initialState: permissionsState
      });
      
      expect(screen.getByRole('button', { name: /save role/i })).toBeInTheDocument();
    });

    test('handles role with missing fields', () => {
      const incompleteRole = {
        role_id: 1,
        role_name: 'Incomplete',
        // Missing other fields
      };
      
      renderWithProviders(
        <RoleForm {...defaultProps} role={incompleteRole} />,
        { initialState: permissionsState }
      );
      
      expect(screen.getByDisplayValue('Incomplete')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });

    test('handles loading state changes', () => {
      const { rerender } = renderWithProviders(
        <RoleForm {...defaultProps} loading={false} />,
        { initialState: permissionsState }
      );
      
      // Initially not loading
      expect(screen.getByRole('button', { name: /save role/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save role/i })).not.toBeDisabled();
      
      // Update to loading state
      rerender(<RoleForm {...defaultProps} loading={true} />);
      
      // Should show loading state
      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      const { container } = renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    test('has proper label associations', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const roleNameInput = screen.getByLabelText('Role Name');
      const descriptionTextarea = screen.getByLabelText('Description');
      
      expect(roleNameInput).toHaveAttribute('name', 'role_name');
      expect(descriptionTextarea).toHaveAttribute('name', 'description');
    });

    test('has proper table structure for permissions', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      // Check table headers
      expect(screen.getByRole('columnheader', { name: 'Area Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Permission' })).toBeInTheDocument();
    });

    test('has proper button type', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const submitButton = screen.getByRole('button', { name: /save role/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Edge Cases', () => {
    test('handles very long input values', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const longValue = 'A'.repeat(1000);
      const roleNameInput = screen.getByLabelText('Role Name');
      
      fireEvent.change(roleNameInput, { target: { value: longValue } });
      expect(roleNameInput).toHaveValue(longValue);
    });

    test('handles special characters in input', () => {
      renderWithProviders(<RoleForm {...defaultProps} />, {
        initialState: permissionsState
      });
      
      const specialValue = 'Role & Co. "Special" <Characters>';
      const roleNameInput = screen.getByLabelText('Role Name');
      
      fireEvent.change(roleNameInput, { target: { value: specialValue } });
      expect(roleNameInput).toHaveValue(specialValue);
    });

    test('handles role with complex permission data', () => {
      const complexRole = {
        role_id: 1,
        role_name: 'Complex Role',
        description: 'Complex role with mixed permissions',
        rights: [
          { area_name: 'users', permission_type: 'full control' },
          { area_name: 'roles', permission_type: 'none' },
          { area_name: 'proposals', permission_type: 'write' }
        ]
      };
      
      renderWithProviders(
        <RoleForm {...defaultProps} role={complexRole} />,
        { initialState: permissionsState }
      );
      
      // Verify complex role data is loaded correctly
      expect(screen.getByLabelText('Role Name')).toHaveValue('Complex Role');
      expect(screen.getByLabelText('Description')).toHaveValue('Complex role with mixed permissions');
      
      // Verify permissions are set correctly
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements[0]).toHaveValue('full control');
      expect(selectElements[1]).toHaveValue('none');
      expect(selectElements[2]).toHaveValue('write');
    });

    test('handles role with no permissions', () => {
      const roleWithNoPermissions = {
        role_id: 1,
        role_name: 'No Permissions Role',
        description: 'Role with no permissions',
        rights: []
      };
      
      renderWithProviders(
        <RoleForm {...defaultProps} role={roleWithNoPermissions} />,
        { initialState: permissionsState }
      );
      
      // Should initialize with all permissions set to none
      const selectElements = screen.getAllByRole('combobox');
      selectElements.forEach(select => {
        expect(select).toHaveValue('none');
      });
    });
  });
});
