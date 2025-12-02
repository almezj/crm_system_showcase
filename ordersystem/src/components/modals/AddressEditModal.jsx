import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

const AddressEditModal = ({ show, onClose, initialAddress = {}, onSave }) => {
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: initialAddress.state_province || initialAddress.state || "",
    postalCode: initialAddress.postal_code || initialAddress.postalCode || "",
    country: "",
    latitude: 0,
    longitude: 0,
    ...initialAddress, // Populate with initial values if provided
  });

  // Update address details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Update coordinates when marker is dragged
  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setAddress((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  // Save the updated address
  const handleSave = () => {
    onSave(address);
    onClose();
  };

  // Custom component for handling map interactions
  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setAddress((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      },
    });

    return (
      <Marker
        position={[address.latitude, address.longitude]}
        draggable
        eventHandlers={{ dragend: handleMarkerDrag }}
      />
    );
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Address</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          {/* Left Side: Address Form */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="street" className="form-label">
                Street
              </label>
              <input
                type="text"
                id="street"
                name="street"
                className="form-control"
                value={address.street}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="floor" className="form-label">
                Floor
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                className="form-control"
                value={address.floor || ""}
                onChange={handleInputChange}
                min="0"
                placeholder="Floor number"
                title="Enter floor number (0 for ground floor)"
              />
              <small className="form-text text-muted">
                Floor number for delivery surcharge calculations
              </small>
            </div>
            <div className="mb-3">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-control"
                value={address.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="state" className="form-label">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-control"
                value={address.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="postalCode" className="form-label">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                className="form-control"
                value={address.postalCode}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="country" className="form-label">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                className="form-control"
                value={address.country}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Right Side: Map */}
          <div className="col-md-6">
            <MapContainer
              center={[address.latitude, address.longitude]}
              zoom={15}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddressEditModal;
