import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Badge } from 'react-bootstrap';
import MaterialAutocomplete from './MaterialAutocomplete';
import { getImageUrl } from '../utils/imageUtils';

const PieceMaterialSelector = ({ 
  selectedMaterials = [], 
  onMaterialsChange,
  excludeSelected = [] 
}) => {
  const { materials } = useSelector((state) => state.materials);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const handleMaterialSelect = (material) => {
    if (material && !selectedMaterials.find(m => m.id === material.id)) {
      const newMaterials = [...selectedMaterials, material];
      onMaterialsChange(newMaterials);
    }
  };

  const handleMaterialRemove = (materialId) => {
    const newMaterials = selectedMaterials.filter(m => m.id !== materialId);
    onMaterialsChange(newMaterials);
  };

  // Get IDs of already selected materials for exclusion
  const selectedMaterialIds = selectedMaterials.map(m => m.id);

  return (
    <div className="piece-material-selector">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <i className="fas fa-layer-group me-2"></i>
          Materials ({selectedMaterials.length})
        </h6>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowAutocomplete(!showAutocomplete)}
        >
          <i className="fas fa-plus me-1"></i>
          Add Material
        </Button>
      </div>

      {showAutocomplete && (
        <div className="mb-3">
          <MaterialAutocomplete
            onMaterialSelect={handleMaterialSelect}
            excludeSelected={selectedMaterialIds}
            placeholder="Search and select materials..."
          />
        </div>
      )}

      {selectedMaterials.length > 0 && (
        <div className="selected-materials">
          {selectedMaterials.map((material) => (
            <Card key={material.id} className="mb-2 material-card">
              <Card.Body className="p-2">
                <div className="d-flex align-items-center">
                  {material.material_image_path && (
                    <div className="material-image me-2">
                      <img
                        src={getImageUrl(material.material_image_path)}
                        alt={material.name}
                        className="rounded"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <div className="material-name fw-bold">{material.name}</div>
                    <div className="material-details text-muted small">
                      {material.code && <span className="me-2">Code: {material.code}</span>}
                      {material.color && <span className="me-2">Color: {material.color}</span>}
                      {material.type && <span className="me-2">Type: {material.type}</span>}
                    </div>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleMaterialRemove(material.id)}
                    title="Remove material"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {selectedMaterials.length === 0 && (
        <div className="text-center py-3 text-muted">
          <i className="fas fa-layer-group fa-2x mb-2"></i>
          <p className="mb-0">No materials selected</p>
        </div>
      )}
    </div>
  );
};

export default PieceMaterialSelector; 