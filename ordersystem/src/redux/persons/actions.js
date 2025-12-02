import * as types from "./types";

// Fetch Persons
export const fetchPersonsRequest = () => ({
  type: types.FETCH_PERSONS_REQUEST,
});
export const fetchPersonsSuccess = (persons) => ({
  type: types.FETCH_PERSONS_SUCCESS,
  payload: persons,
});
export const fetchPersonsFailure = (error) => ({
  type: types.FETCH_PERSONS_FAILURE,
  payload: error,
});

// Fetch Person by ID
export const fetchPersonByIdRequest = (id) => ({
  type: types.FETCH_PERSON_BY_ID_REQUEST,
  payload: id,
});
export const fetchPersonByIdSuccess = (person) => ({
  type: types.FETCH_PERSON_BY_ID_SUCCESS,
  payload: person,
});
export const fetchPersonByIdFailure = (error) => ({
  type: types.FETCH_PERSON_BY_ID_FAILURE,
  payload: error,
});

// Create Person
export const createPersonRequest = (person) => ({
  type: types.CREATE_PERSON_REQUEST,
  payload: person,
});
export const createPersonSuccess = (person) => ({
  type: types.CREATE_PERSON_SUCCESS,
  payload: person,
});
export const createPersonFailure = (error) => ({
  type: types.CREATE_PERSON_FAILURE,
  payload: error,
});

// Update Person
export const updatePersonRequest = (person) => ({
  type: types.UPDATE_PERSON_REQUEST,
  payload: person,
});

export const updatePersonSuccess = (person) => ({
  type: types.UPDATE_PERSON_SUCCESS,
  payload: person,
});

export const updatePersonFailure = (error) => ({
  type: types.UPDATE_PERSON_FAILURE,
  payload: error,
});

// Delete Person
export const deletePersonRequest = (id) => ({
  type: types.DELETE_PERSON_REQUEST,
  payload: id,
});
export const deletePersonSuccess = (id) => ({
  type: types.DELETE_PERSON_SUCCESS,
  payload: id,
});
export const deletePersonFailure = (error) => ({
  type: types.DELETE_PERSON_FAILURE,
  payload: error,
});

// Fetch Person Types
export const fetchPersonTypesRequest = () => ({
  type: types.FETCH_PERSON_TYPES_REQUEST,
});

export const fetchPersonTypesSuccess = (personTypes) => ({
  type: types.FETCH_PERSON_TYPES_SUCCESS,
  payload: personTypes,
});

export const fetchPersonTypesFailure = (error) => ({
  type: types.FETCH_PERSON_TYPES_FAILURE,
  payload: error,
});

// Fetch Address Types
export const fetchAddressTypesRequest = () => ({
  type: types.FETCH_ADDRESS_TYPES_REQUEST,
});

export const fetchAddressTypesSuccess = (addressTypes) => ({
  type: types.FETCH_ADDRESS_TYPES_SUCCESS,
  payload: addressTypes,
});

export const fetchAddressTypesFailure = (error) => ({
  type: types.FETCH_ADDRESS_TYPES_FAILURE,
  payload: error,
});

export const clearCreatedPerson = () => ({
  type: types.CLEAR_CREATED_PERSON,
});
