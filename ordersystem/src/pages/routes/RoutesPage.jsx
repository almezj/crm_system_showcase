import React, { useState } from "react";
import { Link } from "react-router-dom";

const RoutesPage = () => {
  const [routes] = useState([
    {
      id: 1,
      vehicle: "Truck 1",
      driver: "John Doe",
      status: "Planned",
      date: "2024-01-15",
    },
    {
      id: 2,
      vehicle: "Van 2",
      driver: "Jane Smith",
      status: "In Progress",
      date: "2024-01-10",
    },
    {
      id: 3,
      vehicle: "Truck 3",
      driver: "Alice Brown",
      status: "Completed",
      date: "2024-01-20",
    },
  ]);

  return (
    <div>
      <h1 className="mb-4">Routes</h1>
      <Link className="btn btn-primary mb-3" to="/routes/plan">
        Plan New Route
      </Link>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                <td>{route.id}</td>
                <td>{route.vehicle}</td>
                <td>{route.driver}</td>
                <td>
                  <span
                    className={`badge ${
                      route.status === "Completed"
                        ? "bg-success"
                        : route.status === "Planned"
                          ? "bg-warning"
                          : "bg-info"
                    }`}
                  >
                    {route.status}
                  </span>
                </td>
                <td>{route.date}</td>
                <td>
                  <Link
                    to={`/routes/${route.id}`}
                    className="btn btn-sm btn-primary me-2"
                  >
                    View
                  </Link>
                  <Link
                    className="btn btn-sm btn-secondary"
                    to={`/routes/${route.id}/edit`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoutesPage;
