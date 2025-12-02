import * as types from "./types";

// Fetch Users
export const fetchUsersRequest = () => ({ type: types.FETCH_USERS_REQUEST });
export const fetchUsersSuccess = (users) => ({
  type: types.FETCH_USERS_SUCCESS,
  payload: users,
});
export const fetchUsersFailure = (error) => ({
  type: types.FETCH_USERS_FAILURE,
  payload: error,
});

// Fetch User by ID
export const fetchUserByIdRequest = (id) => ({
  type: types.FETCH_USER_BY_ID_REQUEST,
  payload: id,
});
export const fetchUserByIdSuccess = (user) => ({
  type: types.FETCH_USER_BY_ID_SUCCESS,
  payload: user,
});
export const fetchUserByIdFailure = (error) => ({
  type: types.FETCH_USER_BY_ID_FAILURE,
  payload: error,
});

// Create User
export const createUserRequest = (user) => ({
  type: types.CREATE_USER_REQUEST,
  payload: user,
});
export const createUserSuccess = (user) => ({
  type: types.CREATE_USER_SUCCESS,
  payload: user,
});
export const createUserFailure = (error) => ({
  type: types.CREATE_USER_FAILURE,
  payload: error,
});

// Update User
export const updateUserRequest = (user) => ({
  type: types.UPDATE_USER_REQUEST,
  payload: user,
});
export const updateUserSuccess = (user) => ({
  type: types.UPDATE_USER_SUCCESS,
  payload: user,
});
export const updateUserFailure = (error) => ({
  type: types.UPDATE_USER_FAILURE,
  payload: error,
});

// Delete User
export const deleteUserRequest = (id) => ({
  type: types.DELETE_USER_REQUEST,
  payload: id,
});
export const deleteUserSuccess = (id) => ({
  type: types.DELETE_USER_SUCCESS,
  payload: id,
});
export const deleteUserFailure = (error) => ({
  type: types.DELETE_USER_FAILURE,
  payload: error,
});
