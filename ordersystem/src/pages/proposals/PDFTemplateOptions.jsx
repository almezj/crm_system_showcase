import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const PDFTemplateOptions = ({
  selectedTemplate,
  setSelectedTemplate,
  templateOptions,
  pdfOptions,
  setPdfOptions,
  imageSizeOptions,
  proposal,
  uploadingImages,
  handleImageUpload,
  handleCustomSectionImageUpload,
  uploadingCustomSectionImages,
  draggedImage,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  editingImageId,
  editingDescription,
  setEditingImageId,
  setEditingDescription,
  handleImageDescriptionUpdate,
  handleImageDelete,
  handleDownloadPDF
}) => (
  <div className="pdf-template-options w-100">
    {/* Template Selection */}
    <div className="card mb-3">
      <div className="card-header">PDF Template Options</div>
      <div className="card-body">
        {/* Template Selection Dropdown */}
        <div className="mb-3 w-100">
          <label htmlFor="templateSelect" className="form-label">Select Template:</label>
          <select
            id="templateSelect"
            className="form-select w-100"
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
          >
            {templateOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        
        {selectedTemplate === "product_summary" && (
          <>
            <div className="mb-3 w-100">
              <label htmlFor="imageSizeSelect" className="form-label">Image Size:</label>
              <select
                id="imageSizeSelect"
                className="form-select w-100"
                value={pdfOptions.imageSize}
                onChange={e => setPdfOptions(opts => ({ ...opts, imageSize: e.target.value }))}
              >
                {imageSizeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {/* Image Selection Section for Product Summary */}
            {proposal.items?.map((item) => (
              <div key={item.proposal_item_id} className="mb-4 w-100">
                <h6>{item.item_name}</h6>
                
                {/* Image Selection Section */}
                <div className="mb-3 w-100">
                  <label className="form-label">Select Image for PDF (Choose 1):</label>
                  <div className="row">
                    {(item.all_images || []).map((image) => (
                      <div 
                        className="col-md-3 mb-3" 
                        key={image.image_id}
                      >
                        <div className="card">
                          <div className="card-header p-2 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="form-check">
                              <input
                                type="radio"
                                className="form-check-input"
                                name={`product_summary_image_${item.proposal_item_id}`}
                                id={`product_summary_image_${image.image_id}`}
                                checked={pdfOptions.selectedProductSummaryImages?.[item.proposal_item_id] === image.image_id}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPdfOptions(opts => ({
                                      ...opts,
                                      selectedProductSummaryImages: {
                                        ...opts.selectedProductSummaryImages,
                                        [item.proposal_item_id]: image.image_id
                                      }
                                    }));
                                  }
                                }}
                              />
                              <label className="form-check-label small" htmlFor={`product_summary_image_${image.image_id}`}>
                                {image.is_uploaded ? 'Uploaded' : (image.is_primary ? 'Primary Product' : 'Product')}
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
                
                {/* Image Upload */}
                <div className="mb-3 w-100">
                  <label className="form-label">Upload Additional Images:</label>
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
                
                {/* Custom Description for PDF */}
                <div className="mb-3 w-100">
                  <label className="form-label">Custom Description for PDF:</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter a custom description for this product in the PDF (optional)..."
                    value={pdfOptions.customDescriptions?.[`item_${item.proposal_item_id}`] || item.custom_description || ''}
                    onChange={(e) => setPdfOptions(opts => ({
                      ...opts,
                      customDescriptions: {
                        ...opts.customDescriptions,
                        [`item_${item.proposal_item_id}`]: e.target.value
                      }
                    }))}
                  />
                  <small className="form-text text-muted">
                    This description will appear in the PDF for this specific product. Leave empty to use the default description or hide it.
                  </small>
                </div>
              </div>
            ))}
            
            {/* Additional Information Section */}
            <div className="mb-4 w-100">
              <h6>Additional Information</h6>
              <div className="mb-3">
                <label htmlFor="additionalInfo" className="form-label">
                  Additional Information for PDF:
                </label>
                <textarea
                  id="additionalInfo"
                  className="form-control"
                  rows="4"
                  placeholder="Enter additional information that will appear in the 'Doplňující informace' section of the PDF..."
                  value={pdfOptions.additionalInformation || ''}
                  onChange={(e) => setPdfOptions(opts => ({ 
                    ...opts, 
                    additionalInformation: e.target.value 
                  }))}
                />
                <small className="form-text text-muted">
                  This text will appear in the "Doplňující informace" section. Leave empty to hide the section.
                </small>
              </div>
            </div>
            
            {/* Custom Sections */}
            <div className="mb-4 w-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Custom Sections</h6>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    const newSection = {
                      id: Date.now(),
                      title: '',
                      images: []
                    };
                    setPdfOptions(opts => ({
                      ...opts,
                      customSections: [...(opts.customSections || []), newSection]
                    }));
                  }}
                >
                  <i className="fas fa-plus me-1"></i> Add Section
                </button>
              </div>
              
              {(pdfOptions.customSections || []).map((section, sectionIndex) => (
                <div key={section.id} className="card mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ width: '300px' }}
                      placeholder="Section title"
                      value={section.title}
                      onChange={(e) => {
                        const updatedSections = [...(pdfOptions.customSections || [])];
                        updatedSections[sectionIndex].title = e.target.value;
                        setPdfOptions(opts => ({
                          ...opts,
                          customSections: updatedSections
                        }));
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        const updatedSections = (pdfOptions.customSections || []).filter((_, index) => index !== sectionIndex);
                        setPdfOptions(opts => ({
                          ...opts,
                          customSections: updatedSections
                        }));
                      }}
                    >
                      <i className="fas fa-trash me-1"></i> Remove
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label small">Images (Max 2):</label>
                      <div className="row">
                        {section.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="col-md-6 mb-2">
                            <div className="card">
                              <div className="card-body p-2">
                                <img
                                  src={image.url.startsWith('blob:') ? image.url : getImageUrl(image.url)}
                                  alt="Custom section image"
                                  className="img-fluid mb-2"
                                  style={{ maxHeight: '100px', objectFit: 'cover' }}
                                />
                                <input
                                  type="text"
                                  className="form-control form-control-sm mb-2"
                                  placeholder="Image description (optional)"
                                  value={image.description || ''}
                                  onChange={(e) => {
                                    const updatedSections = [...(pdfOptions.customSections || [])];
                                    updatedSections[sectionIndex].images[imageIndex].description = e.target.value;
                                    setPdfOptions(opts => ({
                                      ...opts,
                                      customSections: updatedSections
                                    }));
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm w-100"
                                  onClick={() => {
                                    const updatedSections = [...(pdfOptions.customSections || [])];
                                    updatedSections[sectionIndex].images.splice(imageIndex, 1);
                                    setPdfOptions(opts => ({
                                      ...opts,
                                      customSections: updatedSections
                                    }));
                                  }}
                                >
                                  Remove Image
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {section.images.length < 2 && (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleCustomSectionImageUpload(sectionIndex, file);
                              }
                            }}
                            className="form-control"
                            disabled={uploadingCustomSectionImages[sectionIndex]}
                          />
                          {uploadingCustomSectionImages[sectionIndex] && (
                            <div className="mt-2 text-center">
                              <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Uploading...</span>
                              </div>
                              <small className="text-muted ms-2">Uploading image...</small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {selectedTemplate === "image_proposal" && (
          <div className="mb-3 d-flex align-items-center w-100">
            <input
              type="checkbox"
              id="showCustomerInfo"
              checked={pdfOptions.showCustomerInfo}
              onChange={e => setPdfOptions(opts => ({ ...opts, showCustomerInfo: e.target.checked }))}
              className="form-check-input me-2"
            />
            <label htmlFor="showCustomerInfo" className="form-label mb-0 w-100">Show Customer Info</label>
          </div>
        )}
        
        {selectedTemplate === "upgraded_image_proposal" && (
          <div className="mb-3 d-flex align-items-center w-100">
            <input
              type="checkbox"
              id="showCustomerInfoUpgraded"
              checked={pdfOptions.showCustomerInfo}
              onChange={e => setPdfOptions(opts => ({ ...opts, showCustomerInfo: e.target.checked }))}
              className="form-check-input me-2"
            />
            <label htmlFor="showCustomerInfoUpgraded" className="form-label mb-0 w-100">Show Customer Info</label>
          </div>
        )}
        
        {/* Image Management Section - Only for Image Proposal */}
        {(selectedTemplate === "image_proposal" || selectedTemplate === "upgraded_image_proposal") && (
          <>
            {proposal.items?.map((item) => (
              <div key={item.proposal_item_id} className="mb-4 w-100">
                <h6>{item.item_name}</h6>
                
                {/* Image Selection Section */}
                <div className="mb-3 w-100">
                  <label className="form-label">Select Images for PDF:</label>
                  <div className="row">
                    {(item.all_images || []).map((image) => (
                      <div 
                        className="col-md-3 mb-3" 
                        key={image.image_id}
                      >
                        <div className="card">
                          <div className="card-header p-2 text-center" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`image_${image.image_id}`}
                                checked={Array.isArray(pdfOptions.selectedImages?.[item.proposal_item_id])
                                  ? pdfOptions.selectedImages[item.proposal_item_id].includes(image.image_id)
                                  : false}
                                onChange={(e) => {
                                  const currentSelected = pdfOptions.selectedImages?.[item.proposal_item_id] || [];
                                  const newSelected = e.target.checked
                                    ? [...currentSelected, image.image_id]
                                    : currentSelected.filter(id => id !== image.image_id);
                                  
                                  setPdfOptions(opts => ({
                                    ...opts,
                                    selectedImages: {
                                      ...opts.selectedImages,
                                      [item.proposal_item_id]: newSelected
                                    }
                                  }));
                                }}
                              />
                              <label className="form-check-label small" htmlFor={`image_${image.image_id}`}>
                                {image.is_uploaded ? 'Uploaded' : (image.is_primary ? 'Primary Product' : 'Product')}
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
                
                {/* Image Upload */}
                <div className="mb-3 w-100">
                  <label className="form-label">Upload Additional Images:</label>
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
            ))}
          </>
        )}
        
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
      </div>
    </div>
    
    {/* Generate PDF Button Full Width Row */}
    <div className="row mt-3">
      <div className="col-12 d-flex justify-content-end">
        <button className="btn btn-outline-primary" onClick={handleDownloadPDF}>
          Generate PDF
        </button>
      </div>
    </div>
  </div>
);

export default PDFTemplateOptions; 