import React from 'react';
import { Alert, Button, Collapse } from 'react-bootstrap';
import { useError, ERROR_SEVERITY } from '../contexts/ErrorContext';

const ErrorNotification = () => {
  const { errors, removeError, clearErrors } = useError();

  if (!errors || errors.length === 0) {
    return null;
  }

  const getAlertVariant = (error) => {
    // Handle success and info types
    if (error.type === 'success') return 'success';
    if (error.type === 'info') return 'info';
    if (error.type === 'warning') return 'warning';
    
    // Handle severity-based variants
    switch (error.severity) {
      case ERROR_SEVERITY.LOW:
        return 'info';
      case ERROR_SEVERITY.MEDIUM:
        return 'warning';
      case ERROR_SEVERITY.HIGH:
        return 'danger';
      case ERROR_SEVERITY.CRITICAL:
        return 'danger';
      default:
        return 'warning';
    }
  };

  const getIcon = (error) => {
    // Handle success and info types
    if (error.type === 'success') return 'fas fa-check-circle';
    if (error.type === 'info') return 'fas fa-info-circle';
    if (error.type === 'warning') return 'fas fa-exclamation-triangle';
    
    // Handle severity-based icons
    switch (error.severity) {
      case ERROR_SEVERITY.LOW:
        return 'fas fa-info-circle';
      case ERROR_SEVERITY.MEDIUM:
        return 'fas fa-exclamation-triangle';
      case ERROR_SEVERITY.HIGH:
        return 'fas fa-exclamation-circle';
      case ERROR_SEVERITY.CRITICAL:
        return 'fas fa-times-circle';
      default:
        return 'fas fa-exclamation-triangle';
    }
  };

  return (
    <div className="error-notification-container" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      maxWidth: '400px',
      width: '100%'
    }}>
      {errors.map((error) => (
        <Alert
          key={error.id}
          variant={getAlertVariant(error)}
          dismissible
          onClose={() => removeError(error.id)}
          className="mb-2 shadow-sm"
          style={{
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="d-flex align-items-start">
            <i className={`${getIcon(error)} me-2 mt-1`} style={{ fontSize: '16px' }}></i>
            <div className="flex-grow-1">
              <Alert.Heading className="h6 mb-1" style={{ fontSize: '14px', fontWeight: '600' }}>
                {error.title}
              </Alert.Heading>
              <div className="mb-2" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                {error.message}
              </div>
              
              {/* Show context if available */}
              {error.context && (
                <div className="text-muted mb-2" style={{ fontSize: '12px' }}>
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {error.context}
                </div>
              )}
              
              {/* Show error code if available */}
              {error.code && (
                <div className="text-muted mb-2" style={{ fontSize: '12px' }}>
                  <i className="fas fa-code me-1"></i>
                  Code: {error.code}
                </div>
              )}
              
              {/* Show details if available */}
              {error.details && (
                <Collapse in={false}>
                  <div className="mt-2">
                    <details>
                      <summary style={{ fontSize: '12px', cursor: 'pointer' }}>
                        <i className="fas fa-chevron-down me-1"></i>
                        Technical Details
                      </summary>
                      <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '11px', maxHeight: '150px', overflow: 'auto' }}>
                        {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                </Collapse>
              )}
              
              {/* Show validation errors if available */}
              {error.details && error.details.validation_errors && (
                <div className="mt-2">
                  <div className="text-muted mb-1" style={{ fontSize: '12px' }}>
                    <i className="fas fa-list me-1"></i>
                    Validation Issues:
                  </div>
                  <ul className="mb-0" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                    {Object.entries(error.details.validation_errors).map(([field, message]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Show custom actions if available */}
              {error.actions && (
                <div className="mt-2">
                  {error.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={action.onClick}
                      style={{ fontSize: '11px' }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Alert>
      ))}
      
      {/* Clear all button if multiple errors */}
      {errors.length > 1 && (
        <div className="text-center mt-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={clearErrors}
            style={{ fontSize: '12px' }}
          >
            <i className="fas fa-times me-1"></i>
            Clear All ({errors.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorNotification;
