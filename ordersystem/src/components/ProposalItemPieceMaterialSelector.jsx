import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import MaterialAutocomplete from './MaterialAutocomplete';
import MaterialCreationModal from './modals/MaterialCreationModal';

const ProposalItemPieceMaterialSelector = ({
  pieceId,
  materials = [],
  onMaterialsChange,
  excludeSelected = []
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState(materials);
  const { materials: allMaterials } = useSelector((state) => state.materials);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  useEffect(() => {
    setSelectedMaterials(materials);
  }, [materials]);

  const handleMaterialSelect = (material) => {
    console.log('Material selected:', material);
    console.log('Current selected materials:', selectedMaterials);
    
    // Use the correct field name - material has 'id', not 'material_id'
    const materialId = material.material_id || material.id;
    
    const isAlreadySelected = selectedMaterials.some(m => m.material_id === materialId);
    if (isAlreadySelected) {
      console.log('Material already selected, skipping');
      return; // Already selected
    }
    
    const newMaterial = {
      material_id: materialId, // Use the correct ID
      name: material.name,
      code: material.code,
      color: material.color,
      type: material.type,
      style: material.style,
      description: material.description,
      material_image_path: material.material_image_path,
      custom_description: '' // Allow custom description per piece
    };
    
    const updatedMaterials = [...selectedMaterials, newMaterial];
    console.log('Updated materials array:', updatedMaterials);
    setSelectedMaterials(updatedMaterials);
    onMaterialsChange(updatedMaterials);
  };

  const handleRemoveMaterial = (materialId) => {
    console.log('Removing material with ID:', materialId);
    console.log('Current materials before removal:', selectedMaterials);
    
    const updatedMaterials = selectedMaterials.filter(m => m.material_id !== materialId);
    console.log('Materials after removal:', updatedMaterials);
    
    setSelectedMaterials(updatedMaterials);
    onMaterialsChange(updatedMaterials);
  };

  const handleMaterialCreated = (newMaterial) => {
    // Add the newly created material to the selection (support multiple materials)
    const newMaterialForSelection = {
      material_id: newMaterial.id || newMaterial.material_id || newMaterial.materialId,
      name: newMaterial.name,
      code: newMaterial.code || '',
      color: newMaterial.color || '',
      type: newMaterial.type || '',
      style: newMaterial.style || '',
      description: newMaterial.description || '',
      material_image_path: newMaterial.material_image_path || newMaterial.image_path || '',
      custom_description: '' // Allow custom description per piece
    };
    
    const updatedMaterials = [...selectedMaterials, newMaterialForSelection];
    setSelectedMaterials(updatedMaterials);
    onMaterialsChange(updatedMaterials);
  };

  const availableMaterials = allMaterials.filter(material => 
    !selectedMaterials.some(selected => selected.material_id === (material.material_id || material.id))
  );

  console.log('All materials count:', allMaterials.length);
  console.log('Selected materials count:', selectedMaterials.length);
  console.log('Available materials count:', availableMaterials.length);
  console.log('Selected material IDs:', selectedMaterials.map(m => m.material_id));

  return (
    <>
      <Card className="material-selector">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              <i className="fas fa-layer-group me-2"></i>
              Materials ({selectedMaterials.length})
              <Badge bg="info" className="ms-2">Piece ID: {pieceId}</Badge>
            </h6>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => setShowMaterialModal(true)}
            >
              <i className="fas fa-plus me-1"></i> Create New Material
            </Button>
          </div>
          
          <small className="text-muted mb-2 d-block">
            <i className="fas fa-info-circle me-1"></i>
            Drag materials to reorder them. Each material can have a custom description for this piece.
          </small>

          <div className="mb-3">
            <MaterialAutocomplete
              materials={availableMaterials}
              onMaterialSelect={handleMaterialSelect}
              placeholder="Search and select materials..."
              excludeSelected={selectedMaterials.map(m => m.material_id)}
            />
          </div>

          {selectedMaterials.length > 0 ? (
            <div className="selected-materials">
              {selectedMaterials.map((material, index) => (
                <div key={material.material_id} className="material-item mb-2">
                  <div className="d-flex align-items-start justify-content-between p-2 border rounded">
                    <div className="flex-grow-1 me-2">
                      <div className="d-flex align-items-center mb-1">
                        <i className="fas fa-grip-vertical me-2 text-muted" style={{ cursor: 'grab' }}></i>
                        <div className="fw-bold small">{material.name}</div>
                      </div>
                      <div className="text-muted small mb-2">
                        {material.code && `Code: ${material.code}`}
                        {material.color && ` | Color: ${material.color}`}
                        {material.type && ` | Type: ${material.type}`}
                      </div>
                      {material.description && (
                        <div className="text-muted small mb-2">{material.description}</div>
                      )}
                      <div className="form-group">
                        <label className="form-label small text-muted">Custom description for this piece:</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          value={material.custom_description || ''}
                          onChange={(e) => {
                            const updatedMaterials = [...selectedMaterials];
                            updatedMaterials[index].custom_description = e.target.value;
                            setSelectedMaterials(updatedMaterials);
                            onMaterialsChange(updatedMaterials);
                          }}
                          placeholder="Enter custom description for this piece..."
                        />
                      </div>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleRemoveMaterial(material.material_id)} 
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="mb-0">
              <i className="fas fa-info-circle me-2"></i> No materials selected. Use the search above to add materials to this piece.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Material Creation Modal */}
      <MaterialCreationModal
        show={showMaterialModal}
        onHide={() => setShowMaterialModal(false)}
        onMaterialCreated={handleMaterialCreated}
      />
    </>
  );
};

export default ProposalItemPieceMaterialSelector; 