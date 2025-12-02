import React, { useState } from "react";

const ManufacturerForm = ({ manufacturer, onSubmit }) => {
  const [formData, setFormData] = useState(
    manufacturer || {
      name: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      address: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Manufacturer Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="contact_person" className="form-label">
          Contact Person
        </label>
        <input
          type="text"
          id="contact_person"
          name="contact_person"
          className="form-control"
          value={formData.contact_person}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="contact_email"
          className="form-control"
          value={formData.contact_email}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="phone" className="form-label">
          Phone
        </label>
        <input
          type="text"
          id="phone"
          name="contact_phone"
          className="form-control"
          value={formData.contact_phone}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="address" className="form-label">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          className="form-control"
          rows="3"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {manufacturer ? "Update Manufacturer" : "Add Manufacturer"}
      </button>
    </form>
  );
};

export default ManufacturerForm;
