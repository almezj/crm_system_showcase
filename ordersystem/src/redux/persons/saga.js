import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axios from "../../services/axiosInstance";

// Fetch Persons
function* fetchPersons() {
  try {
    const response = yield call(axios.get, "/persons");
    yield put(actions.fetchPersonsSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchPersonsFailure(error.message));
  }
}

// Fetch Person by ID
function* fetchPersonById(action) {
  try {
    const response = yield call(axios.get, `/persons/${action.payload}`);
    yield put(actions.fetchPersonByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchPersonByIdFailure(error.message));
  }
}

// Create Person
function* createPerson(action) {
  try {
    const response = yield call(axios.post, "/persons", action.payload);
    if (response.status === 201) {
      yield put(actions.createPersonSuccess(response.data));
      // Fetch updated persons list after successful creation
      yield put(actions.fetchPersonsRequest());
    } else {
      throw new Error("Unexpected response status for creation.");
    }
  } catch (error) {
    yield put(actions.createPersonFailure(error.message));
  }
}

// Update Person
function* updatePerson(action) {
  try {
    const response = yield call(
      axios.patch,
      `/persons/${action.payload.person_id}`,
      action.payload
    );
    yield put(actions.updatePersonSuccess(response.data));
    // Fetch the updated person and update Redux
    yield put(actions.fetchPersonByIdRequest(action.payload.person_id));
  } catch (error) {
    console.error('Update person error:', error.response?.data || error.message);
    yield put(actions.updatePersonFailure(error.response?.data?.error || error.message));
  }
}

// Delete Person
function* deletePerson(action) {
  try {
    const response = yield call(axios.delete, `/persons/${action.payload}`);
    if (response.status === 204) {
      yield put(actions.deletePersonSuccess(action.payload));
    } else {
      throw new Error("Unexpected response status for deletion.");
    }
  } catch (error) {
    yield put(actions.deletePersonFailure(error.message));
  }
}

// Fetch Person Types
function* fetchPersonTypes() {
  try {
    const response = yield call(axios.get, "/references/person_type");
    yield put(actions.fetchPersonTypesSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchPersonTypesFailure(error.message));
  }
}

// Fetch Address Types
function* fetchAddressTypes() {
  try {
    const response = yield call(axios.get, "/references/address_type");
    yield put(actions.fetchAddressTypesSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchAddressTypesFailure(error.message));
  }
}

export function* personSaga() {
  yield takeLatest(types.FETCH_PERSONS_REQUEST, fetchPersons);
  yield takeLatest(types.FETCH_PERSON_BY_ID_REQUEST, fetchPersonById);
  yield takeLatest(types.CREATE_PERSON_REQUEST, createPerson);
  yield takeLatest(types.UPDATE_PERSON_REQUEST, updatePerson);
  yield takeLatest(types.DELETE_PERSON_REQUEST, deletePerson);
  yield takeLatest(types.FETCH_PERSON_TYPES_REQUEST, fetchPersonTypes);
  yield takeLatest(types.FETCH_ADDRESS_TYPES_REQUEST, fetchAddressTypes);
}

// Add default export
export default personSaga;
