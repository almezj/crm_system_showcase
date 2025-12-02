import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axiosInstance from "../../services/axiosInstance";

// Fetch Permissions
function* fetchPermissions() {
  try {
    const response = yield call(axiosInstance.get, "/permissions");
    yield put(actions.fetchPermissionsSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchPermissionsFailure(error.message));
  }
}

// Fetch Permission by ID
function* fetchPermissionById(action) {
  try {
    const response = yield call(
      axiosInstance.get,
      `/permissions/${action.payload}`
    );
    yield put(actions.fetchPermissionByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchPermissionByIdFailure(error.message));
  }
}

// Create Permission
function* createPermission(action) {
  try {
    const response = yield call(
      axiosInstance.post,
      "/permissions",
      action.payload
    );
    yield put(actions.createPermissionSuccess(response.data));
  } catch (error) {
    yield put(actions.createPermissionFailure(error.message));
  }
}

// Update Permission
function* updatePermission(action) {
  try {
    const response = yield call(
      axiosInstance.patch,
      `/persmissions/${action.payload.id}`,
      action.payload
    );
    yield put(actions.updatePermissionSuccess(response.data));
  } catch (error) {
    yield put(actions.updatePermissionFailure(error.message));
  }
}

// Delete Permission
function* deletePermission(action) {
  try {
    yield call(axiosInstance.delete, `/permissions/${action.payload}`);
    yield put(actions.deletePermissionSuccess(action.payload));
  } catch (error) {
    yield put(actions.deletePermissionFailure(error.message));
  }
}

export default function* permissionSaga() {
  yield takeLatest(types.FETCH_PERMISSIONS_REQUEST, fetchPermissions);
  yield takeLatest(types.FETCH_PERMISSION_BY_ID_REQUEST, fetchPermissionById);
  yield takeLatest(types.CREATE_PERMISSION_REQUEST, createPermission);
  yield takeLatest(types.UPDATE_PERMISSION_REQUEST, updatePermission);
  yield takeLatest(types.DELETE_PERMISSION_REQUEST, deletePermission);
}
