import * as types from "./types";

// Fetch Manufacturers
export const fetchManufacturersRequest = () => ({
  type: types.FETCH_MANUFACTURERS_REQUEST,
});
export const fetchManufacturersSuccess = (manufacturers) => ({
  type: types.FETCH_MANUFACTURERS_SUCCESS,
  payload: manufacturers,
});
export const fetchManufacturersFailure = (error) => ({
  type: types.FETCH_MANUFACTURERS_FAILURE,
  payload: error,
});

// Fetch Manufacturer by ID
export const fetchManufacturerByIdRequest = (id) => ({
  type: types.FETCH_MANUFACTURER_BY_ID_REQUEST,
  payload: id,
});
export const fetchManufacturerByIdSuccess = (manufacturer) => ({
  type: types.FETCH_MANUFACTURER_BY_ID_SUCCESS,
  payload: manufacturer,
});
export const fetchManufacturerByIdFailure = (error) => ({
  type: types.FETCH_MANUFACTURER_BY_ID_FAILURE,
  payload: error,
});

// Create Manufacturer
export const createManufacturerRequest = (manufacturer) => ({
  type: types.CREATE_MANUFACTURER_REQUEST,
  payload: manufacturer,
});
export const createManufacturerSuccess = (manufacturer) => ({
  type: types.CREATE_MANUFACTURER_SUCCESS,
  payload: manufacturer,
});
export const createManufacturerFailure = (error) => ({
  type: types.CREATE_MANUFACTURER_FAILURE,
  payload: error,
});

// Update Manufacturer
export const updateManufacturerRequest = (manufacturer) => ({
  type: types.UPDATE_MANUFACTURER_REQUEST,
  payload: manufacturer,
});
export const updateManufacturerSuccess = (manufacturer) => ({
  type: types.UPDATE_MANUFACTURER_SUCCESS,
  payload: manufacturer,
});
export const updateManufacturerFailure = (error) => ({
  type: types.UPDATE_MANUFACTURER_FAILURE,
  payload: error,
});

// Delete Manufacturer
export const deleteManufacturerRequest = (id) => ({
  type: types.DELETE_MANUFACTURER_REQUEST,
  payload: id,
});
export const deleteManufacturerSuccess = (id) => ({
  type: types.DELETE_MANUFACTURER_SUCCESS,
  payload: id,
});
export const deleteManufacturerFailure = (error) => ({
  type: types.DELETE_MANUFACTURER_FAILURE,
  payload: error,
});

// Fetch Manufacturer Metadata
export const fetchManufacturerMetadataRequest = (id) => ({
  type: types.FETCH_MANUFACTURER_METADATA_REQUEST,
  payload: id,
});
export const fetchManufacturerMetadataSuccess = (metadata) => ({
  type: types.FETCH_MANUFACTURER_METADATA_SUCCESS,
  payload: metadata,
});
export const fetchManufacturerMetadataFailure = (error) => ({
  type: types.FETCH_MANUFACTURER_METADATA_FAILURE,
  payload: error,
});

// Add Manufacturer Metadata
export const addManufacturerMetadataRequest = (id, metadata) => ({
  type: types.ADD_MANUFACTURER_METADATA_REQUEST,
  payload: { id, metadata },
});
export const addManufacturerMetadataSuccess = (metadata) => ({
  type: types.ADD_MANUFACTURER_METADATA_SUCCESS,
  payload: metadata,
});
export const addManufacturerMetadataFailure = (error) => ({
  type: types.ADD_MANUFACTURER_METADATA_FAILURE,
  payload: error,
});
