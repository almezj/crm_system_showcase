import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import RouteForm from "./RouteForm";

const EditRoutePage = () => {
  const { id } = useParams(); // Get route ID from URL
  const [route, setRoute] = useState(null);

  useEffect(() => {
    // mock data
    setTimeout(() => {
      setRoute({
        id: 1,
        vehicleId: 1,
        driverId: 1,
        plannedDate: "2024-01-15",
        stops: [
          {
            id: 1,
            type: "Pickup",
            location: "Warehouse A",
            plannedTime: "2024-01-15 09:00",
          },
          {
            id: 2,
            type: "Delivery",
            location: "Customer B",
            plannedTime: "2024-01-15 11:00",
          },
        ],
      });
    }, 500);
  }, [id]);

  const handleUpdateRoute = (updatedData) => {
    console.log("Updating Route:", updatedData);
  };

  if (!route) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="mb-4">Edit Route</h1>
      <RouteForm route={route} onSubmit={handleUpdateRoute} />
    </div>
  );
};

export default EditRoutePage;
