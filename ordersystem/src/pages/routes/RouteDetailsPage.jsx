import React, { useState, useEffect } from "react";

const RouteDetailsPage = ({ id }) => {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    // Simulate fetching route by ID
    setTimeout(() => {
      setRoute({
        id: 1,
        vehicle: "Truck 1",
        driver: "John Doe",
        status: "In Progress",
        date: "2024-01-15",
        stops: [
          {
            id: 1,
            sequence: 1,
            type: "Pickup",
            location: "Warehouse A",
            time: "2024-01-15 09:00",
          },
          {
            id: 2,
            sequence: 2,
            type: "Delivery",
            location: "Customer B",
            time: "2024-01-15 11:00",
          },
        ],
      });
    }, 500);
  }, [id]);

  if (!route) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="mb-4">Route Details</h1>
      <div className="card mb-4">
        <div className="card-header">Route Information</div>
        <div className="card-body">
          <p>
            <strong>ID:</strong> {route.id}
          </p>
          <p>
            <strong>Vehicle:</strong> {route.vehicle}
          </p>
          <p>
            <strong>Driver:</strong> {route.driver}
          </p>
          <p>
            <strong>Status:</strong> {route.status}
          </p>
          <p>
            <strong>Date:</strong> {route.date}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Stops</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Location</th>
                <th>Planned Time</th>
              </tr>
            </thead>
            <tbody>
              {route.stops.map((stop) => (
                <tr key={stop.id}>
                  <td>{stop.sequence}</td>
                  <td>{stop.type}</td>
                  <td>{stop.location}</td>
                  <td>{stop.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailsPage;
