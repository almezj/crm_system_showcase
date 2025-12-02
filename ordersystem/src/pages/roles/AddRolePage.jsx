// src/pages/roles/AddRolePage.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createRoleRequest } from "../../redux/roles/actions";
import RoleForm from "./RoleForm";

const AddRolePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.roles);

  const handleSubmit = (formData) => {
    dispatch(createRoleRequest(formData));
    navigate("/admin/roles");
  };

  return (
    <div>
      <h1 className="mb-4">Add Role</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <RoleForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default AddRolePage;
