import React from 'react';
import './PDFGenerationLoader.css';

const PDFGenerationLoader = ({ isGenerating }) => {
  if (!isGenerating) return null;

  return (
    <div className="pdf-generation-overlay">
      <div className="pdf-generation-content">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="text-white mb-0">Generating Proposal</h4>
      </div>
    </div>
  );
};

export default PDFGenerationLoader;
