import { call, put, takeLatest } from "redux-saga/effects";
import * as actions from "./actions";
import * as types from "./types";
import axios from "../../services/axiosInstance";

// Fetch Materials
function* fetchMaterials() {
  try {
    const response = yield call(axios.get, "/materials");
    yield put(actions.fetchMaterialsSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchMaterialsFailure(error.message));
  }
}

// Create Material
function* createMaterial(action) {
  try {
    const response = yield call(axios.post, "/materials", action.payload);
    yield put(actions.createMaterialSuccess(response.data));
    // Fetch updated materials list
    yield put(actions.fetchMaterialsRequest());
  } catch (error) {
    yield put(actions.createMaterialFailure(error.message));
  }
}

// Update Material
function* updateMaterial(action) {
  try {
    console.log('Saga: updateMaterial action payload:', action.payload);
    const { id, ...materialData } = action.payload;
    
    console.log('Saga: Processing JSON request with data:', materialData);
    const response = yield call(axios.patch, `/materials/${id}`, materialData);
    
    yield put(actions.updateMaterialSuccess(response.data));
    // Fetch updated materials list
    yield put(actions.fetchMaterialsRequest());
  } catch (error) {
    console.error('Saga: Error in updateMaterial:', error);
    yield put(actions.updateMaterialFailure(error.message));
  }
}

// Delete Material
function* deleteMaterial(action) {
  try {
    yield call(axios.delete, `/materials/${action.payload}`);
    yield put(actions.deleteMaterialSuccess(action.payload));
    // Fetch updated materials list
    yield put(actions.fetchMaterialsRequest());
  } catch (error) {
    yield put(actions.deleteMaterialFailure(error.message));
  }
}

export default function* materialSaga() {
  yield takeLatest(types.FETCH_MATERIALS_REQUEST, fetchMaterials);
  yield takeLatest(types.CREATE_MATERIAL_REQUEST, createMaterial);
  yield takeLatest(types.UPDATE_MATERIAL_REQUEST, updateMaterial);
  yield takeLatest(types.DELETE_MATERIAL_REQUEST, deleteMaterial);
} 