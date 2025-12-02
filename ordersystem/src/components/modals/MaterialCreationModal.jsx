import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createMaterialRequest, clearCreatedMaterial } from '../../redux/materials/actions';
import MaterialAutocomplete from '../MaterialAutocomplete';
import axios from '../../services/axiosInstance';
import './MaterialCreationModal.css';

const MaterialCreationModal = ({ show, onHide, onMaterialCreated }) => {
  const dispatch = useDispatch();
  const { creating: loading, error, material } = useSelector((state) => state.materials);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '',
    type: '',
    style: '',
    category: '',
    description: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showTemplateSearch, setShowTemplateSearch] = useState(false);

  // Handle body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Watch for successful material creation
  useEffect(() => {
    if (!loading && !error && material) {
      onMaterialCreated(material);
      onHide();
      setFormData({
        name: '',
        code: '',
        color: '',
        type: '',
        style: '',
        category: '',
        description: ''
      });
      setImage(null);
      setImagePreview(null);
      dispatch(clearCreatedMaterial());
    }
  }, [loading, error, material, onMaterialCreated, onHide, dispatch]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (show && event.key === 'Escape') {
        handleCancel();
      }
      
      // Handle Enter key submission
      if (show && event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        if (formData.name) {
          handleSubmit();
        }
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, formData.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleTemplateSelect = (material) => {
    // Pre-fill the form with the selected material's data
    setFormData({
      name: material.name + ' (Copy)',
      code: material.code || '',
      color: material.color || '',
      type: material.type || '',
      style: material.style || '',
      category: material.category || '',
      description: material.description || ''
    });
    setShowTemplateSearch(false);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    
    // Add material data
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    // Add image if selected
    if (image) {
      submitData.append('image', image);
    }

    dispatch(createMaterialRequest(submitData));
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      code: '',
      color: '',
      type: '',
      style: '',
      category: '',
      description: ''
    });
    setImage(null);
    setImagePreview(null);
    setShowTemplateSearch(false);
    onHide();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040
        }}
        onClick={handleCancel}
      ></div>
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ 
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1050
        }} 
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg" style={{ margin: '1.75rem auto' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-plus me-2"></i>
                Create New Material
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCancel}
                disabled={loading}
              ></button>
            </div>
            
            {/* Template Search Section */}
            <div className="modal-body border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Use Existing Material as Template</h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowTemplateSearch(!showTemplateSearch)}
                >
                  {showTemplateSearch ? 'Hide Search' : 'Search Templates'}
                </button>
              </div>
              
              {showTemplateSearch && (
                <div className="mb-3">
                  <MaterialAutocomplete
                    value=""
                    onChange={() => {}}
                    onSelect={handleTemplateSelect}
                    placeholder="Search for existing materials to use as template..."
                  />
                  <small className="text-muted">
                    Select an existing material to pre-fill the form. You can then modify the details as needed.
                  </small>
                </div>
              )}
            </div>
            
            <div className="modal-body">
              <h6 className="mb-3">Material Details</h6>
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <div className="row g-3">
                {/* Basic Information */}
                <div className="col-md-6">
                  <label className="form-label">Material Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter material name"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Material Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Enter material code"
                  />
                </div>

                {/* Visual Properties */}
                <div className="col-md-4">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Red, Blue, Green"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <input
                    type="text"
                    className="form-control"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="e.g., Fabric, Leather, Metal"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Style</label>
                  <input
                    type="text"
                    className="form-control"
                    name="style"
                    value={formData.style}
                    onChange={handleInputChange}
                    placeholder="e.g., Modern, Classic, Vintage"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Upholstery, Hardware, Trim"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Material Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Material preview"
                        className="img-thumbnail"
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter material description..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !formData.name}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Create Material
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaterialCreationModal; 