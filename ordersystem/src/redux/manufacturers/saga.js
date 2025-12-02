import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axios from "../../services/axiosInstance";

// Fetch Manufacturers
function* fetchManufacturers() {
  try {
    const response = yield call(axios.get, "/manufacturers");
    yield put(actions.fetchManufacturersSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchManufacturersFailure(error.message));
  }
}

// Fetch Manufacturer by ID
function* fetchManufacturerById(action) {
  try {
    const response = yield call(axios.get, `/manufacturers/${action.payload}`);
    yield put(actions.fetchManufacturerByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchManufacturerByIdFailure(error.message));
  }
}

// Create Manufacturer
function* createManufacturer(action) {
  try {
    const response = yield call(axios.post, "/manufacturers", action.payload);
    yield put(actions.createManufacturerSuccess(response.data));
  } catch (error) {
    yield put(actions.createManufacturerFailure(error.message));
  }
}

// Update Manufacturer
function* updateManufacturer(action) {
  try {
    const response = yield call(
      axios.patch,
      `/manufacturers/${action.payload.id}`,
      action.payload
    );
    yield put(actions.updateManufacturerSuccess(response.data));
  } catch (error) {
    yield put(actions.updateManufacturerFailure(error.message));
  }
}

// Delete Manufacturer
function* deleteManufacturer(action) {
  try {
    yield call(axios.delete, `/manufacturers/${action.payload}`);
    yield put(actions.deleteManufacturerSuccess(action.payload));
  } catch (error) {
    yield put(actions.deleteManufacturerFailure(error.message));
  }
}

// Fetch Manufacturer Metadata
function* fetchManufacturerMetadata(action) {
  try {
    const response = yield call(
      axios.get,
      `/manufacturers/${action.payload}/metadata`
    );
    yield put(actions.fetchManufacturerMetadataSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchManufacturerMetadataFailure(error.message));
  }
}

// Add Manufacturer Metadata
function* addManufacturerMetadata(action) {
  try {
    const response = yield call(
      axios.post,
      `/manufacturers/${action.payload.id}/metadata`,
      action.payload.metadata
    );
    yield put(actions.addManufacturerMetadataSuccess(response.data));
  } catch (error) {
    yield put(actions.addManufacturerMetadataFailure(error.message));
  }
}

export default function* manufacturerSaga() {
  yield takeLatest(types.FETCH_MANUFACTURERS_REQUEST, fetchManufacturers);
  yield takeLatest(
    types.FETCH_MANUFACTURER_BY_ID_REQUEST,
    fetchManufacturerById
  );
  yield takeLatest(types.CREATE_MANUFACTURER_REQUEST, createManufacturer);
  yield takeLatest(types.UPDATE_MANUFACTURER_REQUEST, updateManufacturer);
  yield takeLatest(types.DELETE_MANUFACTURER_REQUEST, deleteManufacturer);
  yield takeLatest(
    types.FETCH_MANUFACTURER_METADATA_REQUEST,
    fetchManufacturerMetadata
  );
  yield takeLatest(
    types.ADD_MANUFACTURER_METADATA_REQUEST,
    addManufacturerMetadata
  );
}
