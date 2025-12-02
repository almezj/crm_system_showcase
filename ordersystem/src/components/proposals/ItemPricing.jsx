import React from 'react';

const ItemPricing = ({ 
  item, 
  proposalCurrency, 
  onItemChange, 
  onItemBlur,
  index 
}) => {
  return (
    <div className="row mt-3">
      <div className="col-md-6">
        <label className="form-label">List Price ({proposalCurrency})</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="form-control"
          value={item.list_price}
          onChange={(e) =>
            onItemChange(index, "list_price", e.target.value)
          }
          onBlur={(e) =>
            onItemBlur(index, "list_price", e.target.value)
          }
          data-testid={`item-price-${index}`}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Discount (%)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="form-control"
          value={item.discount}
          onChange={(e) =>
            onItemChange(index, "discount", e.target.value)
          }
          onBlur={(e) =>
            onItemBlur(index, "discount", e.target.value)
          }
        />
      </div>
    </div>
  );
};

export default ItemPricing;
