import React from 'react';

const ProductMetadataManager = ({ 
  metadata, 
  onMetadataChange, 
  onAddMetadata, 
  onRemoveMetadata 
}) => {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Product Metadata</h5>
        <small className="text-muted">
          Define metadata fields that will be inherited by proposal items
        </small>
      </div>
      <div className="card-body">
        {metadata.map((item, index) => (
          <div key={index} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Metadata Field {index + 1}</h6>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => onRemoveMetadata(index)}
                data-testid={`remove-metadata-${index}`}
              >
                Remove
              </button>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor={`key-name-${index}`}>Key Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id={`key-name-${index}`}
                  value={item.key_name}
                  onChange={(e) => onMetadataChange(index, 'key_name', e.target.value)}
                  placeholder="e.g., dimensions, weight, color"
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor={`default-value-${index}`}>Default Value</label>
                <input
                  type="text"
                  className="form-control"
                  id={`default-value-${index}`}
                  value={item.value}
                  onChange={(e) => onMetadataChange(index, 'value', e.target.value)}
                  placeholder="Leave empty for user input"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`mandatory-${index}`}
                  checked={item.is_mandatory}
                  onChange={(e) => onMetadataChange(index, 'is_mandatory', e.target.checked)}
                />
                <label className="form-check-label" htmlFor={`mandatory-${index}`}>
                  Mandatory field (proposal items must provide this value)
                </label>
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onAddMetadata}
        >
          Add Metadata Field
        </button>
      </div>
    </div>
  );
};

export default ProductMetadataManager;
