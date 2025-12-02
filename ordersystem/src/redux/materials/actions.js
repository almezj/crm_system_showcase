import * as types from "./types";

// Fetch Materials
export const fetchMaterialsRequest = () => ({
  type: types.FETCH_MATERIALS_REQUEST,
});
export const fetchMaterialsSuccess = (materials) => ({
  type: types.FETCH_MATERIALS_SUCCESS,
  payload: materials,
});
export const fetchMaterialsFailure = (error) => ({
  type: types.FETCH_MATERIALS_FAILURE,
  payload: error,
});

// Create Material
export const createMaterialRequest = (material) => ({
  type: types.CREATE_MATERIAL_REQUEST,
  payload: material,
});
export const createMaterialSuccess = (material) => ({
  type: types.CREATE_MATERIAL_SUCCESS,
  payload: material,
});
export const createMaterialFailure = (error) => ({
  type: types.CREATE_MATERIAL_FAILURE,
  payload: error,
});

// Clear Created Material
export const clearCreatedMaterial = () => ({
  type: types.CLEAR_CREATED_MATERIAL,
});

// Update Material
export const updateMaterialRequest = (material) => ({
  type: types.UPDATE_MATERIAL_REQUEST,
  payload: material,
});
export const updateMaterialSuccess = (material) => ({
  type: types.UPDATE_MATERIAL_SUCCESS,
  payload: material,
});
export const updateMaterialFailure = (error) => ({
  type: types.UPDATE_MATERIAL_FAILURE,
  payload: error,
});

// Delete Material
export const deleteMaterialRequest = (id) => ({
  type: types.DELETE_MATERIAL_REQUEST,
  payload: id,
});
export const deleteMaterialSuccess = (id) => ({
  type: types.DELETE_MATERIAL_SUCCESS,
  payload: id,
});
export const deleteMaterialFailure = (error) => ({
  type: types.DELETE_MATERIAL_FAILURE,
  payload: error,
}); 