import React, { useState, useEffect } from "react";
import ProductSelector from "../../components/proposals/ProductSelector";
import ItemMetadataManager from "../../components/proposals/ItemMetadataManager";
import ItemImageUpload from "../../components/proposals/ItemImageUpload";
import ItemPricing from "../../components/proposals/ItemPricing";
import PieceSelector from "../../components/PieceSelector";
import axios from "../../services/axiosInstance";

const ProposalItem = ({
  index,
  item,
  products,
  languages = [],
  proposalCurrency = 'CZK',
  handleItemChange,
  handleItemBlur,
  handleDeleteItem,
  handleDrop,
  handleRemoveImage,
  handleReorderImages,
  handleUpdateImageDescription,
  proposalId = null,
  validationError = null,
}) => {
  const [isCustom, setIsCustom] = useState(item.is_custom);
  const [pieces, setPieces] = useState(item.pieces || []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemMetadata, setItemMetadata] = useState(item.item_metadata || []);
  const [originalProductData, setOriginalProductData] = useState(null);

  // Sync local state with item prop changes
  useEffect(() => {
    setIsCustom(item.is_custom);
  }, [item.is_custom]);

  const handleProductSelect = async (selected) => {
    if (selected) {
      const updatedFields = {
        product_id: selected.value,
        item_name: selected.product.name,
        is_custom: false,
      };

      // Only set list_price if it's currently empty or 0 (preserve user input)
      if (!item.list_price || item.list_price === 0 || item.list_price === '0') {
        updatedFields.list_price = selected.product.base_price;
      }

      // Store original product data for restoration
      setOriginalProductData({
        product_id: selected.value,
        item_name: selected.product.name,
        base_price: selected.product.base_price
      });

      // Update all fields at once
      Object.entries(updatedFields).forEach(([field, value]) => {
        handleItemChange(index, field, value);
      });

      // Update local state to match form data
      setIsCustom(false);

      // Clear pieces when product changes
      setPieces([]);
      handleItemChange(index, "pieces", []);

      // Load product details including pieces and metadata
      try {
        const response = await axios.get(`/products/${selected.value}`);
        const productData = response.data;
        setSelectedProduct(productData);
        
        // Load product metadata and set it as item metadata
        if (productData.metadata && Array.isArray(productData.metadata)) {
          const productMetadata = productData.metadata.map(meta => ({
            key_name: meta.key_name,
            value: meta.value || "",
            is_mandatory: meta.is_mandatory || false
          }));
          setItemMetadata(productMetadata);
          handleItemChange(index, "item_metadata", productMetadata);
        }
      } catch (error) {
        console.error('Error loading product details:', error);
      }
    }
  };


  const toggleCustom = () => {
    const newIsCustom = !isCustom;
    console.log('Toggle custom:', { 
      currentIsCustom: isCustom, 
      newIsCustom, 
      currentProductId: item.product_id, 
      currentItemName: item.item_name,
      originalProductData
    });
    
    setIsCustom(newIsCustom);
    handleItemChange(index, "is_custom", newIsCustom);
    
    if (newIsCustom) {
      // When switching TO custom mode, clear product_id but keep item_name
      console.log('Switching TO custom mode - clearing product_id');
      handleItemChange(index, "product_id", null);
    } else {
      // When switching FROM custom mode, restore original product data
      console.log('Switching FROM custom mode', { 
        originalProductData,
        currentProductId: item.product_id
      });
      
      if (originalProductData && !item.product_id) {
        console.log('Restoring original product data:', originalProductData);
        handleItemChange(index, "product_id", originalProductData.product_id);
        handleItemChange(index, "item_name", originalProductData.item_name);
      }
    }
  };

  const handlePiecesChange = (newPieces) => {
    setPieces(newPieces);
    handleItemChange(index, "pieces", newPieces);
  };

  const handleMetadataAdd = () => {
    const newMetadata = [...itemMetadata, { key_name: "", value: "" }];
    setItemMetadata(newMetadata);
    handleItemChange(index, "item_metadata", newMetadata);
  };

  const handleMetadataChange = (metadataIndex, field, value) => {
    const newMetadata = [...itemMetadata];
    newMetadata[metadataIndex][field] = value;
    setItemMetadata(newMetadata);
    handleItemChange(index, "item_metadata", newMetadata);
  };

  const handleMetadataDelete = (metadataIndex) => {
    const newMetadata = itemMetadata.filter((_, i) => i !== metadataIndex);
    setItemMetadata(newMetadata);
    handleItemChange(index, "item_metadata", newMetadata);
  };

  return (
    <div className={`border p-3 mb-3 ${validationError ? 'border-danger' : ''}`} data-testid={`item-${index}`}>
      {validationError && (
        <div className="alert alert-danger mb-3" role="alert">
          <small>{validationError}</small>
        </div>
      )}
      <ProductSelector
        item={item}
        products={products}
        proposalCurrency={proposalCurrency}
        onProductSelect={handleProductSelect}
        isCustom={isCustom}
        onToggleCustom={toggleCustom}
        onItemChange={handleItemChange}
        onDeleteItem={handleDeleteItem}
        index={index}
      />

      {/* Custom Description Field */}
      <div className="mb-3">
        <label className="form-label">Custom Description (Optional)</label>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Enter a custom description for this product that will be displayed in the PDF..."
          value={item.custom_description || ''}
          onChange={(e) =>
            handleItemChange(index, "custom_description", e.target.value)
          }
        />
        <small className="form-text text-muted">
          This description will be displayed in the product summary PDF template.
        </small>
      </div>

      <label className="form-label">Quantity</label>
      <input
        type="number"
        min="1"
        step="1"
        value={item.quantity}
        className="form-control mb-2"
        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
        onBlur={(e) => handleItemBlur(index, "quantity", e.target.value)}
        data-testid={`item-quantity-${index}`}
      />

      <ItemImageUpload
        item={item}
        index={index}
        onDrop={handleDrop}
        onRemoveImage={handleRemoveImage}
        onReorderImages={handleReorderImages}
        onUpdateImageDescription={handleUpdateImageDescription}
      />

      <ItemPricing
        item={item}
        proposalCurrency={proposalCurrency}
        onItemChange={handleItemChange}
        onItemBlur={handleItemBlur}
        index={index}
      />

      <ItemMetadataManager
        itemMetadata={itemMetadata}
        onMetadataAdd={handleMetadataAdd}
        onMetadataChange={handleMetadataChange}
        onMetadataDelete={handleMetadataDelete}
        selectedProduct={selectedProduct}
      />

      {/* Enhanced Piece Management */}
      <div className="mt-4">
        <PieceSelector 
          product={selectedProduct}
          selectedPieces={pieces}
          onPiecesChange={handlePiecesChange}
          proposalId={proposalId}
          proposalItemId={item.tempKey || item.proposal_item_id}
        />
      </div>
    </div>
  );
};

export default ProposalItem;
