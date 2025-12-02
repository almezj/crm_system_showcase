import React from "react";

// Map status names to Bootstrap badge classes (matching proposal overview)
const getStatusBadgeClass = (statusName) => {
  switch (statusName) {
    case "Draft":
      return "bg-secondary text-dark";
    case "Pending Approval":
      return "bg-info text-dark";
    case "Under Negotiation":
      return "bg-primary text-white";
    case "Accepted":
      return "bg-success";
    case "Rejected":
      return "bg-danger";
    case "On Hold":
      return "bg-warning text-dark";
    case "Expired":
      return "bg-danger";
    case "Converted to Order":
      return "bg-success text-white";
    default:
      return "bg-secondary";
  }
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
);

export default StatusBadge; 