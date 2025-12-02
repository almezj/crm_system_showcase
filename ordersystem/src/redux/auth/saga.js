import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axiosInstance from "../../services/axiosInstance";

// Login
function* login(action) {
  try {
    const response = yield call(
      axiosInstance.post,
      "/auth/login",
      action.payload
    );
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    yield put(actions.loginSuccess(token, user));
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`; // SET TOKEEEN
  } catch (error) {
    yield put(actions.loginFailure(error.message));
  }
}

// Logout
function* logout() {
  try {
    // Remove token from local storage
    localStorage.removeItem("token");

    yield call(axiosInstance.post, "/auth/logout");
    yield put(actions.logoutSuccess());
    delete axiosInstance.defaults.headers.common["Authorization"]; // YOINK TOKEN
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
}

// Renew Session
function* renewSession() {
  try {
    const response = yield call(axiosInstance.post, "/auth/renew");
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    yield put(actions.renewSessionSuccess(token, user));
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch (error) {
    // If renew fails, clear the token and redirect to login
    localStorage.removeItem("token");
    delete axiosInstance.defaults.headers.common["Authorization"];
    yield put(actions.renewSessionFailure(error.message));
  }
}

export default function* authSaga() {
  yield takeLatest(types.LOGIN_REQUEST, login);
  yield takeLatest(types.LOGOUT_REQUEST, logout);
  yield takeLatest(types.RENEW_SESSION_REQUEST, renewSession);
}
