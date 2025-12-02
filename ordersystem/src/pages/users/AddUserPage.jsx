import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserForm from "./UserForm";
import { fetchRolesRequest } from "../../redux/roles/actions";
import { createUserRequest } from "../../redux/users/actions";

const AddUserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roles, loading: rolesLoading, error: rolesError } = useSelector((state) => state.roles);
  const { loading: userLoading, error: userError } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  const handleAddUser = (formData) => {
    dispatch(createUserRequest(formData));
    navigate("/admin/users"); // Navigate back to users list after creation
  };

  return (
    <div>
      <h1 className="mb-4">Add User</h1>
      {rolesError && <div className="alert alert-danger">{rolesError}</div>}
      {userError && <div className="alert alert-danger">{userError}</div>}
      {rolesLoading ? (
        <div>Loading roles...</div>
      ) : (
        <UserForm 
          roles={roles} 
          onSubmit={handleAddUser} 
          loading={userLoading}
        />
      )}
    </div>
  );
};

export default AddUserPage;
