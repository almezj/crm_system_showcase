import React, { useState, useEffect } from 'react';
import MaterialFilters from './materials/MaterialFilters';
import MaterialGrid from './materials/MaterialGrid';
import axios from '../services/axiosInstance';
import { getImageUrl } from '../utils/imageUtils';

const MaterialBrowser = ({ onMaterialSelect, selectedMaterial = null }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    // Extract unique categories, colors, and types from materials
    const uniqueCategories = [...new Set(materials.map(m => m.category).filter(Boolean))];
    const uniqueColors = [...new Set(materials.map(m => m.color).filter(Boolean))];
    const uniqueTypes = [...new Set(materials.map(m => m.type).filter(Boolean))];
    
    setCategories(uniqueCategories);
    setColors(uniqueColors);
    setTypes(uniqueTypes);
  }, [materials]);

  const loadMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/materials');
      setMaterials(response.data);
    } catch (err) {
      setError('Failed to load materials');
      console.error('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchTerm || 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesColor = selectedColor === 'all' || material.color === selectedColor;
    const matchesType = selectedType === 'all' || material.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesColor && matchesType;
  });

  const handleMaterialClick = (material) => {
    onMaterialSelect(material);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedType('all');
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
        <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadMaterials}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="material-browser">
      <MaterialFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedColor={selectedColor}
        selectedType={selectedType}
        categories={categories}
        colors={colors}
        types={types}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onColorChange={setSelectedColor}
        onTypeChange={setSelectedType}
        onClearFilters={clearFilters}
      />

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            Showing {filteredMaterials.length} of {materials.length} materials
          </span>
        </div>
        {selectedMaterial && (
          <div className="d-flex align-items-center">
            <span className="text-muted me-2">Selected:</span>
            <div className="d-flex align-items-center">
              {selectedMaterial.image_path && (
                <img
                  src={getImageUrl(selectedMaterial.image_path)}
                  alt={selectedMaterial.name}
                  className="me-2 rounded"
                  style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <span className="fw-bold">{selectedMaterial.name}</span>
            </div>
          </div>
        )}
      </div>

      <MaterialGrid
        materials={filteredMaterials}
        selectedMaterial={selectedMaterial}
        onMaterialClick={handleMaterialClick}
        onClearFilters={clearFilters}
      />
    </div>
  );
};

export default MaterialBrowser; 