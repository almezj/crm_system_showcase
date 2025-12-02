import React from 'react';

const MaterialFilters = ({ 
  searchTerm, 
  selectedCategory, 
  selectedColor, 
  selectedType, 
  categories, 
  colors, 
  types, 
  onSearchChange, 
  onCategoryChange, 
  onColorChange, 
  onTypeChange, 
  onClearFilters 
}) => {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Material Filters</h6>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Search Materials</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, code, or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Color</label>
            <select
              className="form-select"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
            >
              <option value="all">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialFilters;
