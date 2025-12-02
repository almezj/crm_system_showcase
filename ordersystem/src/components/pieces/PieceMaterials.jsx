import React from 'react';
import { Collapse } from 'react-bootstrap';

const PieceMaterials = ({ 
  piece, 
  showMaterials 
}) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_IMAGE_BASE_URL || ''}${imagePath}`;
  };

  return (
    <Collapse in={showMaterials}>
      <div>
        <div className="pt-0">
          <div className="row g-2">
            {(Array.isArray(piece.materials) ? piece.materials : []).map((material, materialIndex) => {
              // Ensure material has required fields
              const materialId = material.material_id || material.id || materialIndex;
              const materialName = material.name || `Material ${materialIndex + 1}`;
              
              return (
                <div key={materialId} className="col-12">
                  <div className="card border-0 bg-light">
                    <div className="row g-0">
                      {/* Material Image */}
                      <div className="col-4">
                        <div className="position-relative" style={{ paddingBottom: '100%' }}>
                          {material.material_image_path ? (
                            <img
                              src={getImageUrl(material.material_image_path)}
                              alt={material.name}
                              className="position-absolute top-0 start-0 w-100 h-100 rounded"
                              style={{ 
                                objectFit: 'cover',
                                border: '1px solid #dee2e6'
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', material.material_image_path, 'URL:', getImageUrl(material.material_image_path));
                                console.error('Full material object:', material);
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', material.material_image_path, 'URL:', getImageUrl(material.material_image_path));
                              }}
                            />
                          ) : (
                            <div 
                              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded"
                              style={{ 
                                backgroundColor: '#e9ecef',
                                border: '1px solid #dee2e6'
                              }}
                            >
                              <i className="fas fa-image text-muted" style={{ fontSize: '1rem' }}></i>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Material Details */}
                      <div className="col-8">
                        <div className="card-body p-2">
                          <h6 className="card-title mb-1" title={materialName}>
                            {materialName}
                          </h6>
                          
                          {material.code && (
                            <div className="text-muted small mb-1">
                              <strong>Code:</strong> {material.code}
                            </div>
                          )}
                          
                          {material.color && (
                            <div className="text-muted small mb-1">
                              <strong>Color:</strong> {material.color}
                            </div>
                          )}
                          
                          {material.type && (
                            <div className="text-muted small mb-0">
                              <strong>Type:</strong> {material.type}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Collapse>
  );
};

export default PieceMaterials;
