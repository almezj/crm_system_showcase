import * as types from "./types";

// Fetch Products
export const fetchProductsRequest = (showDeleted = false, page = 1, limit = 10) => ({
  type: types.FETCH_PRODUCTS_REQUEST,
  payload: { showDeleted, page, limit }
});
export const fetchProductsSuccess = (data) => ({
  type: types.FETCH_PRODUCTS_SUCCESS,
  payload: data,
});
export const fetchProductsFailure = (error) => ({
  type: types.FETCH_PRODUCTS_FAILURE,
  payload: error,
});

// Fetch Product by ID
export const fetchProductByIdRequest = (id) => ({
  type: types.FETCH_PRODUCT_BY_ID_REQUEST,
  payload: id,
});
export const fetchProductByIdSuccess = (product) => ({
  type: types.FETCH_PRODUCT_BY_ID_SUCCESS,
  payload: product,
});
export const fetchProductByIdFailure = (error) => ({
  type: types.FETCH_PRODUCT_BY_ID_FAILURE,
  payload: error,
});

// Create Product
export const createProductRequest = (product) => ({
  type: types.CREATE_PRODUCT_REQUEST,
  payload: product,
});
export const createProductSuccess = (product) => ({
  type: types.CREATE_PRODUCT_SUCCESS,
  payload: product,
});
export const createProductFailure = (error) => ({
  type: types.CREATE_PRODUCT_FAILURE,
  payload: error,
});

// Update Product
export const updateProductRequest = (product) => ({
  type: types.UPDATE_PRODUCT_REQUEST,
  payload: product,
});
export const updateProductSuccess = (product) => ({
  type: types.UPDATE_PRODUCT_SUCCESS,
  payload: product,
});
export const updateProductFailure = (error) => ({
  type: types.UPDATE_PRODUCT_FAILURE,
  payload: error,
});

// Delete Product
export const deleteProductRequest = (id) => ({
  type: types.DELETE_PRODUCT_REQUEST,
  payload: id,
});
export const deleteProductSuccess = (id) => ({
  type: types.DELETE_PRODUCT_SUCCESS,
  payload: id,
});
export const deleteProductFailure = (error) => ({
  type: types.DELETE_PRODUCT_FAILURE,
  payload: error,
});

// Set Products Filter
export const setProductsFilter = (filters) => ({
  type: types.SET_PRODUCTS_FILTER,
  payload: filters,
});
