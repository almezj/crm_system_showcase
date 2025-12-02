import React, { useState } from 'react';
import MaterialAutocomplete from '../MaterialAutocomplete';
import MaterialImageUpload from '../MaterialImageUpload';

const PieceForm = ({ 
  newPiece, 
  setNewPiece, 
  onAddPiece, 
  onCancel, 
  onMaterialSelect, 
  onPendingMaterialImageChange, 
  onRemovePendingMaterialImage 
}) => {
  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
      <h4 className="fw-bold mb-3">Add New Piece</h4>
      
      {/* Piece Details Section */}
      <div className="mb-4">
        <h5 className="fs-6 fw-semibold text-secondary mb-3 pb-2 border-bottom">Piece Details</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="internal-code">Internal Code *</label>
            <input
              type="text"
              id="internal-code"
              value={newPiece.internal_manufacturer_code}
              onChange={(e) => setNewPiece({...newPiece, internal_manufacturer_code: e.target.value})}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="ean-code">EAN Code</label>
            <input
              type="text"
              id="ean-code"
              value={newPiece.ean_code}
              onChange={(e) => setNewPiece({...newPiece, ean_code: e.target.value})}
              className="form-control"
            />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="qr-code">QR Code</label>
            <input
              type="text"
              id="qr-code"
              value={newPiece.qr_code}
              onChange={(e) => setNewPiece({...newPiece, qr_code: e.target.value})}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="estimated-delivery-date">Estimated Delivery Date</label>
            <input
              type="date"
              id="estimated-delivery-date"
              value={newPiece.estimated_delivery_date}
              onChange={(e) => setNewPiece({...newPiece, estimated_delivery_date: e.target.value})}
              className="form-control"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="form-label" htmlFor="custom-description">Custom Description</label>
          <textarea
            id="custom-description"
            value={newPiece.custom_description}
            onChange={(e) => setNewPiece({...newPiece, custom_description: e.target.value})}
            className="form-control"
            rows="2"
          />
        </div>
      </div>

      {/* Material Details Section */}
      <div className="mb-4">
        <h5 className="fs-6 fw-semibold text-secondary mb-3 pb-2 border-bottom">Material Details</h5>
        <div className="mb-3">
          <label className="form-label">Material Name</label>
          <MaterialAutocomplete
            value={newPiece.material_name}
            onChange={(value) => setNewPiece({...newPiece, material_name: value})}
            onSelect={onMaterialSelect}
            placeholder="Search or type material name..."
          />
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="material-code">Material Code</label>
            <input
              type="text"
              id="material-code"
              value={newPiece.material_code}
              onChange={(e) => setNewPiece({...newPiece, material_code: e.target.value})}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="material-color">Material Color</label>
            <input
              type="text"
              id="material-color"
              value={newPiece.material_color}
              onChange={(e) => setNewPiece({...newPiece, material_color: e.target.value})}
              className="form-control"
            />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="material-type">Material Type</label>
            <input
              type="text"
              id="material-type"
              value={newPiece.material_type}
              onChange={(e) => setNewPiece({...newPiece, material_type: e.target.value})}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="material-style">Material Style</label>
            <input
              type="text"
              id="material-style"
              value={newPiece.material_style}
              onChange={(e) => setNewPiece({...newPiece, material_style: e.target.value})}
              className="form-control"
            />
          </div>
        </div>
        <div className="mt-2">
          <label className="form-label" htmlFor="material-description">Material Description</label>
          <textarea
            id="material-description"
            value={newPiece.material_description}
            onChange={(e) => setNewPiece({...newPiece, material_description: e.target.value})}
            className="form-control"
            rows="2"
          />
        </div>
        
        {/* Material Image Upload */}
        {newPiece.material_id ? (
          <div className="mt-4">
            <p className="text-xs text-muted mb-2">Material ID: {newPiece.material_id}</p>
            <MaterialImageUpload
              materialId={newPiece.material_id}
              onImageUploaded={(image) => {
                console.log('Material image uploaded:', image);
              }}
              onImageDeleted={(imageId) => {
                console.log('Material image deleted:', imageId);
              }}
            />
          </div>
        ) : (
          <div className="mt-4">
            <label className="form-label mb-1" htmlFor="material-image">Material Image</label>
            {newPiece.pendingMaterialImage ? (
              <div className="d-flex align-items-center gap-3">
                <img
                  src={URL.createObjectURL(newPiece.pendingMaterialImage)}
                  alt="Preview"
                  className="rounded border"
                  style={{ height: '80px', width: '80px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={onRemovePendingMaterialImage}
                  className="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                type="file"
                id="material-image"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={onPendingMaterialImageChange}
                className="form-control mt-1"
              />
            )}
            <div className="form-text mt-1">You can upload an image for a new material before saving.</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-3">
        <button
          type="button"
          onClick={onAddPiece}
          className="btn btn-success"
        >
          Add Piece
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PieceForm;
