import React, { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../../utils/imageUtils';
import './CleanProposalPDFOptions.css';

const CleanProposalPDFOptions = ({
  proposal,
  pdfOptions,
  setPdfOptions,
  uploadingImages,
  handleImageUpload,
  editingImageId,
  editingDescription,
  setEditingImageId,
  setEditingDescription,
  handleImageDescriptionUpdate,
  handleImageDelete,
  handleDownloadPDF,
  templateType = "clean_proposal"
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const initializedRef = useRef(null);

  // Determine the options key based on template type
  const optionsKey = templateType === "pretty_proposal" ? "prettyProposalOptions" : "cleanProposalOptions";

  // Default field options for each section
  const defaultProductInfoFields = [
    { key: 'name', label: 'Product Name', default: true },
    { key: 'description', label: 'Description', default: true },
    { key: 'price', label: 'Total Price', default: true },
    { key: 'quantity', label: 'Quantity', default: true },
    { key: 'unit_price', label: 'Unit Price', default: false }
  ];

  const defaultPieceInfoFields = [
    { key: 'name', label: 'Piece Name', default: true },
    { key: 'description', label: 'Description', default: true },
    { key: 'price', label: 'Price', default: true },
    { key: 'code', label: 'Manufacturer Code', default: false },
    { key: 'dimensions', label: 'Dimensions', default: false }
  ];

  const defaultMaterialInfoFields = [
    { key: 'name', label: 'Material Name', default: true },
    { key: 'color', label: 'Color', default: true },
    { key: 'finish', label: 'Finish', default: true },
    { key: 'thickness', label: 'Thickness', default: false },
    { key: 'price', label: 'Price', default: false }
  ];

  // Initialize options if not set
  useEffect(() => {
    // Check if we need to initialize options for the current key
    const currentOptions = pdfOptions[optionsKey];
    const needsInitialization = !currentOptions;
    const isDifferentKey = initializedRef.current !== optionsKey;
    
    // If options don't exist for this key, initialize them
    if (needsInitialization) {
      initializedRef.current = optionsKey;
      setPdfOptions(prev => ({
        ...prev,
        [optionsKey]: {
          showProductImages: true,
          showProductInfo: true,
          showPieces: true,
          showPieceImages: true,
          showPieceInfo: true,
          showMaterials: true,
          showMaterialImages: true,
          showMaterialInfo: true,
          selectedProductInfoFields: defaultProductInfoFields.filter(f => f.default).map(f => f.key),
          selectedPieceInfoFields: defaultPieceInfoFields.filter(f => f.default).map(f => f.key),
          selectedMaterialInfoFields: defaultMaterialInfoFields.filter(f => f.default).map(f => f.key),
          selectedProductImages: {},
          selectedPieceImages: {},
          selectedMaterialImages: {},
          customDescriptions: {}
        }
      }));
    } else if (isDifferentKey) {
      // Mark as initialized for this key if options already exist
      initializedRef.current = optionsKey;
    }
  }, [pdfOptions[optionsKey], optionsKey, setPdfOptions]);

  // Show loading if options not initialized yet
  if (!pdfOptions[optionsKey]) {
    return <div>Loading options...</div>;
  }

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleFieldToggle = (section, fieldKey) => {
    const currentFields = pdfOptions[optionsKey][`selected${section}Fields`] || [];
    const newFields = currentFields.includes(fieldKey)
      ? currentFields.filter(f => f !== fieldKey)
      : [...currentFields, fieldKey];

    setPdfOptions(prev => ({
      ...prev,
      [optionsKey]: {
        ...prev[optionsKey],
        [`selected${section}Fields`]: newFields
      }
    }));
  };

  const handleImageSelection = (type, itemId, imageId, checked) => {
    const currentSelected = pdfOptions[optionsKey][`selected${type}Images`]?.[itemId] || [];
    const newSelected = checked
      ? [...currentSelected, imageId]
      : currentSelected.filter(id => id !== imageId);

    setPdfOptions(prev => ({
      ...prev,
      [optionsKey]: {
        ...prev[optionsKey],
        [`selected${type}Images`]: {
          ...prev[optionsKey][`selected${type}Images`],
          [itemId]: newSelected
        }
      }
    }));
  };

  const handlePrimaryImageSelection = (itemId, imageId) => {
    const currentSelected = pdfOptions[optionsKey].selectedProductImages?.[itemId] || [];
    const currentPrimary = currentSelected[0] || null;
    
    // If clicking the same primary image, do nothing
    if (currentPrimary === imageId) {
      return;
    }
    
    // Remove imageId from secondary if it exists there
    const secondaryImages = currentSelected.slice(1, 4);
    const newSecondary = secondaryImages.filter(id => id !== imageId);
    
    // If there was a previous primary, add it to secondary (if there's room)
    let finalSecondary = newSecondary;
    if (currentPrimary && currentPrimary !== imageId && finalSecondary.length < 3) {
      finalSecondary = [...finalSecondary, currentPrimary];
    }
    
    // Set new primary as first, then secondary images
    const newSelected = [imageId, ...finalSecondary];

    setPdfOptions(prev => ({
      ...prev,
      [optionsKey]: {
        ...prev[optionsKey],
        selectedProductImages: {
          ...prev[optionsKey].selectedProductImages,
          [itemId]: newSelected
        }
      }
    }));
  };

  const handleSecondaryImageSelection = (itemId, imageId, checked) => {
    const currentSelected = pdfOptions[optionsKey].selectedProductImages?.[itemId] || [];
    const primaryImage = currentSelected[0] || null;
    const secondaryImages = currentSelected.slice(1, 4);

    // Don't allow selecting primary image as secondary
    if (checked && primaryImage === imageId) {
      return;
    }

    let newSecondary;
    if (checked) {
      // Add to secondary (max 3)
      if (secondaryImages.length < 3 && !secondaryImages.includes(imageId)) {
        newSecondary = [...secondaryImages, imageId];
      } else {
        newSecondary = secondaryImages; // Already at max or already selected
      }
    } else {
      // Remove from secondary
      newSecondary = secondaryImages.filter(id => id !== imageId);
    }

    // Reconstruct array: primary first, then secondary
    const newSelected = primaryImage 
      ? [primaryImage, ...newSecondary]
      : newSecondary;

    setPdfOptions(prev => ({
      ...prev,
      [optionsKey]: {
        ...prev[optionsKey],
        selectedProductImages: {
          ...prev[optionsKey].selectedProductImages,
          [itemId]: newSelected
        }
      }
    }));
  };

  const handleCustomDescription = (imageType, imageId, description) => {
    setPdfOptions(prev => ({
      ...prev,
      [optionsKey]: {
        ...prev[optionsKey],
        customDescriptions: {
          ...prev[optionsKey].customDescriptions,
          [`${imageType}_${imageId}`]: description
        }
      }
    }));
  };

  const renderImageSelection = (type, itemId, images, title) => {
    if (!images || images.length === 0) return null;

    return (
      <div className="mb-3">
        <label className="form-label fw-bold">{title}:</label>
        <div className="row">
          {images.map((image) => (
            <div className="col-md-3 mb-3" key={image.image_id}>
              <div className="card">
                <div className="card-header p-2 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`${type}_${image.image_id}`}
                      checked={pdfOptions[optionsKey][`selected${type}Images`]?.[itemId]?.includes(image.image_id) || false}
                      onChange={(e) => handleImageSelection(type, itemId, image.image_id, e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor={`${type}_${image.image_id}`}>
                      {image.is_uploaded ? 'Uploaded' : (image.is_primary ? 'Primary' : 'Product')}
                    </label>
                  </div>
                </div>
                <img
                  src={getImageUrl(image.image_url)}
                  className="card-img-top"
                  alt="Product"
                  style={{ height: '150px', objectFit: 'cover' }}
                />
                <div className="card-body p-2">
                  <p className="card-text small mb-1">
                    {image.description || 'No description'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProductImageSelection = (itemId, images) => {
    if (!images || images.length === 0) return null;

    const selectedImages = pdfOptions[optionsKey].selectedProductImages?.[itemId] || [];
    const primaryImageId = selectedImages[0] || null;
    const secondaryImageIds = selectedImages.slice(1, 4); // Max 3 secondary

    const renderImageCard = (image, isPrimarySection = false, isSecondarySection = false) => {
      const isSelectedAsPrimary = primaryImageId === image.image_id;
      const isSelectedAsSecondary = secondaryImageIds.includes(image.image_id);
      const isSelected = isSelectedAsPrimary || isSelectedAsSecondary;

      return (
        <div className="col-md-3 mb-3" key={`${image.image_id}_${isPrimarySection ? 'primary' : 'secondary'}`}>
          <div className={`card ${isSelected ? 'border-primary' : ''}`} style={isSelected ? { borderWidth: '2px' } : {}}>
            <div className="card-header p-2 text-center" style={{ backgroundColor: '#f8f9fa' }}>
              {isPrimarySection ? (
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name={`primary_image_${itemId}`}
                    id={`primary_${image.image_id}`}
                    checked={isSelectedAsPrimary}
                    onChange={() => handlePrimaryImageSelection(itemId, image.image_id)}
                  />
                  <label className="form-check-label small fw-bold text-primary" htmlFor={`primary_${image.image_id}`}>
                    Primary Image
                  </label>
                </div>
              ) : (
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`secondary_${image.image_id}`}
                    checked={isSelectedAsSecondary}
                    disabled={isSelectedAsPrimary || (!isSelectedAsSecondary && secondaryImageIds.length >= 3)}
                    onChange={(e) => handleSecondaryImageSelection(itemId, image.image_id, e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor={`secondary_${image.image_id}`}>
                    {isSelectedAsSecondary ? `Secondary ${secondaryImageIds.indexOf(image.image_id) + 1}` : 'Secondary'}
                    {isSelectedAsPrimary && (
                      <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>(Selected as Primary)</span>
                    )}
                    {!isSelectedAsSecondary && !isSelectedAsPrimary && secondaryImageIds.length >= 3 && (
                      <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>(Max 3 selected)</span>
                    )}
                  </label>
                </div>
              )}
            </div>
            <img
              src={getImageUrl(image.image_url)}
              className="card-img-top"
              alt="Product"
              style={{ height: '150px', objectFit: 'cover' }}
            />
            <div className="card-body p-2">
              <p className="card-text small mb-1">
                {image.description || 'No description'}
              </p>
              {isSelectedAsPrimary && (
                <span className="badge bg-primary">Primary</span>
              )}
              {isSelectedAsSecondary && (
                <span className="badge bg-secondary">Secondary {secondaryImageIds.indexOf(image.image_id) + 1}</span>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="mb-4">
        {/* Primary Image Section */}
        <div className="mb-4">
          <label className="form-label fw-bold text-primary">
            Primary Image <span className="text-muted fw-normal">(choose 1 - will appear large)</span>
          </label>
          <div className="row">
            {images.map((image) => renderImageCard(image, true, false))}
          </div>
        </div>

        {/* Secondary Images Section */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            Secondary Images <span className="text-muted fw-normal">(choose up to 3 - will appear small below primary)</span>
          </label>
          <div className="row">
            {images.map((image) => renderImageCard(image, false, true))}
          </div>
        </div>
      </div>
    );
  };

  const renderFieldSelection = (section, fields, title) => {
    return (
      <div className="mb-3">
        <label className="form-label fw-bold">{title}:</label>
        <div className="row">
          {fields.map((field) => (
            <div className="col-md-6 mb-2" key={field.key}>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`${section}_${field.key}`}
                  checked={pdfOptions[optionsKey][`selected${section}Fields`]?.includes(field.key) || false}
                  onChange={() => handleFieldToggle(section, field.key)}
                />
                <label className="form-check-label" htmlFor={`${section}_${field.key}`}>
                  {field.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="clean-proposal-pdf-options w-100">
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{templateType === "pretty_proposal" ? "Pretty Proposal PDF Customization" : "Clean Proposal PDF Customization"}</h5>
          <small className="text-muted">Customize what appears in your PDF output</small>
        </div>
        <div className="card-body">
          {/* Global Section Toggles */}
          <div className="mb-4">
            <h6>Section Visibility</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="showProductImages"
                                checked={pdfOptions[optionsKey].showProductImages}
            onChange={(e) => setPdfOptions(prev => ({
              ...prev,
              [optionsKey]: {
                ...prev[optionsKey],
                showProductImages: e.target.checked
              }
            }))}
                  />
                  <label className="form-check-label" htmlFor="showProductImages">
                    Show Product Images
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="showProductInfo"
                                checked={pdfOptions[optionsKey].showProductInfo}
            onChange={(e) => setPdfOptions(prev => ({
              ...prev,
              [optionsKey]: {
                ...prev[optionsKey],
                showProductInfo: e.target.checked
              }
            }))}
                  />
                  <label className="form-check-label" htmlFor="showProductInfo">
                    Show Product Information
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="showPieces"
                                checked={pdfOptions[optionsKey].showPieces}
            onChange={(e) => setPdfOptions(prev => ({
              ...prev,
              [optionsKey]: {
                ...prev[optionsKey],
                showPieces: e.target.checked
              }
            }))}
                  />
                  <label className="form-check-label" htmlFor="showPieces">
                    Show Pieces Section
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="showPieceImages"
                                checked={pdfOptions[optionsKey].showPieceImages}
            onChange={(e) => setPdfOptions(prev => ({
              ...prev,
              [optionsKey]: {
                ...prev[optionsKey],
                showPieceImages: e.target.checked
              }
            }))}
                  />
                  <label className="form-check-label" htmlFor="showPieceImages">
                    Show Piece Images
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="showPieceInfo"
                                checked={pdfOptions[optionsKey].showPieceInfo}
            onChange={(e) => setPdfOptions(prev => ({
              ...prev,
              [optionsKey]: {
                ...prev[optionsKey],
                showPieceInfo: e.target.checked
              }
            }))}
                  />
                  <label className="form-check-label" htmlFor="showPieceInfo">
                    Show Piece Information
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="showMaterials"
                                checked={pdfOptions[optionsKey].showMaterials}
            onChange={(e) => setPdfOptions(prev => ({
              ...prev,
              [optionsKey]: {
                ...prev[optionsKey],
                showMaterials: e.target.checked
              }
            }))}
                  />
                  <label className="form-check-label" htmlFor="showMaterials">
                    Show Materials Section
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Sections */}
          {proposal.items?.map((item, itemIndex) => (
            <div key={item.proposal_item_id} className="mb-4 border rounded p-3">
              <div 
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => toggleSection(`product_${item.proposal_item_id}`)}
                style={{ cursor: 'pointer' }}
              >
                <h6 className="mb-0">Product: {item.item_name}</h6>
                <i className={`fas fa-chevron-${expandedSections[`product_${item.proposal_item_id}`] ? 'up' : 'down'}`}></i>
              </div>

              {expandedSections[`product_${item.proposal_item_id}`] && (
                <div className="mt-3">
                  {/* Product Images */}
                  {pdfOptions[optionsKey].showProductImages && (
                    <div className="mb-3">
                      {templateType === "pretty_proposal" 
                        ? renderProductImageSelection(item.proposal_item_id, item.all_images)
                        : renderImageSelection('Product', item.proposal_item_id, item.all_images, 'Product Images')
                      }
                      
                      {/* Image Upload */}
                      <div className="mb-3">
                        <label className="form-label">Upload Additional Product Images:</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(item.proposal_item_id, e.target.files)}
                          disabled={uploadingImages[item.proposal_item_id]}
                          className="form-control"
                        />
                        {uploadingImages[item.proposal_item_id] && (
                          <small className="text-muted">Uploading...</small>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Product Information Fields */}
                  {pdfOptions[optionsKey].showProductInfo && (
                    renderFieldSelection('ProductInfo', defaultProductInfoFields, 'Product Information Fields')
                  )}

                  {/* Pieces Section */}
                  {pdfOptions[optionsKey].showPieces && item.pieces && item.pieces.length > 0 && (
                    <div className="mb-3">
                      <h6>Pieces</h6>
                      {item.pieces.map((piece, pieceIndex) => (
                        <div key={piece.piece_id || pieceIndex} className="mb-3 border-start border-3 ps-3">
                          <h6 className="text-muted">{piece.internal_manufacturer_code || piece.name || `Piece ${pieceIndex + 1}`}</h6>
                          
                          {/* Piece Images */}
                          {pdfOptions[optionsKey].showPieceImages && (
                            <div className="mb-3">
                              {renderImageSelection('Piece', piece.piece_id || pieceIndex, piece.proposal_images || piece.images, 'Piece Images')}
                            </div>
                          )}

                          {/* Piece Information Fields */}
                          {pdfOptions[optionsKey].showPieceInfo && (
                            renderFieldSelection('PieceInfo', defaultPieceInfoFields, 'Piece Information Fields')
                          )}

                          {/* Materials Section */}
                          {pdfOptions[optionsKey].showMaterials && piece.materials && piece.materials.length > 0 && (
                            <div className="mb-3">
                              <h6>Materials</h6>
                              {piece.materials.map((material, materialIndex) => (
                                <div key={material.material_id || materialIndex} className="mb-2 border-start border-2 ps-2">
                                  <h6 className="text-muted small">{material.name}</h6>
                                  
                                  {/* Material Images */}
                                  {pdfOptions[optionsKey].showMaterialImages && material.material_image_path && (
                                    <div className="mb-2">
                                      <label className="form-label small">Material Image:</label>
                                      <div className="row">
                                        <div className="col-md-3">
                                          <div className="card">
                                            <img
                                              src={getImageUrl(material.material_image_path)}
                                              className="card-img-top"
                                              alt={material.name}
                                              style={{ height: '100px', objectFit: 'cover' }}
                                            />
                                            <div className="card-body p-2">
                                              <div className="form-check">
                                                <input
                                                  type="checkbox"
                                                  className="form-check-input"
                                                  id={`material_${material.material_id || materialIndex}`}
                                                  checked={pdfOptions[optionsKey].selectedMaterialImages?.[material.material_id || materialIndex]?.includes('main') || false}
                                                  onChange={(e) => handleImageSelection('Material', material.material_id || materialIndex, 'main', e.target.checked)}
                                                />
                                                <label className="form-check-label small" htmlFor={`material_${material.material_id || materialIndex}`}>
                                                  Include in PDF
                                                </label>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Material Information Fields */}
                                  {pdfOptions[optionsKey].showMaterialInfo && (
                                    renderFieldSelection('MaterialInfo', defaultMaterialInfoFields, 'Material Information Fields')
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Description Editing Modal */}
      {editingImageId && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Image Description</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setEditingImageId(null);
                    setEditingDescription('');
                  }}
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
                  onClick={() => {
                    setEditingImageId(null);
                    setEditingDescription('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    handleImageDescriptionUpdate(editingImageId, editingDescription);
                    setEditingImageId(null);
                    setEditingDescription('');
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate PDF Button */}
      <div className="row mt-3">
        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            Generate Clean Proposal PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleanProposalPDFOptions; 