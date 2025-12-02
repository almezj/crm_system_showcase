import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with error reporting services like Sentry here
      console.error('Production Error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <div className="text-center" style={{ maxWidth: '600px' }}>
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
            </div>
            
            <h2 className="mb-3">Something went wrong</h2>
            
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Application Error</Alert.Heading>
              <p className="mb-0">
                We're sorry, but something unexpected happened. This error has been logged and our team will look into it.
              </p>
            </Alert>

            <div className="mb-4">
              <Button 
                variant="primary" 
                onClick={this.handleReset}
                className="me-3"
              >
                <i className="fas fa-redo me-2"></i>
                Try Again
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={this.handleReload}
              >
                <i className="fas fa-refresh me-2"></i>
                Reload Page
              </Button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-start">
                <summary className="mb-2" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-chevron-down me-1"></i>
                  Error Details (Development Only)
                </summary>
                
                <Alert variant="light" className="text-start">
                  <h6>Error Message:</h6>
                  <pre className="mb-3" style={{ fontSize: '12px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                    {this.state.error.toString()}
                  </pre>
                  
                  <h6>Component Stack:</h6>
                  <pre style={{ fontSize: '12px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </Alert>
              </details>
            )}

            <div className="mt-4 text-muted" style={{ fontSize: '14px' }}>
              <p>
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
