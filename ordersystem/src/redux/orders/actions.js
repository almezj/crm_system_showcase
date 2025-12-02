import * as types from "./types";

// Fetch Orders
export const fetchOrdersRequest = () => ({ type: types.FETCH_ORDERS_REQUEST });
export const fetchOrdersSuccess = (orders) => ({
  type: types.FETCH_ORDERS_SUCCESS,
  payload: orders,
});
export const fetchOrdersFailure = (error) => ({
  type: types.FETCH_ORDERS_FAILURE,
  payload: error,
});

// Fetch Order by ID
export const fetchOrderByIdRequest = (id) => ({
  type: types.FETCH_ORDER_BY_ID_REQUEST,
  payload: id,
});
export const fetchOrderByIdSuccess = (order) => ({
  type: types.FETCH_ORDER_BY_ID_SUCCESS,
  payload: order,
});
export const fetchOrderByIdFailure = (error) => ({
  type: types.FETCH_ORDER_BY_ID_FAILURE,
  payload: error,
});

// Create Order
export const createOrderRequest = (order) => ({
  type: types.CREATE_ORDER_REQUEST,
  payload: order,
});
export const createOrderSuccess = (order) => ({
  type: types.CREATE_ORDER_SUCCESS,
  payload: order,
});
export const createOrderFailure = (error) => ({
  type: types.CREATE_ORDER_FAILURE,
  payload: error,
});

// Update Order
export const updateOrderRequest = (order) => ({
  type: types.UPDATE_ORDER_REQUEST,
  payload: order,
});
export const updateOrderSuccess = (order) => ({
  type: types.UPDATE_ORDER_SUCCESS,
  payload: order,
});
export const updateOrderFailure = (error) => ({
  type: types.UPDATE_ORDER_FAILURE,
  payload: error,
});

// Delete Order
export const deleteOrderRequest = (id) => ({
  type: types.DELETE_ORDER_REQUEST,
  payload: id,
});
export const deleteOrderSuccess = (id) => ({
  type: types.DELETE_ORDER_SUCCESS,
  payload: id,
});
export const deleteOrderFailure = (error) => ({
  type: types.DELETE_ORDER_FAILURE,
  payload: error,
});
