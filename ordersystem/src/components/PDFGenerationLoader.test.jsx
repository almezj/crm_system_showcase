import React from 'react';
import { screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import PDFGenerationLoader from './PDFGenerationLoader';
import { renderWithProviders } from '../test-utils';

describe('PDFGenerationLoader Component', () => {
  describe('Rendering', () => {
    test('renders nothing when isGenerating is false', () => {
      const { container } = renderWithProviders(<PDFGenerationLoader isGenerating={false} />);
      
      // Should render nothing (null)
      expect(container.firstChild).toBeNull();
    });

    test('renders loader when isGenerating is true', () => {
      renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      // Should render the loader overlay
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Generating Proposal')).toBeInTheDocument();
    });

    test('renders with correct spinner styling', () => {
      renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner-border', 'text-primary', 'mb-3');
    });

    test('renders with correct text content', () => {
      renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      expect(screen.getByText('Generating Proposal')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    test('shows loader when isGenerating changes from false to true', () => {
      const { rerender } = renderWithProviders(<PDFGenerationLoader isGenerating={false} />);
      
      // Initially should not render
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      
      // Change to generating
      rerender(<PDFGenerationLoader isGenerating={true} />);
      
      // Should now render
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Generating Proposal')).toBeInTheDocument();
    });

    test('hides loader when isGenerating changes from true to false', () => {
      const { rerender } = renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      // Initially should render
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Change to not generating
      rerender(<PDFGenerationLoader isGenerating={false} />);
      
      // Should no longer render
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    test('handles undefined isGenerating prop', () => {
      const { container } = renderWithProviders(<PDFGenerationLoader />);
      
      // Should render nothing when isGenerating is undefined
      expect(container.firstChild).toBeNull();
    });

    test('handles null isGenerating prop', () => {
      const { container } = renderWithProviders(<PDFGenerationLoader isGenerating={null} />);
      
      // Should render nothing when isGenerating is null
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    test('has proper accessibility attributes', () => {
      renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('role', 'status');
      
      const hiddenText = screen.getByText('Loading...');
      expect(hiddenText).toHaveClass('visually-hidden');
    });

    test('has proper ARIA labels', () => {
      renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('role', 'status');
      
      // Check that the visually hidden text is present for screen readers
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    test('applies correct CSS classes', () => {
      renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('spinner-border', 'text-primary', 'mb-3');
      
      const title = screen.getByText('Generating Proposal');
      expect(title).toHaveClass('text-white', 'mb-0');
    });

    test('renders with proper structure', () => {
      const { container } = renderWithProviders(<PDFGenerationLoader isGenerating={true} />);
      
      // Check for the main overlay structure
      const overlay = container.querySelector('.pdf-generation-overlay');
      expect(overlay).toBeInTheDocument();
      
      const content = container.querySelector('.pdf-generation-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid toggling of isGenerating prop', () => {
      const { rerender } = renderWithProviders(<PDFGenerationLoader isGenerating={false} />);
      
      // Toggle multiple times
      rerender(<PDFGenerationLoader isGenerating={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      rerender(<PDFGenerationLoader isGenerating={false} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      
      rerender(<PDFGenerationLoader isGenerating={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('handles string values for isGenerating prop', () => {
      // Test with string "true" (should be truthy)
      const { rerender } = renderWithProviders(<PDFGenerationLoader isGenerating="true" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Test with string "false" (should be truthy, but component checks for boolean)
      rerender(<PDFGenerationLoader isGenerating="false" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('handles number values for isGenerating prop', () => {
      // Test with 0 (should be falsy)
      const { rerender } = renderWithProviders(<PDFGenerationLoader isGenerating={0} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      
      // Test with 1 (should be truthy)
      rerender(<PDFGenerationLoader isGenerating={1} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
