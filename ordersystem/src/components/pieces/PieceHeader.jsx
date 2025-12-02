import React from 'react';
import { Badge, Button } from 'react-bootstrap';

const PieceHeader = ({ 
  piece, 
  index, 
  showMaterials, 
  onToggleMaterials 
}) => {
  return (
    <div className="text-center mb-2">
      {piece.internal_manufacturer_code ? (
        <h6 className="card-title mb-1 text-primary fw-bold">
          {piece.internal_manufacturer_code}
        </h6>
      ) : piece.piece_id ? (
        <h6 className="card-title mb-1 text-muted">
          Piece ID: {piece.piece_id}
        </h6>
      ) : (
        <h6 className="card-title mb-1 text-muted">
          Piece #{index + 1}
        </h6>
      )}
      
      {/* Materials Badges */}
      {piece.materials && Array.isArray(piece.materials) && piece.materials.length > 0 ? (
        <div className="d-flex flex-wrap justify-content-center gap-1 mb-2">
          {piece.materials.slice(0, 3).map((material, materialIndex) => {
            // Ensure material has required fields
            const materialId = material.material_id || material.id || materialIndex;
            const materialName = material.name || `Material ${materialIndex + 1}`;
            
            return (
              <Badge 
                key={materialId} 
                bg="success" 
                className="px-2 py-1"
                style={{ fontSize: '0.7rem' }}
              >
                {materialName}
              </Badge>
            );
          })}
          {piece.materials.length > 3 && (
            <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: '0.7rem' }}>
              +{piece.materials.length - 3}
            </Badge>
          )}
        </div>
      ) : (
        <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: '0.7rem' }}>
          No materials
        </Badge>
      )}

      {/* Materials Toggle Button */}
      {piece.materials && Array.isArray(piece.materials) && piece.materials.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onToggleMaterials}
            className="w-100"
            style={{ fontSize: '0.8rem' }}
          >
            <i className={`fas fa-chevron-${showMaterials ? 'up' : 'down'} me-1`}></i>
            Materials ({piece.materials.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default PieceHeader;
