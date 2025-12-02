import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axiosInstance from "../../services/axiosInstance";

// Fetch Users
function* fetchUsers() {
  try {
    const response = yield call(axiosInstance.get, "/users");
    yield put(actions.fetchUsersSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchUsersFailure(error.message));
  }
}

// Fetch User by ID
function* fetchUserById(action) {
  try {
    const response = yield call(axiosInstance.get, `/users/${action.payload}`);
    yield put(actions.fetchUserByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchUserByIdFailure(error.message));
  }
}

// Create User
function* createUser(action) {
  try {
    const response = yield call(axiosInstance.post, "/users", action.payload);
    yield put(actions.createUserSuccess(response.data));
  } catch (error) {
    yield put(actions.createUserFailure(error.message));
  }
}

// Update User
function* updateUser(action) {
  try {
    const response = yield call(
      axiosInstance.patch,
      `/users/${action.payload.id}`,
      action.payload
    );
    yield put(actions.updateUserSuccess(response.data));
  } catch (error) {
    yield put(actions.updateUserFailure(error.message));
  }
}

// Delete User
function* deleteUser(action) {
  try {
    yield call(axiosInstance.delete, `/users/${action.payload}`);
    yield put(actions.deleteUserSuccess(action.payload));
  } catch (error) {
    yield put(actions.deleteUserFailure(error.message));
  }
}

export default function* userSaga() {
  yield takeLatest(types.FETCH_USERS_REQUEST, fetchUsers);
  yield takeLatest(types.FETCH_USER_BY_ID_REQUEST, fetchUserById);
  yield takeLatest(types.CREATE_USER_REQUEST, createUser);
  yield takeLatest(types.UPDATE_USER_REQUEST, updateUser);
  yield takeLatest(types.DELETE_USER_REQUEST, deleteUser);
}
