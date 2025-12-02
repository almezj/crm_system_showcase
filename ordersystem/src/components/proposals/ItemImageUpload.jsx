import React, { useState } from 'react';
import { useDropzone } from "react-dropzone";
import { getImageUrl } from "../../utils/imageUtils";

const ItemImageUpload = ({ 
  item, 
  index, 
  onDrop, 
  onRemoveImage,
  onReorderImages,
  onUpdateImageDescription
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(index, acceptedFiles),
  });

  const handleDragStart = (e, imageIndex) => {
    setDraggedIndex(imageIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(targetIndex);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex && onReorderImages) {
      onReorderImages(index, draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleEditDescription = (imageIndex) => {
    const image = item.images[imageIndex];
    setEditingImageIndex(imageIndex);
    setEditingDescription(image.description || '');
  };

  const handleSaveDescription = () => {
    if (editingImageIndex !== null && onUpdateImageDescription) {
      onUpdateImageDescription(index, editingImageIndex, editingDescription);
    }
    setEditingImageIndex(null);
    setEditingDescription('');
  };

  const handleCancelEdit = () => {
    setEditingImageIndex(null);
    setEditingDescription('');
  };

  return (
    <>
      {/* Drag-and-Drop Image Upload */}
      <label className="form-label">Images</label>
      <div
        {...getRootProps()}
        className="border p-3 text-center"
        style={{ cursor: "pointer", minHeight: "100px" }}
      >
        <input {...getInputProps()} />
        Drag and drop images here, or click to select files.
      </div>
      
      {/* Image Previews */}
      <div className="mt-3 d-flex flex-wrap gap-3" style={{ rowGap: '16px', columnGap: '16px' }}>
        {item.images.map((image, imageIndex) => (
          <div
            key={imageIndex}
            className="position-relative d-flex flex-column align-items-center shadow-sm"
            style={{
              width: '120px',
              minHeight: '180px',
              border: dragOverIndex === imageIndex ? '3px dashed #007bff' : '1px solid #ddd',
              borderRadius: '8px',
              background: dragOverIndex === imageIndex ? '#e3f2fd' : '#fafbfc',
              padding: '8px',
              boxSizing: 'border-box',
              position: 'relative',
              opacity: draggedIndex === imageIndex ? 0.5 : 1,
              transform: draggedIndex === imageIndex ? 'rotate(5deg)' : 'none',
              transition: 'all 0.2s ease',
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, imageIndex)}
            onDragOver={(e) => handleDragOver(e, imageIndex)}
            onDrop={(e) => handleDrop(e, imageIndex)}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
          >
            {/* Drag handle */}
            <div
              style={{
                width: '100%',
                height: '24px',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
                fontSize: '0.9rem',
                borderBottom: '1px dashed #ccc',
                marginBottom: '4px',
                userSelect: 'none',
              }}
            >
              <span role="img" aria-label="drag">↕️</span> Drag
            </div>
            <img
              src={image.preview || getImageUrl(image.image_url)}
              alt="Preview"
              style={{
                width: '100%',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '6px',
              }}
            />
            <div style={{ fontSize: '0.95rem', color: '#333', marginBottom: '6px', textAlign: 'center', wordBreak: 'break-word', minHeight: '20px' }}>
              {image.description || <span style={{ color: '#aaa' }}>No description</span>}
            </div>
            <div className="d-flex justify-content-center gap-2 w-100">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm me-1"
                style={{ minWidth: '40px', fontSize: '0.85rem', padding: '2px 6px' }}
                onClick={() => handleEditDescription(imageIndex)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                style={{ minWidth: '40px', fontSize: '0.85rem', padding: '2px 6px' }}
                onClick={() => onRemoveImage(index, imageIndex)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Description Modal */}
      {editingImageIndex !== null && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Image Description</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelEdit}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="form-control"
                  placeholder="Image description"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveDescription}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemImageUpload;
