import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProductRequest, updateProductRequest } from "../../redux/products/actions";
import { fetchManufacturersRequest } from "../../redux/manufacturers/actions";
import { fetchLanguagesRequest } from "../../redux/languages/actions";
import axios from "../../services/axiosInstance";
import { getImageUrl } from "../../utils/imageUtils";
import CarelliItemSelector from "../../components/CarelliItemSelector";

const MultilingualProductForm = ({ product, manufacturers, onSubmit, onSuccess }) => {
  const dispatch = useDispatch();
  const { languages } = useSelector((state) => state.languages);
  
  const [formData, setFormData] = useState({
    manufacturer_id: "",
    is_customizable: false,
  });
  
  const [translations, setTranslations] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [images, setImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchManufacturersRequest());
    dispatch(fetchLanguagesRequest());
  }, [dispatch]);

  useEffect(() => {
    if (product) {
      setFormData({
        manufacturer_id: product.manufacturer_id || "",
        is_customizable: product.is_customizable || false,
      });
      
      // Set translations if they exist
      if (product.translations) {
        setTranslations(product.translations);
      }
      
      // Load existing images if editing
      if (product.product_id) {
        loadProductImages(product.product_id);
      }
      
      // Load existing metadata if editing
      if (product.product_id) {
        loadProductMetadata(product.product_id);
      }
    }
  }, [product]);

  const loadProductImages = async (productId) => {
    try {
      const response = await axios.get(`products/${productId}/images`);
      setImages(response.data);
    } catch (err) {
      console.error("Error loading product images:", err);
    }
  };

  const loadProductMetadata = async (productId) => {
    try {
      const response = await axios.get(`products/${productId}/metadata`);
      setMetadata(response.data);
    } catch (err) {
      console.error("Error loading product metadata:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCarelliItemSelect = (selectedItem, translationIndex) => {
    const newTranslations = [...translations];
    if (selectedItem) {
      newTranslations[translationIndex] = {
        ...newTranslations[translationIndex],
        web_id: selectedItem.item_id,
        name: selectedItem.title,
        description: selectedItem.text || selectedItem.description || '',
        base_price: selectedItem.price || 0,
        language_id: selectedItem.language_id
      };
    } else {
      // Clear the web_id if no item is selected
      const { web_id, ...rest } = newTranslations[translationIndex];
      newTranslations[translationIndex] = rest;
    }
    setTranslations(newTranslations);
  };

  const handleTranslationChange = (index, field, value) => {
    const newTranslations = [...translations];
    newTranslations[index] = {
      ...newTranslations[index],
      [field]: value,
    };
    setTranslations(newTranslations);
  };

  const addTranslation = () => {
    setTranslations([
      ...translations,
      {
        language_id: "",
        name: "",
        description: "",
        base_price: "",
      },
    ]);
  };

  const removeTranslation = (index) => {
    setTranslations(translations.filter((_, i) => i !== index));
  };

  const handleMetadataChange = (index, field, value) => {
    const newMetadata = [...metadata];
    newMetadata[index] = {
      ...newMetadata[index],
      [field]: value,
    };
    setMetadata(newMetadata);
  };

  const addMetadata = () => {
    setMetadata([
      ...metadata,
      {
        key_name: "",
        value: "",
        is_mandatory: false,
      },
    ]);
  };

  const removeMetadata = (index) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (product && product.product_id) {
      // If editing existing product, upload immediately
      setUploading(true);
      setError(null);

      try {
        // For existing products, we don't set any as primary during bulk upload
        // Users can set primary after upload
        for (const file of files) {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("description", "");

          const response = await axios.post(
            `products/${product.product_id}/images`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setImages((prev) => [...prev, response.data]);
        }
      } catch (err) {
        setError("Error uploading images. Please try again.");
        console.error("Error uploading images:", err);
      } finally {
        setUploading(false);
      }
    } else {
      // If creating new product, store files for later upload
      const newPendingImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPendingImages(prev => [...prev, ...newPendingImages]);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (product && product.product_id) {
      try {
        await axios.delete(`products/${product.product_id}/images/${imageId}`);
        setImages((prev) => prev.filter((img) => img.product_image_id !== imageId));
      } catch (err) {
        setError("Error deleting image. Please try again.");
        console.error("Error deleting image:", err);
      }
    } else {
      // Remove from pending images
      setPendingImages(prev => prev.filter((_, index) => index !== imageId));
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    if (!product || !product.product_id) return;
    try {
      await axios.post(`products/${product.product_id}/images/${imageId}/primary`);
      // Refresh images after setting primary
      loadProductImages(product.product_id);
    } catch (err) {
      console.error("Error setting primary image:", err);
    }
  };

  // Set a pending image as primary (before product is created)
  const handleSetPrimaryPendingImage = (index) => {
    setPendingImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index, // Only the selected index will be primary
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Use name and base_price from the first translation for the main product fields
      const firstTranslation = translations[0] || {};
      const submitData = {
        ...formData,
        name: firstTranslation.name || '',
        base_price: firstTranslation.base_price || '',
        is_customizable: formData.is_customizable ? 1 : 0,
        translations: translations,
      };
      
      // First create/update the product
      const result = await onSubmit(submitData);
      
      if (!result || !result.product_id) {
        throw new Error('Failed to create product: No product ID returned');
      }
      
      // If there are pending images and we have a product ID, upload them
      if (pendingImages.length > 0) {
        setUploading(true);
        
        // Find the primary image index
        const primaryIndex = pendingImages.findIndex(img => img.is_primary);
        
        for (let i = 0; i < pendingImages.length; i++) {
          const pendingImage = pendingImages[i];
          const formData = new FormData();
          formData.append("image", pendingImage.file);
          formData.append("description", "");
          
          // Only mark as primary if this is the primary image
          if (i === primaryIndex) {
            formData.append("is_primary", "1");
          }
          
          await axios.post(
            `products/${result.product_id}/images`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
        setPendingImages([]);
      }
      
      // Save metadata if we have any
      const productId = product && product.product_id ? product.product_id : result.product_id;
      if (metadata.length > 0 && productId) {
        try {
          await axios.put(`products/${productId}/metadata`, metadata);
        } catch (err) {
          console.error("Error saving metadata:", err);
          // Don't fail the whole submission for metadata errors
        }
      }
      
      // Reset form after successful creation (only for new products)
      if (!product || !product.product_id) {
        setFormData({
          manufacturer_id: "",
          is_customizable: false,
        });
        setTranslations([]);
        setMetadata([]);
        setImages([]);
        setPendingImages([]);
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return;
    } catch (err) {
      setError(err.message || "Error saving product. Please try again.");
      console.error("Error saving product:", err);
    } finally {
      setUploading(false);
    }
  };

  const getAvailableLanguages = (currentTranslationIndex) => {
    const usedLanguageIds = translations
      .map((t, i) => i !== currentTranslationIndex ? t.language_id : null)
      .filter(id => id !== null);
    return languages.filter(lang => !usedLanguageIds.includes(lang.language_id));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="manufacturer_id" className="form-label">
          Manufacturer *
        </label>
        <select
          className="form-control"
          id="manufacturer_id"
          name="manufacturer_id"
          value={formData.manufacturer_id}
          onChange={handleInputChange}
          required
          data-testid="manufacturer-select"
        >
          <option value="">Select a manufacturer</option>
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer.manufacturer_id} value={manufacturer.manufacturer_id}>
              {manufacturer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="is_customizable"
          name="is_customizable"
          checked={formData.is_customizable}
          onChange={handleInputChange}
          data-testid="customizable-checkbox"
        />
        <label className="form-check-label" htmlFor="is_customizable">
          Customizable
        </label>
      </div>



      {/* Translations Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Product Translations</h5>
        </div>
        <div className="card-body">
          {translations.map((translation, index) => (
            <div key={index} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Translation {index + 1}</h6>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeTranslation(index)}
                >
                  Remove
                </button>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Language *</label>
                  <select
                    className="form-control"
                    value={translation.language_id}
                    onChange={(e) => handleTranslationChange(index, 'language_id', e.target.value)}
                    required
                    data-testid={`translation-${index}-language`}
                  >
                    <option value="">Select language</option>
                    {getAvailableLanguages(index).map((lang) => (
                      <option key={lang.language_id} value={lang.language_id}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={translation.name}
                    onChange={(e) => handleTranslationChange(index, 'name', e.target.value)}
                    required
                    data-testid={`translation-${index}-name`}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Base Price *</label>
                  <input
                    type="number"
                    className="form-control"
                    step="0.01"
                    min="0"
                    value={translation.base_price}
                    onChange={(e) => handleTranslationChange(index, 'base_price', e.target.value)}
                    required
                    data-testid={`translation-${index}-price`}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={translation.description}
                    onChange={(e) => handleTranslationChange(index, 'description', e.target.value)}
                    data-testid={`translation-${index}-description`}
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Carelli Item (Optional)
                  </label>
                  <CarelliItemSelector
                    onItemSelect={(selectedItem) => handleCarelliItemSelect(selectedItem, index)}
                    selectedItem={translation.web_id ? { 
                      item_id: translation.web_id,
                      title: translation.name,
                      description: translation.text,
                      price: translation.base_price,
                      language_id: translation.language_id
                    } : null}
                    placeholder={`Search for Carelli items in ${getAvailableLanguages(index).find(l => l.language_id == translation.language_id)?.name || 'this language'}...`}
                  />
                  <div className="form-text">
                    Link this translation to an existing Carelli item from the main website.
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addTranslation}
          >
            Add Translation
          </button>
        </div>
      </div>

      {/* Product Metadata Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Product Metadata</h5>
          <small className="text-muted">
            Define metadata fields that will be inherited by proposal items
          </small>
        </div>
        <div className="card-body">
          {metadata.map((item, index) => (
            <div key={index} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Metadata Field {index + 1}</h6>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeMetadata(index)}
                >
                  Remove
                </button>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Key Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.key_name}
                    onChange={(e) => handleMetadataChange(index, 'key_name', e.target.value)}
                    placeholder="e.g., dimensions, weight, color"
                    required
                    data-testid={`metadata-${index}-key`}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Default Value</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.value}
                    onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                    placeholder="Leave empty for user input"
                    data-testid={`metadata-${index}-value`}
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`mandatory-${index}`}
                    checked={item.is_mandatory}
                    onChange={(e) => handleMetadataChange(index, 'is_mandatory', e.target.checked)}
                    data-testid={`metadata-${index}-mandatory`}
                  />
                  <label className="form-check-label" htmlFor={`mandatory-${index}`}>
                    Mandatory field (proposal items must provide this value)
                  </label>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addMetadata}
          >
            Add Metadata Field
          </button>
        </div>
      </div>

      {/* Product Images Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Product Images</h5>
        </div>
        <div className="card-body">
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
              onChange={handleImageUpload}
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
                        onClick={() => handleSetPrimaryImage(image.product_image_id)}
                        disabled={image.is_primary === '1' || image.is_primary === true}
                      >
                        {(image.is_primary === '1' || image.is_primary === true) ? "Primary" : "Set as Primary"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteImage(image.product_image_id)}
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
                        onClick={() => handleSetPrimaryPendingImage(index)}
                        disabled={image.is_primary === '1' || image.is_primary === true}
                      >
                        {(image.is_primary === '1' || image.is_primary === true) ? "Primary" : "Set as Primary"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteImage(index)}
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
      </div>

      <button type="submit" className="btn btn-primary" disabled={uploading} data-testid="submit-button">
        {product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

export default MultilingualProductForm; 