import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axios from "../../services/axiosInstance";

// Fetch Orders
function* fetchOrders() {
  try {
    const response = yield call(axios.get, "/orders");
    yield put(actions.fetchOrdersSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchOrdersFailure(error.message));
  }
}

// Fetch Order by ID
function* fetchOrderById(action) {
  try {
    const response = yield call(axios.get, `/orders/${action.payload}`);
    yield put(actions.fetchOrderByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchOrderByIdFailure(error.message));
  }
}

// Create Order
function* createOrder(action) {
  try {
    const response = yield call(axios.post, "/orders", action.payload);
    if (response.status === 201) {
      yield put(actions.createOrderSuccess(response.data));
    } else {
      throw new Error("Unexpected response status for creation.");
    }
  } catch (error) {
    yield put(actions.createOrderFailure(error.message));
  }
}

// Update Order
function* updateOrder(action) {
  try {
    const response = yield call(
      axios.put,
      `/orders/${action.payload.id}`,
      action.payload
    );
    yield put(actions.updateOrderSuccess(response.data));
  } catch (error) {
    yield put(actions.updateOrderFailure(error.message));
  }
}

// Delete Order
function* deleteOrder(action) {
  try {
    const response = yield call(axios.delete, `/orders/${action.payload}`);
    if (response.status === 204) {
      yield put(actions.deleteOrderSuccess(action.payload));
    } else {
      throw new Error("Unexpected response status for deletion.");
    }
  } catch (error) {
    yield put(actions.deleteOrderFailure(error.message));
  }
}

export default function* orderSaga() {
  yield takeLatest(types.FETCH_ORDERS_REQUEST, fetchOrders);
  yield takeLatest(types.FETCH_ORDER_BY_ID_REQUEST, fetchOrderById);
  yield takeLatest(types.CREATE_ORDER_REQUEST, createOrder);
  yield takeLatest(types.UPDATE_ORDER_REQUEST, updateOrder);
  yield takeLatest(types.DELETE_ORDER_REQUEST, deleteOrder);
}
