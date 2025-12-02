import React from 'react';

const PieceImage = ({ piece }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_IMAGE_BASE_URL || ''}${imagePath}`;
  };

  // Get primary image (piece image or first material image)
  const getPrimaryImage = () => {
    // First priority: piece images (same as product details page)
    if (piece.images && piece.images.length > 0) {
      const primaryImage = piece.images.find(img => img.is_primary) || piece.images[0];
      return getImageUrl(primaryImage.image_url);
    }
    
    // Second priority: proposal-specific piece images
    if (piece.proposal_images && piece.proposal_images.length > 0) {
      const primaryImage = piece.proposal_images.find(img => img.is_primary) || piece.proposal_images[0];
      return getImageUrl(primaryImage.image_url);
    }
    
    // Last priority: material images (only if no piece images available)
    if (piece.materials && piece.materials.length > 0) {
      const firstMaterial = piece.materials[0];
      return getImageUrl(firstMaterial.material_image_path);
    }
    
    return null;
  };

  const primaryImage = getPrimaryImage();

  return (
    <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa' }}>
      {primaryImage ? (
        <img
          src={primaryImage}
          alt={`${piece.internal_manufacturer_code || 'Piece'} image`}
          className="rounded border"
          style={{ 
            height: '60px', 
            width: '60px', 
            objectFit: 'cover',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : (
        <div 
          className="d-flex align-items-center justify-content-center rounded border mx-auto"
          style={{ 
            height: '60px', 
            width: '60px',
            backgroundColor: '#e9ecef'
          }}
        >
          <i className="fas fa-cube text-muted" style={{ fontSize: '1.5rem' }}></i>
        </div>
      )}
    </div>
  );
};

export default PieceImage;
