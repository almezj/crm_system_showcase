import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axiosInstance from "../../services/axiosInstance";

// Fetch Roles
function* fetchRoles() {
  try {
    const response = yield call(axiosInstance.get, "/roles");
    yield put(actions.fetchRolesSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchRolesFailure(error.message));
  }
}

// Fetch Role by ID
function* fetchRoleById(action) {
  try {
    const response = yield call(axiosInstance.get, `/roles/${action.payload}`);
    yield put(actions.fetchRoleByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchRoleByIdFailure(error.message));
  }
}

// Create Role
function* createRole(action) {
  try {
    const response = yield call(axiosInstance.post, "/roles", action.payload);
    yield put(actions.createRoleSuccess(response.data));
  } catch (error) {
    yield put(actions.createRoleFailure(error.message));
  }
}

// Update Role
function* updateRole(action) {
  try {
    const response = yield call(
      axiosInstance.patch,
      `/roles/${action.payload.role_id}`,
      action.payload
    );
    yield put(actions.updateRoleSuccess(response.data));
  } catch (error) {
    yield put(actions.updateRoleFailure(error.message));
  }
}

// Delete Role
function* deleteRole(action) {
  try {
    yield call(axiosInstance.delete, `/roles/${action.payload}`);
    yield put(actions.deleteRoleSuccess(action.payload));
  } catch (error) {
    yield put(actions.deleteRoleFailure(error.message));
  }
}

export default function* roleSaga() {
  yield takeLatest(types.FETCH_ROLES_REQUEST, fetchRoles);
  yield takeLatest(types.FETCH_ROLE_BY_ID_REQUEST, fetchRoleById);
  yield takeLatest(types.CREATE_ROLE_REQUEST, createRole);
  yield takeLatest(types.UPDATE_ROLE_REQUEST, updateRole);
  yield takeLatest(types.DELETE_ROLE_REQUEST, deleteRole);
}
