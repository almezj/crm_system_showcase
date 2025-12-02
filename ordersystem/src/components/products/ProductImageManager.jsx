import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const ProductImageManager = ({ 
  images, 
  pendingImages, 
  uploading, 
  error, 
  onImageUpload, 
  onDeleteImage, 
  onSetPrimaryImage, 
  onSetPrimaryPendingImage 
}) => {
  return (
    <div className="mb-4">
      <h4>Product Images</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="mb-3">
        <label htmlFor="imageUpload" className="form-label">
          Upload Images
        </label>
        <input
          type="file"
          className="form-control"
          id="imageUpload"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={onImageUpload}
          disabled={uploading}
        />
        <div className="form-text">
          Supported formats: JPG, JPEG, PNG, WEBP (max 5MB each)
        </div>
        {uploading && <div className="text-muted mt-2">Uploading...</div>}
      </div>

      <div className="row">
        {/* Display existing images if editing */}
        {images.map((image) => (
          <div key={image.product_image_id} className="col-md-3 mb-3">
            <div className="card">
              <img
                src={getImageUrl(image.image_url)}
                className="card-img-top"
                alt="Product"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                {(image.is_primary === '1' || image.is_primary === true) && (
                  <span className="badge bg-success">Primary</span>
                )}
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      (image.is_primary === '1' || image.is_primary === true) ? "btn-success" : "btn-outline-secondary"
                    }`}
                    onClick={() => onSetPrimaryImage(image.product_image_id)}
                    disabled={image.is_primary === '1' || image.is_primary === true}
                  >
                    {(image.is_primary === '1' || image.is_primary === true) ? "Primary" : "Set as Primary"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteImage(image.product_image_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Display pending images if creating new product */}
        {pendingImages.map((image, index) => (
          <div key={index} className="col-md-3 mb-3">
            <div className="card">
              <img
                src={image.preview}
                className="card-img-top"
                alt="Product"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                {(image.is_primary === '1' || image.is_primary === true) && (
                  <span className="badge bg-success">Primary</span>
                )}
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      (image.is_primary === '1' || image.is_primary === true) ? "btn-success" : "btn-outline-secondary"
                    }`}
                    onClick={() => onSetPrimaryPendingImage(index)}
                    disabled={image.is_primary === '1' || image.is_primary === true}
                  >
                    {(image.is_primary === '1' || image.is_primary === true) ? "Primary" : "Set as Primary"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onDeleteImage(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageManager;
