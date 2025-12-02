import React, { useState } from "react";
import RouteForm from "./RouteForm";
import axios from "../../services/axiosInstance";

const PlanRoutePage = () => {
  const handlePlanRoute = (formData) => {
    console.log("Planning Route:", formData);
    // Use axiosInstance for automatic token renewal and consistent error handling
    axios.post("routes", formData)
      .then((response) => {
        console.log("Route planned successfully:", response.data);
        // TODO: Redirect to routes list or show success notification
      })
      .catch((error) => console.error("Error planning route:", error));
  };

  return (
    <div>
      <h1 className="mb-4">Plan New Route</h1>
      <RouteForm onSubmit={handlePlanRoute} />
    </div>
  );
};

export default PlanRoutePage;
