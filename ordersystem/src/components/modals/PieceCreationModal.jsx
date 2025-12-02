import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPieceRequest, clearCreatedPiece } from '../../redux/pieces/actions';
import PieceImageUpload from '../PieceImageUpload';
import axios from '../../services/axiosInstance';

const PieceCreationModal = ({ show, onHide, onPieceCreated, productId }) => {
  const dispatch = useDispatch();
  const { loading, error, piece } = useSelector((state) => state.pieces);
  
  const [formData, setFormData] = useState({
    internal_manufacturer_code: '',
    ean_code: '',
    qr_code: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isImagePrimary, setIsImagePrimary] = useState(true);

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

  // Watch for successful piece creation
  useEffect(() => {
    if (!loading && !error && piece) {
      // If there's a selected image, upload it to the newly created piece
      if (selectedFile) {
        const uploadImage = async () => {
          try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('description', imageDescription);
            formData.append('is_primary', isImagePrimary);
            
            // Use axiosInstance for automatic token renewal and consistent error handling
            await axios.post(`pieces/${piece.piece_id}/images`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            console.log('Piece image uploaded successfully');
          } catch (error) {
            console.error('Failed to upload piece image:', error);
          }
        };
        
        uploadImage();
      }
      
      onPieceCreated(piece);
      onHide();
      setFormData({
        internal_manufacturer_code: '',
        ean_code: '',
        qr_code: '',
        description: ''
      });
      setSelectedFile(null);
      setImageDescription('');
      setIsImagePrimary(true);
      dispatch(clearCreatedPiece());
    }
  }, [loading, error, piece, onPieceCreated, onHide, dispatch, selectedFile, imageDescription, isImagePrimary]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('=== KEYDOWN EVENT ===');
      console.log('Key:', event.key);
      console.log('Target:', event.target);
      console.log('Show:', show);
      
      if (show && event.key === 'Escape') {
        handleCancel();
      }
      
      // Handle Enter key submission
      if (show && event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        console.log('Enter key pressed - submitting form');
        event.preventDefault();
        if (formData.internal_manufacturer_code) {
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
  }, [show, formData.internal_manufacturer_code]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    console.log('=== PIECE CREATION FORM SUBMIT START ===');
    console.log('Form data:', formData);
    console.log('Product ID:', productId);
    
    if (!productId) {
      console.error('ERROR: No product ID provided!');
      // Error handling moved to toast notifications
      return;
    }
    
    const requestData = {
      ...formData,
      product_id: productId,
      is_active: 1
    };
    
    console.log('Request data:', requestData);
    console.log('Dispatching createPieceRequest...');
    
    dispatch(createPieceRequest(requestData));
    
    console.log('=== PIECE CREATION FORM SUBMIT END ===');
  };

  const handleCancel = () => {
    console.log('=== HANDLE CANCEL CALLED ===');
    setFormData({
      internal_manufacturer_code: '',
      ean_code: '',
      qr_code: '',
      description: ''
    });
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
        onClick={(e) => {
          console.log('=== BACKDROP CLICK ===');
          e.preventDefault();
          e.stopPropagation();
          handleCancel();
        }}
      ></div>
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="modal-dialog" style={{ margin: '1.75rem auto', maxWidth: '600px', width: '90%' }}>
          <div 
            className="modal-content"
            onClick={(e) => {
              console.log('=== MODAL CONTENT CLICK ===');
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-cube me-2"></i>
                Create New Piece
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCancel}
                disabled={loading}
              ></button>
            </div>
            
            <div className="modal-body">
              <h6 className="mb-3">Piece Details</h6>
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <div className="row g-3">
                {/* Basic Information */}
                <div className="col-md-6">
                  <label className="form-label">Internal Manufacturer Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="internal_manufacturer_code"
                    value={formData.internal_manufacturer_code}
                    onChange={handleInputChange}
                    placeholder="Enter manufacturer code"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">EAN Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ean_code"
                    value={formData.ean_code}
                    onChange={handleInputChange}
                    placeholder="Enter EAN code"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">QR Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="qr_code"
                    value={formData.qr_code}
                    onChange={handleInputChange}
                    placeholder="Enter QR code"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter piece description"
                  />
                </div>
              </div>

              {/* General Piece Image Upload Section */}
              <div className="mt-4">
                <h6 className="mb-3">
                  <i className="fas fa-image me-2"></i>
                  General Piece Image (Optional)
                </h6>
                <p className="text-muted small mb-3">
                  Upload a technical drawing or image showing the piece dimensions and shape. 
                  This image will be associated with the piece globally and used across all proposals.
                </p>
                
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Image File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    <div className="form-text">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </div>
                  </div>
                  
                  <div className="col-md-8">
                    <label className="form-label">Image Description (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={imageDescription}
                      onChange={(e) => setImageDescription(e.target.value)}
                      placeholder="e.g., Technical drawing, Front view, etc."
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isImagePrimary"
                        checked={isImagePrimary}
                        onChange={(e) => setIsImagePrimary(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isImagePrimary">
                        Set as primary image
                      </label>
                    </div>
                  </div>
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
                disabled={loading || !formData.internal_manufacturer_code}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Create Piece
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

export default PieceCreationModal; 