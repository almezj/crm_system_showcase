import React from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { useErrorHandler } from '../hooks/useErrorHandler';

/**
 * Example component demonstrating how to use the new error handling system
 * This component can be used for testing different error scenarios
 */
const ErrorHandlingExample = () => {
  const {
    showValidationError,
    showNetworkError,
    showServerError,
    showAuthError,
    showSuccess,
    showInfo,
    showWarning,
    handleError
  } = useErrorHandler();

  // Simulate different types of errors
  const simulateValidationError = () => {
    showValidationError('Please fill in all required fields', {
      validation_errors: {
        email: 'Email is required',
        password: 'Password must be at least 8 characters'
      }
    });
  };

  const simulateNetworkError = () => {
    showNetworkError('Unable to connect to the server. Please check your internet connection.');
  };

  const simulateServerError = () => {
    showServerError('Internal server error occurred. Please try again later.');
  };

  const simulateAuthError = () => {
    showAuthError('Your session has expired. Please log in again.');
  };

  const simulateSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const simulateInfo = () => {
    showInfo('This is an informational message.');
  };

  const simulateWarning = () => {
    showWarning('This is a warning message.');
  };

  // Simulate API error handling
  const simulateApiError = () => {
    const mockError = {
      response: {
        status: 422,
        data: {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          validation_errors: {
            name: 'Name is required',
            email: 'Invalid email format'
          }
        }
      },
      message: 'Request failed with status code 422'
    };
    
    handleError(mockError, 'Creating user account');
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Error Handling System Demo</h2>
      <p className="mb-4 text-muted">
        Click the buttons below to test different error scenarios and see how the error handling system works.
      </p>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Error Types</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-danger" onClick={simulateValidationError}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Validation Error
                </Button>
                
                <Button variant="outline-warning" onClick={simulateNetworkError}>
                  <i className="fas fa-wifi me-2"></i>
                  Network Error
                </Button>
                
                <Button variant="outline-danger" onClick={simulateServerError}>
                  <i className="fas fa-server me-2"></i>
                  Server Error
                </Button>
                
                <Button variant="outline-danger" onClick={simulateAuthError}>
                  <i className="fas fa-lock me-2"></i>
                  Auth Error
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Message Types</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-success" onClick={simulateSuccess}>
                  <i className="fas fa-check me-2"></i>
                  Success Message
                </Button>
                
                <Button variant="outline-info" onClick={simulateInfo}>
                  <i className="fas fa-info-circle me-2"></i>
                  Info Message
                </Button>
                
                <Button variant="outline-warning" onClick={simulateWarning}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Warning Message
                </Button>
                
                <Button variant="outline-secondary" onClick={simulateApiError}>
                  <i className="fas fa-code me-2"></i>
                  API Error (Mock)
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Usage Instructions</h5>
        </Card.Header>
        <Card.Body>
          <h6>In your components, use the error handler like this:</h6>
          <pre className="bg-light p-3 rounded">
{`import { useErrorHandler } from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, showSuccess } = useErrorHandler();
  
  const handleSubmit = async () => {
    try {
      await api.createItem(data);
      showSuccess('Item created successfully!');
    } catch (error) {
      handleError(error, 'Creating item');
    }
  };
  
  return (
    // Your component JSX
  );
};`}
          </pre>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ErrorHandlingExample;
