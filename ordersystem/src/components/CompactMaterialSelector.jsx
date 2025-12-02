import React, { useState } from 'react';
import { Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import MaterialAutocomplete from './MaterialAutocomplete';
import MaterialCreationModal from './modals/MaterialCreationModal';

const CompactMaterialSelector = ({
  materials = [],
  onMaterialsChange,
  excludeSelected = [],
  maxDisplay = 3
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const handleMaterialSelect = (material) => {
    const materialId = material.material_id || material.id;
    
    const isAlreadySelected = materials.some(m => m.material_id === materialId);
    if (isAlreadySelected) {
      return; // Already selected
    }
    
    const newMaterial = {
      material_id: materialId,
      name: material.name,
      code: material.code,
      color: material.color,
      type: material.type,
      style: material.style,
      description: material.description,
      material_image_path: material.material_image_path,
      custom_description: ''
    };
    
    const updatedMaterials = [...materials, newMaterial];
    onMaterialsChange(updatedMaterials);
  };

  const handleRemoveMaterial = (materialId) => {
    const updatedMaterials = materials.filter(m => m.material_id !== materialId);
    onMaterialsChange(updatedMaterials);
  };

  const handleMaterialCreated = (newMaterial) => {
    handleMaterialSelect(newMaterial);
    setShowMaterialModal(false);
  };

  return (
    <div className="compact-material-selector">
      {/* Display Materials */}
      <div className="d-flex flex-wrap gap-1 mb-2">
        {materials.slice(0, maxDisplay).map((material, index) => (
          <Badge 
            key={material.material_id || index} 
            bg="success" 
            className="d-flex align-items-center gap-1 px-2 py-1"
            style={{ fontSize: '0.75rem' }}
          >
            <span>{material.name}</span>
            <button
              type="button"
              className="btn-close btn-close-white"
              style={{ fontSize: '0.5rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMaterial(material.material_id);
              }}
              aria-label="Remove material"
            />
          </Badge>
        ))}
        {materials.length > maxDisplay && (
          <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
            +{materials.length - maxDisplay}
          </Badge>
        )}
      </div>

      {/* Add Material Button */}
      <div className="d-flex gap-1">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowModal(true)}
          className="flex-grow-1"
          style={{ fontSize: '0.8rem' }}
        >
          <i className="fas fa-plus me-1"></i>
          Add Material
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowMaterialModal(true)}
          style={{ fontSize: '0.8rem' }}
        >
          <i className="fas fa-plus-circle me-1"></i>
          New
        </Button>
      </div>

      {/* Material Selection Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Materials</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MaterialAutocomplete
            onMaterialSelect={handleMaterialSelect}
            excludeSelected={materials.map(m => m.material_id)}
            placeholder="Search for materials..."
          />
          
          {materials.length > 0 && (
            <div className="mt-3">
              <h6>Selected Materials:</h6>
              <div className="d-flex flex-wrap gap-2">
                {materials.map((material, index) => (
                  <Badge 
                    key={material.material_id || index} 
                    bg="success" 
                    className="d-flex align-items-center gap-1 px-2 py-1"
                  >
                    <span>{material.name}</span>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      style={{ fontSize: '0.5rem' }}
                      onClick={() => handleRemoveMaterial(material.material_id)}
                      aria-label="Remove material"
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Material Creation Modal */}
      <MaterialCreationModal
        show={showMaterialModal}
        onHide={() => setShowMaterialModal(false)}
        onMaterialCreated={handleMaterialCreated}
      />
    </div>
  );
};

export default CompactMaterialSelector; 