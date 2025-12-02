import * as types from "./types";

const initialState = {
  loading: false,
  products: [],
  pagination: {
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  },
  product: null,
  createdProduct: null,
  error: null,
  filters: {
    showDeleted: false,
    // Add more filters here in the future
  },
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCTS_REQUEST:
    case types.FETCH_PRODUCT_BY_ID_REQUEST:
    case types.CREATE_PRODUCT_REQUEST:
    case types.UPDATE_PRODUCT_REQUEST:
    case types.DELETE_PRODUCT_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PRODUCTS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        products: action.payload.products || [],
        pagination: action.payload.pagination || {
          current_page: 1,
          per_page: 10,
          total: 0,
          total_pages: 0
        }
      };

    case types.FETCH_PRODUCT_BY_ID_SUCCESS:
      return { ...state, loading: false, product: action.payload };

    case types.CREATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        createdProduct: action.payload,
      };

    case types.UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case types.DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.filter((p) => p.id !== action.payload),
      };

    case types.FETCH_PRODUCTS_FAILURE:
    case types.FETCH_PRODUCT_BY_ID_FAILURE:
    case types.CREATE_PRODUCT_FAILURE:
    case types.UPDATE_PRODUCT_FAILURE:
    case types.DELETE_PRODUCT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.SET_PRODUCTS_FILTER:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'CLEAR_CREATED_PRODUCT':
      return { ...state, createdProduct: null };

    default:
      return state;
  }
};

export default productReducer;

export const selectProductFilters = (state) => state.products.filters;
