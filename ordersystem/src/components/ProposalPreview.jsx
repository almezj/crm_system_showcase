import React, { useState, useEffect } from 'react';
import axios from '../services/axiosInstance';

const ProposalPreview = ({ proposalId, templateType, pdfOptions, onRefresh }) => {
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreview = React.useCallback(async () => {
    if (!proposalId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters from pdfOptions
      const params = new URLSearchParams();
      params.append('type', templateType || 'product_summary');
      
      // Add all PDF options as query parameters
      if (pdfOptions) {
        Object.keys(pdfOptions).forEach(key => {
          if (pdfOptions[key] !== null && pdfOptions[key] !== undefined) {
            if (typeof pdfOptions[key] === 'object') {
              params.append(key, JSON.stringify(pdfOptions[key]));
            } else {
              params.append(key, pdfOptions[key]);
            }
          }
        });
      }
      
      const response = await axios.get(`/proposals/${proposalId}/preview?${params.toString()}`, {
        responseType: 'text' // Important: we want the raw HTML, not JSON
      });
      
      setPreviewHtml(response.data);
    } catch (err) {
      console.error('Failed to fetch preview:', err);
      setError(err.response?.data?.error || 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  }, [proposalId, templateType, pdfOptions]);

  // Fetch preview when component mounts or when dependencies change
  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchPreview);
    }
  }, [onRefresh, fetchPreview]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5>Preview Error</h5>
        <p>{error}</p>
        <button className="btn btn-outline-danger btn-sm" onClick={fetchPreview}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="proposal-preview-container">
      <style>
        {`
          .proposal-preview-wrapper {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            width: 100%;
            padding: 20px;
            background: #f5f5f5;
            min-height: 400px;
          }
          
          .proposal-preview-frame {
            width: 100%;
            max-width: 210mm; /* A4 width */
            aspect-ratio: 210/297; /* A4 aspect ratio */
            border: 1px solid #ccc;
            borderRadius: 4px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background: white;
            position: relative;
          }
          
          .proposal-preview-frame iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
            transform-origin: top left;
          }
          
          /* Responsive scaling */
          @media (max-width: 768px) {
            .proposal-preview-wrapper {
              padding: 10px;
            }
            .proposal-preview-frame {
              max-width: 100%;
            }
          }
          
          @media (max-width: 480px) {
            .proposal-preview-wrapper {
              padding: 5px;
            }
          }
        `}
      </style>
      <div className="proposal-preview-wrapper">
        <div className="proposal-preview-frame">
          <iframe
            srcDoc={previewHtml}
            title="Proposal Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
      
      {/* Developer note */}
      <div className="mt-3 text-center">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          This is an HTML preview for development purposes. Use browser dev tools to inspect and modify styling in real-time.
        </small>
      </div>
    </div>
  );
};

export default ProposalPreview;
