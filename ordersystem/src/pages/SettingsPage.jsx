import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleDebugFeatures, loadDebugSettings } from "../redux/app/actions";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const debugFeatures = useSelector((state) => state.app.debugFeatures);
  
  const [personTypes] = useState([
    { id: 1, name: "Customer" },
    { id: 2, name: "Manufacturer" },
    { id: 3, name: "Contact Person" },
  ]);

  const [statuses] = useState([
    { id: 1, name: "Pending", category: "Order Status" },
    { id: 2, name: "Completed", category: "Order Status" },
    { id: 3, name: "Draft", category: "Proposal Status" },
  ]);

  // Load debug settings on component mount
  useEffect(() => {
    dispatch(loadDebugSettings());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-4">Settings</h1>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Developer Options</h5>
          <small className="text-muted">Advanced features for development and debugging</small>
        </div>
        <div className="card-body">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="debugFeaturesToggle"
              checked={debugFeatures.enabled}
              onChange={() => dispatch(toggleDebugFeatures())}
            />
            <label className="form-check-label" htmlFor="debugFeaturesToggle">
              <strong>Enable Debug Features</strong>
              <div className="form-text">
                Shows PDF preview and other developer tools in proposal details
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Person Types</div>
        <div className="card-body">
          <button className="btn btn-primary mb-3">Add Person Type</button>
          <ul className="list-group">
            {personTypes.map((type) => (
              <li
                key={type.id}
                className="list-group-item d-flex justify-content-between"
              >
                {type.name}
                <button className="btn btn-sm btn-danger">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Statuses</div>
        <div className="card-body">
          <button className="btn btn-primary mb-3">Add Status</button>
          <ul className="list-group">
            {statuses.map((status) => (
              <li
                key={status.id}
                className="list-group-item d-flex justify-content-between"
              >
                {status.name}{" "}
                <span className="badge bg-secondary">{status.category}</span>
                <button className="btn btn-sm btn-danger">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
