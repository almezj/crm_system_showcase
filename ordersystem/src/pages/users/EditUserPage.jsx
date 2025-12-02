import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import UserForm from "./UserForm";
import {
  fetchUserByIdRequest,
  updateUserRequest,
} from "../../redux/users/actions";
import { fetchRolesRequest } from "../../redux/roles/actions";

const EditUserPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const roles = useSelector((state) => state.users.roles);
  const loading = useSelector((state) => state.users.loading);
  const error = useSelector((state) => state.users.error);
  const isUserUpdatedSuccess = useSelector(
    (state) => state.users.isUserUpdatedSuccess
  );

  useEffect(() => {
    dispatch(fetchUserByIdRequest(id));
    dispatch(fetchRolesRequest());
  }, [dispatch, id]);

  const handleUpdateUser = (formData) => {
    dispatch(updateUserRequest({ id, ...formData }));
  };
  //on successful update, reload
  useEffect(() => {
    if (isUserUpdatedSuccess) {
      dispatch(fetchUserByIdRequest(id));
    }
  }, [dispatch, id, isUserUpdatedSuccess]);

  if (loading || !user) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1 className="mb-4">Edit User</h1>
      <UserForm user={user} roles={roles} onSubmit={handleUpdateUser} />
    </div>
  );
};

export default EditUserPage;
