// src/pages/roles/RolesPage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchRolesRequest,
  deleteRoleRequest,
} from "../../redux/roles/actions";

const RolesPage = () => {
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state) => state.roles);

  useEffect(() => {
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRoleRequest(id));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h1 className="mb-4">Roles</h1>
      <Link to="/admin/roles/add" className="btn btn-primary mb-3">
        Add Role
      </Link>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Role Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.role_id}>
                <td>{role.role_id}</td>
                <td>{role.role_name}</td>
                <td>{role.description}</td>
                <td>
                  <Link
                    to={`/admin/roles/${role.role_id}/edit`}
                    className="btn btn-sm btn-secondary me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(role.role_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolesPage;
