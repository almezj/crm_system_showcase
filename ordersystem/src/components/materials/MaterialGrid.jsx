import React from 'react';
import MaterialCard from './MaterialCard';

const MaterialGrid = ({ 
  materials, 
  selectedMaterial, 
  onMaterialClick, 
  onClearFilters 
}) => {
  if (materials.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-search text-muted mb-3" style={{ fontSize: '3rem' }}></i>
        <h5 className="text-muted">No materials found</h5>
        <p className="text-muted">Try adjusting your search criteria or filters</p>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onClearFilters}
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {materials.map((material) => (
        <div key={material.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
          <MaterialCard
            material={material}
            isSelected={selectedMaterial?.id === material.id}
            onMaterialClick={onMaterialClick}
          />
        </div>
      ))}
    </div>
  );
};

export default MaterialGrid;
