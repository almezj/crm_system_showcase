import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const MaterialCard = ({ 
  material, 
  isSelected, 
  onMaterialClick 
}) => {
  return (
    <div 
      className={`card h-100 material-card ${isSelected ? 'border-primary' : 'border-light'}`}
      style={{ cursor: 'pointer' }}
      onClick={() => onMaterialClick(material)}
    >
      <div className="card-body p-3">
        {/* Material Image */}
        <div className="text-center mb-3">
          {material.image_path ? (
            <img
              src={getImageUrl(material.image_path)}
              alt={material.name}
              className="img-fluid rounded"
              style={{ 
                width: '100%', 
                height: '120px', 
                objectFit: 'cover',
                border: '1px solid #dee2e6'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'block';
                }
              }}
            />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center rounded"
              style={{ 
                width: '100%', 
                height: '120px', 
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6'
              }}
            >
              <i className="fas fa-image text-muted" style={{ fontSize: '2rem' }}></i>
            </div>
          )}
        </div>

        {/* Material Info */}
        <div>
          <h6 className="card-title mb-1 text-truncate" title={material.name}>
            {material.name}
          </h6>
          
          {material.code && (
            <p className="text-muted small mb-1">
              <strong>Code:</strong> {material.code}
            </p>
          )}
          
          {material.color && (
            <p className="text-muted small mb-1">
              <strong>Color:</strong> {material.color}
            </p>
          )}
          
          {material.type && (
            <p className="text-muted small mb-1">
              <strong>Type:</strong> {material.type}
            </p>
          )}
          
          {material.category && (
            <p className="text-muted small mb-1">
              <strong>Category:</strong> {material.category}
            </p>
          )}
          
          {material.description && (
            <p className="text-muted small mb-0 text-truncate" title={material.description}>
              {material.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="card-footer bg-primary text-white text-center py-2">
          <i className="fas fa-check me-1"></i>
          Selected
        </div>
      )}
    </div>
  );
};

export default MaterialCard;
