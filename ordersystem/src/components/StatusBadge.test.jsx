import React from 'react';
import { screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import StatusBadge from './StatusBadge';
import { renderWithProviders } from '../test-utils';

describe('StatusBadge Component', () => {
  describe('Rendering', () => {
    test('renders status text in a badge element', () => {
      renderWithProviders(<StatusBadge status="Draft" />);
      
      const badge = screen.getByText('Draft');
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('SPAN');
      expect(badge).toHaveClass('badge');
    });

    test('displays the exact status text passed as prop', () => {
      const testStatus = 'Custom Status';
      renderWithProviders(<StatusBadge status={testStatus} />);
      
      expect(screen.getByText(testStatus)).toBeInTheDocument();
    });
  });

  describe('Status-Specific Styling', () => {
    test('applies correct styling for Draft status', () => {
      renderWithProviders(<StatusBadge status="Draft" />);
      
      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('badge', 'bg-secondary', 'text-dark');
    });

    test('applies correct styling for Pending Approval status', () => {
      renderWithProviders(<StatusBadge status="Pending Approval" />);
      
      const badge = screen.getByText('Pending Approval');
      expect(badge).toHaveClass('badge', 'bg-info', 'text-dark');
    });

    test('applies correct styling for Under Negotiation status', () => {
      renderWithProviders(<StatusBadge status="Under Negotiation" />);
      
      const badge = screen.getByText('Under Negotiation');
      expect(badge).toHaveClass('badge', 'bg-primary', 'text-white');
    });

    test('applies correct styling for Accepted status', () => {
      renderWithProviders(<StatusBadge status="Accepted" />);
      
      const badge = screen.getByText('Accepted');
      expect(badge).toHaveClass('badge', 'bg-success');
    });

    test('applies correct styling for Rejected status', () => {
      renderWithProviders(<StatusBadge status="Rejected" />);
      
      const badge = screen.getByText('Rejected');
      expect(badge).toHaveClass('badge', 'bg-danger');
    });

    test('applies correct styling for On Hold status', () => {
      renderWithProviders(<StatusBadge status="On Hold" />);
      
      const badge = screen.getByText('On Hold');
      expect(badge).toHaveClass('badge', 'bg-warning', 'text-dark');
    });

    test('applies correct styling for Expired status', () => {
      renderWithProviders(<StatusBadge status="Expired" />);
      
      const badge = screen.getByText('Expired');
      expect(badge).toHaveClass('badge', 'bg-danger');
    });

    test('applies correct styling for Converted to Order status', () => {
      renderWithProviders(<StatusBadge status="Converted to Order" />);
      
      const badge = screen.getByText('Converted to Order');
      expect(badge).toHaveClass('badge', 'bg-success', 'text-white');
    });
  });

  describe('Default/Unknown Status Handling', () => {
    test('applies default styling for unknown status', () => {
      renderWithProviders(<StatusBadge status="Unknown Status" />);
      
      const badge = screen.getByText('Unknown Status');
      expect(badge).toHaveClass('badge', 'bg-secondary');
      expect(badge).not.toHaveClass('text-dark', 'text-white');
    });

    test('applies default styling for empty string status', () => {
      const { container } = renderWithProviders(<StatusBadge status="" />);
      
      const badge = container.querySelector('.badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge', 'bg-secondary');
      expect(badge).toHaveTextContent('');
    });

    test('applies default styling for null status', () => {
      const { container } = renderWithProviders(<StatusBadge status={null} />);
      
      const badge = container.querySelector('.badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge', 'bg-secondary');
      expect(badge).toHaveTextContent('');
    });

    test('applies default styling for undefined status', () => {
      const { container } = renderWithProviders(<StatusBadge status={undefined} />);
      
      const badge = container.querySelector('.badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge', 'bg-secondary');
      expect(badge).toHaveTextContent('');
    });
  });

  describe('Case Sensitivity', () => {
    test('status matching is case-sensitive', () => {
      renderWithProviders(<StatusBadge status="draft" />);
      
      const badge = screen.getByText('draft');
      // Should get default styling, not Draft styling
      expect(badge).toHaveClass('badge', 'bg-secondary');
      expect(badge).not.toHaveClass('bg-secondary', 'text-dark');
    });

    test('exact case matches work correctly', () => {
      renderWithProviders(<StatusBadge status="DRAFT" />);
      
      const badge = screen.getByText('DRAFT');
      // Should get default styling, not Draft styling
      expect(badge).toHaveClass('badge', 'bg-secondary');
      expect(badge).not.toHaveClass('bg-secondary', 'text-dark');
    });
  });

  describe('Component Props', () => {
    test('handles status prop correctly', () => {
      const testStatuses = [
        'Draft',
        'Pending Approval', 
        'Under Negotiation',
        'Accepted',
        'Rejected',
        'On Hold',
        'Expired',
        'Converted to Order'
      ];

      testStatuses.forEach(status => {
        const { unmount } = renderWithProviders(<StatusBadge status={status} />);
        
        const badge = screen.getByText(status);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('badge');
        
        unmount();
      });
    });
  });
});
