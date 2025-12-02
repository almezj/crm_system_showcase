import * as types from "./types";

// Login
export const loginRequest = (credentials) => ({
  type: types.LOGIN_REQUEST,
  payload: credentials,
});
export const loginSuccess = (token, user) => ({
  type: types.LOGIN_SUCCESS,
  payload: { token, user },
});
export const loginFailure = (error) => ({
  type: types.LOGIN_FAILURE,
  payload: error,
});

// Logout
export const logoutRequest = () => ({ type: types.LOGOUT_REQUEST });
export const logoutSuccess = () => ({ type: types.LOGOUT_SUCCESS });

// Renew Session
export const renewSessionRequest = () => ({
  type: types.RENEW_SESSION_REQUEST,
});
export const renewSessionSuccess = (token, user) => ({
  type: types.RENEW_SESSION_SUCCESS,
  payload: { token, user },
});
export const renewSessionFailure = (error) => ({
  type: types.RENEW_SESSION_FAILURE,
  payload: error,
});

// Update Token Only (for interceptor use)
export const updateToken = (token) => ({
  type: types.UPDATE_TOKEN,
  payload: token,
});
