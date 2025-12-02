import * as types from "./types";

// Fetch Permissions
export const fetchPermissionsRequest = () => ({
  type: types.FETCH_PERMISSIONS_REQUEST,
});
export const fetchPermissionsSuccess = (permissions) => ({
  type: types.FETCH_PERMISSIONS_SUCCESS,
  payload: permissions,
});
export const fetchPermissionsFailure = (error) => ({
  type: types.FETCH_PERMISSIONS_FAILURE,
  payload: error,
});

// Fetch Permission by ID
export const fetchPermissionByIdRequest = (id) => ({
  type: types.FETCH_PERMISSION_BY_ID_REQUEST,
  payload: id,
});
export const fetchPermissionByIdSuccess = (permission) => ({
  type: types.FETCH_PERMISSION_BY_ID_SUCCESS,
  payload: permission,
});
export const fetchPermissionByIdFailure = (error) => ({
  type: types.FETCH_PERMISSION_BY_ID_FAILURE,
  payload: error,
});

// Create Permission
export const createPermissionRequest = (permission) => ({
  type: types.CREATE_PERMISSION_REQUEST,
  payload: permission,
});
export const createPermissionSuccess = (permission) => ({
  type: types.CREATE_PERMISSION_SUCCESS,
  payload: permission,
});
export const createPermissionFailure = (error) => ({
  type: types.CREATE_PERMISSION_FAILURE,
  payload: error,
});

// Update Permission
export const updatePermissionRequest = (permission) => ({
  type: types.UPDATE_PERMISSION_REQUEST,
  payload: permission,
});
export const updatePermissionSuccess = (permission) => ({
  type: types.UPDATE_PERMISSION_SUCCESS,
  payload: permission,
});
export const updatePermissionFailure = (error) => ({
  type: types.UPDATE_PERMISSION_FAILURE,
  payload: error,
});

// Delete Permission
export const deletePermissionRequest = (id) => ({
  type: types.DELETE_PERMISSION_REQUEST,
  payload: id,
});
export const deletePermissionSuccess = (id) => ({
  type: types.DELETE_PERMISSION_SUCCESS,
  payload: id,
});
export const deletePermissionFailure = (error) => ({
  type: types.DELETE_PERMISSION_FAILURE,
  payload: error,
});
