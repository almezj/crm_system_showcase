import { call, put, takeLatest, select } from "redux-saga/effects";
import * as actions from "./actions";
import * as types from "./types";
import axios from "../../services/axiosInstance";
import { selectProductFilters } from "./reducer";

// Fetch Products
function* fetchProducts(action) {
  try {
    const { showDeleted, page, limit } = action.payload || {};
    const params = new URLSearchParams();
    if (showDeleted !== undefined) {
      params.append('showDeleted', showDeleted);
    }
    if (page !== undefined) {
      params.append('page', page);
    }
    if (limit !== undefined) {
      params.append('limit', limit);
    }
    
    const response = yield call(axios.get, `/products?${params.toString()}`);
    
    // Ensure we have the expected structure
    const data = {
      products: response.data.products || [],
      pagination: response.data.pagination || {
        current_page: 1,
        per_page: limit || 10,
        total: 0,
        total_pages: 0
      }
    };
    
    yield put(actions.fetchProductsSuccess(data));
  } catch (error) {
    yield put(actions.fetchProductsFailure(error.message));
  }
}

// Fetch Product by ID
function* fetchProductById(action) {
  try {
    const response = yield call(axios.get, `/products/${action.payload}`);
    yield put(actions.fetchProductByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchProductByIdFailure(error.message));
  }
}

// Create Product
function* createProduct(action) {
  try {
    const response = yield call(axios.post, "/products", action.payload);
    yield put(actions.createProductSuccess(response.data));
    // Fetch updated products list
    yield put(actions.fetchProductsRequest());
  } catch (error) {
    yield put(actions.createProductFailure(error.message));
  }
}

// Update Product
function* updateProduct(action) {
  try {
    const { id, product_id, ...rest } = action.payload;
    const realId = id || product_id;
    const response = yield call(
      axios.patch,
      `/products/${realId}`,
      { ...rest }
    );
    yield put(actions.updateProductSuccess(response.data));
    // Refresh the product list with current filters
    const filters = yield select(selectProductFilters);
    yield put(actions.fetchProductsRequest(filters));
  } catch (error) {
    yield put(actions.updateProductFailure(error.message));
  }
}

// Delete Product
function* deleteProduct(action) {
  try {
    const response = yield call(axios.delete, `/products/${action.payload}`);
    if (response.status === 204) {
      yield put(actions.deleteProductSuccess(action.payload));
      // Refresh the product list with current filters
      const filters = yield select(selectProductFilters);
      yield put(actions.fetchProductsRequest(filters));
    }
  } catch (error) {
    yield put(actions.deleteProductFailure(error.message));
  }
}

export default function* productSaga() {
  yield takeLatest(types.FETCH_PRODUCTS_REQUEST, fetchProducts);
  yield takeLatest(types.FETCH_PRODUCT_BY_ID_REQUEST, fetchProductById);
  yield takeLatest(types.CREATE_PRODUCT_REQUEST, createProduct);
  yield takeLatest(types.UPDATE_PRODUCT_REQUEST, updateProduct);
  yield takeLatest(types.DELETE_PRODUCT_REQUEST, deleteProduct);
}
