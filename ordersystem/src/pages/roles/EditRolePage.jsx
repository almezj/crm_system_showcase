// src/pages/roles/EditRolePage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRoleByIdRequest,
  updateRoleRequest,
} from "../../redux/roles/actions";
import RoleForm from "./RoleForm";

const EditRolePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, loading, error } = useSelector((state) => state.roles);

  useEffect(() => {
    dispatch(fetchRoleByIdRequest(id));
  }, [dispatch, id]);

  const handleSubmit = (formData) => {
    console.log({ ...formData, role_id: id });
    dispatch(updateRoleRequest({ ...formData, role_id: id }));
    //reload the
    dispatch(fetchRoleByIdRequest(id));
  };

  if (!role) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="mb-4">Edit Role</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <RoleForm role={role} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default EditRolePage;
