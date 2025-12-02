import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Image, Badge, Modal, Form } from 'react-bootstrap';
import * as pieceImageActions from '../redux/pieceImages/actions';
import { getImageUrl } from '../utils/imageUtils';

const PieceImageUpload = ({ pieceId, onImageChange }) => {
  const dispatch = useDispatch();
  const { images, loading } = useSelector((state) => state.pieceImages);
  const pieceImages = images[pieceId] || [];
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (pieceId) {
      dispatch(pieceImageActions.fetchPieceImagesRequest(pieceId));
    }
  }, [dispatch, pieceId]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-set as primary if this is the first image
      if (pieceImages.length === 0) {
        setIsPrimary(true);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('piece_id', pieceId);
    formData.append('image', selectedFile);
    formData.append('description', description);
    formData.append('is_primary', isPrimary);

    dispatch(pieceImageActions.uploadPieceImageRequest(pieceId, formData));
    
    // Reset form
    setSelectedFile(null);
    setDescription('');
    setIsPrimary(false);
    setShowUploadModal(false);
  };

  const handleDelete = (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      dispatch(pieceImageActions.deletePieceImageRequest(imageId));
    }
  };

  const handleSetPrimary = (imageId) => {
    dispatch(pieceImageActions.setPrimaryPieceImageRequest(imageId));
  };

  return (
    <div className="piece-image-upload">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Piece Images</h6>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => setShowUploadModal(true)}
          disabled={loading}
        >
          <i className="fas fa-upload me-2"></i>
          Upload Image
        </Button>
      </div>

      {/* Image Gallery */}
      <div className="image-gallery">
        {pieceImages.length > 0 ? (
          <div className="row g-3">
            {pieceImages.map((image) => (
              <div key={image.piece_image_id} className="col-12 col-md-6">
                <Card className="image-card h-100 shadow-sm border-0">
                  <div className="image-container position-relative" style={{ height: '250px', overflow: 'hidden' }}>
                    <Image 
                      src={getImageUrl(image.image_url)}
                      alt={image.description || 'Piece image'}
                      className="w-100 h-100"
                      style={{ objectFit: 'contain' }}
                    />
                    <div className="image-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-3" 
                         style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <div className="d-flex justify-content-between align-items-start w-100">
                        <Badge 
                          bg={image.is_primary ? "warning" : "secondary"}
                          className="primary-badge"
                        >
                          {image.is_primary ? "Primary" : "Secondary"}
                        </Badge>
                        <div className="action-buttons d-flex gap-2">
                          {!image.is_primary && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleSetPrimary(image.piece_image_id)}
                              disabled={loading}
                              title="Set as primary"
                              className="btn-sm"
                            >
                              <i className="fas fa-star"></i>
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(image.piece_image_id)}
                            disabled={loading}
                            title="Delete image"
                            className="btn-sm"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {image.description && (
                    <Card.Body className="py-3 px-3">
                      <small className="text-muted d-block text-truncate" title={image.description}>
                        {image.description}
                      </small>
                    </Card.Body>
                  )}
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">No images uploaded yet</p>
            <Button 
              variant="outline-primary" 
              onClick={() => setShowUploadModal(true)}
            >
              <i className="fas fa-upload me-2"></i>
              Upload First Image
            </Button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Piece Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Image File</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                required
              />
              <Form.Text className="text-muted">
                Supported formats: JPG, JPEG, PNG, WEBP. Max size: 5MB
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Technical drawing, Front view, etc."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Set as primary image"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Primary images are used in PDFs and as the main display image
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={!selectedFile || loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .piece-image-upload {
          margin-bottom: 1rem;
        }
        
        .image-card {
          position: relative;
          transition: transform 0.2s;
        }
        
        .image-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
        }
        
        .piece-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          opacity: 0;
          transition: opacity 0.2s;
          padding: 0.5rem;
        }
        
        .image-container:hover .image-overlay {
          opacity: 1;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.25rem;
        }
        
        .primary-badge {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default PieceImageUpload; 