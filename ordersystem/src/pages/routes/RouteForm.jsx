import React, { useState, useEffect } from "react";
import axios from "../../services/axiosInstance";

const RouteForm = ({ route = {}, onSubmit }) => {
  const [formData, setFormData] = useState({
    vehicleId: route.vehicleId || "",
    driverId: route.driverId || "",
    plannedDate: route.plannedDate || "",
    stops: route.stops || [],
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Fetch vehicles and drivers
  useEffect(() => {
    // Use axiosInstance for automatic token renewal and consistent error handling
    axios.get("vehicles")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error fetching vehicles:", err));

    // Note: This endpoint may need to be implemented - using vehicles for now
    axios.get("vehicles")
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error("Error fetching drivers:", err));
  }, []);

  // Handle input changes for route details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle stops management
  const handleAddStop = () => {
    setFormData((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        { id: Date.now(), type: "Pickup", location: "", plannedTime: "" },
      ],
    }));
  };

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...formData.stops];
    updatedStops[index][field] = value;
    setFormData((prev) => ({ ...prev, stops: updatedStops }));
  };

  const handleDeleteStop = (index) => {
    const updatedStops = [...formData.stops];
    updatedStops.splice(index, 1);
    setFormData((prev) => ({ ...prev, stops: updatedStops }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Route Details */}
      <div className="mb-3">
        <label htmlFor="vehicleId" className="form-label">
          Vehicle
        </label>
        <select
          id="vehicleId"
          name="vehicleId"
          className="form-select"
          value={formData.vehicleId}
          onChange={handleInputChange}
          required
        >
          <option value="">Select a vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="driverId" className="form-label">
          Driver
        </label>
        <select
          id="driverId"
          name="driverId"
          className="form-select"
          value={formData.driverId}
          onChange={handleInputChange}
          required
        >
          <option value="">Select a driver</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="plannedDate" className="form-label">
          Planned Date
        </label>
        <input
          type="date"
          id="plannedDate"
          name="plannedDate"
          className="form-control"
          value={formData.plannedDate}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Stops Management */}
      <h5>Stops</h5>
      {formData.stops.map((stop, index) => (
        <div key={stop.id} className="mb-3 border p-3">
          <div className="d-flex justify-content-between">
            <h6>Stop {index + 1}</h6>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteStop(index)}
            >
              Delete
            </button>
          </div>
          <div className="mb-2">
            <label htmlFor={`stop-type-${index}`} className="form-label">
              Type
            </label>
            <select
              id={`stop-type-${index}`}
              className="form-select"
              value={stop.type}
              onChange={(e) => handleStopChange(index, "type", e.target.value)}
            >
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>
          <div className="mb-2">
            <label htmlFor={`stop-location-${index}`} className="form-label">
              Location
            </label>
            <input
              type="text"
              id={`stop-location-${index}`}
              className="form-control"
              value={stop.location}
              onChange={(e) =>
                handleStopChange(index, "location", e.target.value)
              }
            />
          </div>
          <div className="mb-2">
            <label htmlFor={`stop-plannedTime-${index}`} className="form-label">
              Planned Time
            </label>
            <input
              type="datetime-local"
              id={`stop-plannedTime-${index}`}
              className="form-control"
              value={stop.plannedTime}
              onChange={(e) =>
                handleStopChange(index, "plannedTime", e.target.value)
              }
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary mb-3"
        onClick={handleAddStop}
      >
        Add Stop
      </button>

      {/* Submit Button */}
      <button type="submit" className="btn btn-primary">
        {route.id ? "Update Route" : "Create Route"}
      </button>
    </form>
  );
};

export default RouteForm;
