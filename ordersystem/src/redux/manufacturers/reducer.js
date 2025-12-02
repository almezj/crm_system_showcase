import * as types from "./types";

const initialState = {
  loading: false,
  manufacturers: [],
  manufacturer: null,
  metadata: null,
  error: null,
};

const manufacturerReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_MANUFACTURERS_REQUEST:
    case types.FETCH_MANUFACTURER_BY_ID_REQUEST:
    case types.CREATE_MANUFACTURER_REQUEST:
    case types.UPDATE_MANUFACTURER_REQUEST:
    case types.DELETE_MANUFACTURER_REQUEST:
    case types.FETCH_MANUFACTURER_METADATA_REQUEST:
    case types.ADD_MANUFACTURER_METADATA_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_MANUFACTURERS_SUCCESS:
      return { ...state, loading: false, manufacturers: action.payload };

    case types.FETCH_MANUFACTURER_BY_ID_SUCCESS:
      return { ...state, loading: false, manufacturer: action.payload };

    case types.CREATE_MANUFACTURER_SUCCESS:
      return {
        ...state,
        loading: false,
        manufacturers: [...state.manufacturers, action.payload],
      };

    case types.UPDATE_MANUFACTURER_SUCCESS:
      return {
        ...state,
        loading: false,
        manufacturers: state.manufacturers.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case types.DELETE_MANUFACTURER_SUCCESS:
      return {
        ...state,
        loading: false,
        manufacturers: state.manufacturers.filter(
          (m) => m.id !== action.payload
        ),
      };

    case types.FETCH_MANUFACTURER_METADATA_SUCCESS:
      return { ...state, loading: false, metadata: action.payload };

    case types.ADD_MANUFACTURER_METADATA_SUCCESS:
      return { ...state, loading: false, metadata: action.payload };

    case types.FETCH_MANUFACTURERS_FAILURE:
    case types.FETCH_MANUFACTURER_BY_ID_FAILURE:
    case types.CREATE_MANUFACTURER_FAILURE:
    case types.UPDATE_MANUFACTURER_FAILURE:
    case types.DELETE_MANUFACTURER_FAILURE:
    case types.FETCH_MANUFACTURER_METADATA_FAILURE:
    case types.ADD_MANUFACTURER_METADATA_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default manufacturerReducer;
