import React, { useCallback } from 'react';
import Select from "react-select/async";
import { formatPrice } from "../../utils/currencyUtils";
import axios from "../../services/axiosInstance";
import { debounce } from 'lodash';

const ProductSelector = ({ 
  item, 
  products, 
  proposalCurrency, 
  onProductSelect, 
  isCustom, 
  onToggleCustom, 
  onItemChange, 
  onDeleteItem,
  index 
}) => {
  // Debounced search function to prevent excessive API calls
  const debouncedSearch = useCallback(
    debounce(async (inputValue, resolve) => {
      try {
        // If no input value or less than 2 characters, return empty array
        if (!inputValue || inputValue.trim().length < 2) {
          resolve([]);
          return;
        }

        // Fetch products from API with search parameter
        const response = await axios.get('/products', {
          params: {
            search: inputValue,
            limit: 20
          }
        });

        const searchResults = response.data.products || [];
        
        resolve(
          searchResults.map((product) => ({
            value: product.product_id,
            label: `${product.name} - ${formatPrice(product.base_price, proposalCurrency)}`,
            product,
          }))
        );
      } catch (error) {
        console.error('Error fetching products:', error);
        resolve([]);
      }
    }, 300), // 300ms debounce delay
    [proposalCurrency]
  );

  const loadOptions = (inputValue) => {
    return new Promise((resolve) => {
      debouncedSearch(inputValue, resolve);
    });
  };

  const getInitialValue = () => {
    if (item.product_id && item.item_name) {
      // If we have a product_id and item_name, create the option from the item data
      return {
        value: item.product_id,
        label: `${item.item_name} - ${formatPrice(item.list_price || 0, proposalCurrency)}`,
        product: {
          product_id: item.product_id,
          name: item.item_name,
          base_price: item.list_price || 0
        },
      };
    }
    return null;
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onDeleteItem(index)}
          data-testid={`remove-item-${index}`}
        >
          Delete
        </button>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={isCustom}
            onChange={onToggleCustom}
            id={`custom-${index}`}
          />
          <label className="form-check-label" htmlFor={`custom-${index}`}>
            Custom Item
          </label>
        </div>
      </div>

      {isCustom ? (
        <div className="mb-3">
          <label className="form-label">Custom Item Name</label>
          <input
            type="text"
            className="form-control"
            value={item.item_name}
            onChange={(e) =>
              onItemChange(index, "item_name", e.target.value)
            }
            data-testid={`item-name-${index}`}
          />
        </div>
      ) : (
        <div className="mb-3">
          <label className="form-label">Select Product</label>
          <Select
            cacheOptions
            value={getInitialValue()}
            loadOptions={loadOptions}
            onChange={onProductSelect}
            placeholder="Search for a product..."
            noOptionsMessage={() => "Type to search for products..."}
          />
        </div>
      )}
    </>
  );
};

export default ProductSelector;
