import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPersonRequest,
  fetchPersonTypesRequest,
  fetchAddressTypesRequest,
} from "../../redux/persons/actions";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const AddPersonPage = ({ onSubmit, isModal = false, hideSubmitButton = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { personTypes, addressTypes, loading, error, person } = useSelector((state) => state.persons);

  const [personData, setPersonData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    person_type_id: null,
    is_active: true,
    addresses: [
      {
        address_type_id: null,
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      }
    ],
  });

  const [noAddress, setNoAddress] = useState(false);
  const [formError, setError] = useState(null);

  // Fetch person types and address types on mount - combine into a single thunk later, works now so...
  useEffect(() => {
    dispatch(fetchPersonTypesRequest());
    dispatch(fetchAddressTypesRequest());
  }, [dispatch]);

  // Call onSubmit whenever personData or noAddress changes
  useEffect(() => {
    if (isModal) {
      onSubmit({ ...personData, noAddress });
    }
  }, [personData, noAddress, isModal, onSubmit]);

  const handleInputChange = (field, value) => {
    setPersonData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (index, field, value) => {
    setPersonData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  const addNewAddress = () => {
    setPersonData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          address_type_id: null,
          street: "",
          floor: null,
          city: "",
          state: "",
          postal_code: "",
          country: "",
        },
      ],
    }));
  };

  const removeAddress = (index) => {
    setPersonData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Format the data for the backend
      const submissionData = {
        ...personData,
        person_type: "customer",
        create_without_address: noAddress
      };

      // Only include addresses if not creating without address
      if (!noAddress) {
        submissionData.addresses = personData.addresses.map(addr => ({
          ...addr,
          address_type: "billing"
        }));
      }

      if (isModal) {
        // In modal mode, just dispatch the action and let the useEffect handle the response
        dispatch(createPersonRequest(submissionData));
      } else {
        // In standalone mode, wait for the response and then navigate
        await dispatch(createPersonRequest(submissionData));
        if (!error) {
          navigate("/persons");
        }
      }
    } catch (err) {
      setError(err.message || "Failed to create person");
    }
  };

  return (
    <div className="container mt-4">
      <h2>{isModal ? "Add New Customer" : "Add New Person"}</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* Basic Details */}
        <div className="card mb-4">
          <div className="card-header">Basic Details</div>
          <div className="card-body">
            <div className="mb-3">
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                value={personData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                required
              />
            </div>
            <div className="mb-3">
              <label>Last Name</label>
              <input
                type="text"
                className="form-control"
                value={personData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={personData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label>Phone</label>
              <input
                type="text"
                className="form-control"
                value={personData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label>Person Type</label>
              <select
                className="form-select"
                value={personData.person_type_id || ""}
                onChange={(e) =>
                  handleInputChange("person_type_id", e.target.value)
                }
              >
                <option value="" disabled>
                  Select Type
                </option>
                {personTypes.map((type) => (
                  <option key={type.person_type_id} value={type.person_type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* No Address Checkbox */}
        <div className="form-check mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="noAddressCheckbox"
            checked={noAddress}
            onChange={e => setNoAddress(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="noAddressCheckbox">
            Create without address
          </label>
        </div>

        {/* Address Details */}
        {!noAddress && personData.addresses.map((address, index) => (
          <div key={index} className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Address {index + 1}</span>
              {index > 0 && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeAddress(index)}
                >
                  Remove Address
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label>Address Type</label>
                <select
                  className="form-select"
                  value={address.address_type_id || ""}
                  onChange={(e) => handleAddressChange(index, "address_type_id", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select Address Type
                  </option>
                  {addressTypes.map((type) => (
                    <option key={type.address_type_id} value={type.address_type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label>Street</label>
                <input
                  type="text"
                  className="form-control"
                  value={address.street}
                  onChange={(e) => handleAddressChange(index, "street", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  value={address.city}
                  onChange={(e) => handleAddressChange(index, "city", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>State/Province</label>
                <input
                  type="text"
                  className="form-control"
                  value={address.state}
                  onChange={(e) => handleAddressChange(index, "state", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={address.postal_code}
                  onChange={(e) =>
                    handleAddressChange(index, "postal_code", e.target.value)
                  }
                />
              </div>
              <div className="mb-3">
                <label>Country</label>
                <input
                  type="text"
                  className="form-control"
                  value={address.country}
                  onChange={(e) => handleAddressChange(index, "country", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Floor</label>
                <input
                  type="number"
                  className="form-control"
                  value={address.floor}
                  onChange={(e) => handleAddressChange(index, "floor", e.target.value)}
                  min="0"
                  placeholder="Floor number"
                  title="Enter floor number (0 for ground floor)"
                />
                <small className="form-text text-muted">
                  Floor number for delivery surcharge calculations
                </small>
              </div>
            </div>
          </div>
        ))}

        {!noAddress && (
          <button
            type="button"
            className="btn btn-secondary mb-4"
            onClick={addNewAddress}
          >
            Add Another Address
          </button>
        )}

        <div className="form-check form-switch mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            checked={personData.is_active}
            onChange={(e) => handleInputChange("is_active", e.target.checked)}
          />
          <label className="form-check-label">Active</label>
        </div>

        {!hideSubmitButton && (
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => navigate("/persons")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create Person"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddPersonPage;
