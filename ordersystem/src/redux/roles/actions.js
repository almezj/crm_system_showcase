import * as types from "./types";

// Fetch Roles
export const fetchRolesRequest = () => ({ type: types.FETCH_ROLES_REQUEST });
export const fetchRolesSuccess = (roles) => ({
  type: types.FETCH_ROLES_SUCCESS,
  payload: roles,
});
export const fetchRolesFailure = (error) => ({
  type: types.FETCH_ROLES_FAILURE,
  payload: error,
});

// Fetch Role by ID
export const fetchRoleByIdRequest = (id) => ({
  type: types.FETCH_ROLE_BY_ID_REQUEST,
  payload: id,
});
export const fetchRoleByIdSuccess = (role) => ({
  type: types.FETCH_ROLE_BY_ID_SUCCESS,
  payload: role,
});
export const fetchRoleByIdFailure = (error) => ({
  type: types.FETCH_ROLE_BY_ID_FAILURE,
  payload: error,
});

// Create Role
export const createRoleRequest = (role) => ({
  type: types.CREATE_ROLE_REQUEST,
  payload: role,
});
export const createRoleSuccess = (role) => ({
  type: types.CREATE_ROLE_SUCCESS,
  payload: role,
});
export const createRoleFailure = (error) => ({
  type: types.CREATE_ROLE_FAILURE,
  payload: error,
});

// Update Role
export const updateRoleRequest = (role) => ({
  type: types.UPDATE_ROLE_REQUEST,
  payload: role,
});
export const updateRoleSuccess = (role) => ({
  type: types.UPDATE_ROLE_SUCCESS,
  payload: role,
});
export const updateRoleFailure = (error) => ({
  type: types.UPDATE_ROLE_FAILURE,
  payload: error,
});

// Delete Role
export const deleteRoleRequest = (id) => ({
  type: types.DELETE_ROLE_REQUEST,
  payload: id,
});
export const deleteRoleSuccess = (id) => ({
  type: types.DELETE_ROLE_SUCCESS,
  payload: id,
});
export const deleteRoleFailure = (error) => ({
  type: types.DELETE_ROLE_FAILURE,
  payload: error,
});
