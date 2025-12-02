import * as types from "./types";

const initialState = {
  loading: false,
  orders: [],
  order: null,
  error: null,
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_ORDERS_REQUEST:
    case types.FETCH_ORDER_BY_ID_REQUEST:
    case types.CREATE_ORDER_REQUEST:
    case types.UPDATE_ORDER_REQUEST:
    case types.DELETE_ORDER_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_ORDERS_SUCCESS:
      return { ...state, loading: false, orders: action.payload };

    case types.FETCH_ORDER_BY_ID_SUCCESS:
      return { ...state, loading: false, order: action.payload };

    case types.CREATE_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: [...state.orders, action.payload],
      };

    case types.UPDATE_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? action.payload : o
        ),
      };

    case types.DELETE_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: state.orders.filter((o) => o.id !== action.payload),
      };

    case types.FETCH_ORDERS_FAILURE:
    case types.FETCH_ORDER_BY_ID_FAILURE:
    case types.CREATE_ORDER_FAILURE:
    case types.UPDATE_ORDER_FAILURE:
    case types.DELETE_ORDER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default orderReducer;
