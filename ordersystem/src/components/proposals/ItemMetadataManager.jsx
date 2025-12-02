import React from 'react';

const ItemMetadataManager = ({ 
  itemMetadata, 
  onMetadataAdd, 
  onMetadataChange, 
  onMetadataDelete, 
  selectedProduct 
}) => {
  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="form-label mb-0">Item Metadata</label>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={onMetadataAdd}
        >
          Add Metadata
        </button>
      </div>
      
      {itemMetadata.length > 0 && (
        <div className="border rounded p-3">
          {itemMetadata.map((metadata, metadataIndex) => (
            <div key={metadataIndex} className="row align-items-center mb-2">
              <div className="col-md-5">
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Key name"
                    value={metadata.key_name}
                    onChange={(e) =>
                      onMetadataChange(metadataIndex, "key_name", e.target.value)
                    }
                  />
                  {metadata.is_mandatory && (
                    <span className="badge bg-danger ms-2" title="Mandatory field">
                      *
                    </span>
                  )}
                </div>
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className={`form-control form-control-sm ${metadata.is_mandatory && !metadata.value ? 'border-danger' : ''}`}
                  placeholder={metadata.is_mandatory ? "Required value" : "Value"}
                  value={metadata.value}
                  onChange={(e) =>
                    onMetadataChange(metadataIndex, "value", e.target.value)
                  }
                  required={metadata.is_mandatory}
                />
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onMetadataDelete(metadataIndex)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {itemMetadata.length === 0 && (
        <div className="text-muted small">
          {selectedProduct ? 
            "No metadata defined for this product. Click 'Add Metadata' to add custom properties." :
            "Select a product to load its metadata, or click 'Add Metadata' to add custom properties."
          }
        </div>
      )}
    </div>
  );
};

export default ItemMetadataManager;
