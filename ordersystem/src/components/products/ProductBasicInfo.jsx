import React from 'react';

const ProductBasicInfo = ({ 
  formData, 
  manufacturers, 
  onInputChange 
}) => {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Product Name *
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={onInputChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="base_price" className="form-label">
          Base Price *
        </label>
        <input
          type="number"
          className="form-control"
          id="base_price"
          name="base_price"
          step="0.01"
          min="0"
          value={formData.base_price}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="manufacturer_id" className="form-label">
          Manufacturer *
        </label>
        <select
          className="form-control"
          id="manufacturer_id"
          name="manufacturer_id"
          value={formData.manufacturer_id}
          onChange={onInputChange}
          required
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
          onChange={onInputChange}
        />
        <label className="form-check-label" htmlFor="is_customizable">
          Customizable
        </label>
      </div>
    </>
  );
};

export default ProductBasicInfo;
