import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProductRequest, updateProductRequest } from "../../redux/products/actions";
import { fetchManufacturersRequest } from "../../redux/manufacturers/actions";
import ProductBasicInfo from "../../components/products/ProductBasicInfo";
import ProductMetadataManager from "../../components/products/ProductMetadataManager";
import ProductImageManager from "../../components/products/ProductImageManager";
import axios from "../../services/axiosInstance";

const ProductForm = ({ product, manufacturers, onSubmit, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    manufacturer_id: "",
    is_customizable: false,
  });
  const [images, setImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        base_price: product.base_price || "",
        manufacturer_id: product.manufacturer_id || "",
        is_customizable: product.is_customizable || false,
      });
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

  useEffect(() => {
    dispatch(fetchManufacturersRequest());
  }, [dispatch]);

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
        is_primary: i === index,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Ensure is_customizable is always included and convert to 0/1
      const submitData = {
        ...formData,
        is_customizable: formData.is_customizable ? 1 : 0
      };
      
      // First create/update the product
      const result = await onSubmit(submitData);
      
      if (!result || !result.product_id) {
        throw new Error('Failed to create product: No product ID returned');
      }
      
      // If there are pending images and we have a product ID, upload them
      if (pendingImages.length > 0) {
        setUploading(true);
        for (const pendingImage of pendingImages) {
          const formData = new FormData();
          formData.append("image", pendingImage.file);
          formData.append("description", "");
          if (pendingImage.is_primary) {
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
          name: "",
          description: "",
          base_price: "",
          manufacturer_id: "",
          is_customizable: false,
        });
        setImages([]);
        setMetadata([]);
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

  return (
    <form onSubmit={handleSubmit}>
      <ProductBasicInfo
        formData={formData}
        manufacturers={manufacturers}
        onInputChange={handleInputChange}
      />

      <ProductMetadataManager
        metadata={metadata}
        onMetadataChange={handleMetadataChange}
        onAddMetadata={addMetadata}
        onRemoveMetadata={removeMetadata}
      />

      <ProductImageManager
        images={images}
        pendingImages={pendingImages}
        uploading={uploading}
        error={error}
        onImageUpload={handleImageUpload}
        onDeleteImage={handleDeleteImage}
        onSetPrimaryImage={handleSetPrimaryImage}
        onSetPrimaryPendingImage={handleSetPrimaryPendingImage}
      />

      <button type="submit" className="btn btn-primary" disabled={uploading}>
        {product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

export default ProductForm;
