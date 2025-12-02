import * as types from "./types";

const initialState = {
  loading: false,
  permissions: [],
  permission: null,
  error: null,
};

const permissionReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PERMISSIONS_REQUEST:
    case types.FETCH_PERMISSION_BY_ID_REQUEST:
    case types.CREATE_PERMISSION_REQUEST:
    case types.UPDATE_PERMISSION_REQUEST:
    case types.DELETE_PERMISSION_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PERMISSIONS_SUCCESS:
      return { ...state, loading: false, permissions: action.payload };

    case types.FETCH_PERMISSION_BY_ID_SUCCESS:
      return { ...state, loading: false, permission: action.payload };

    case types.CREATE_PERMISSION_SUCCESS:
      return {
        ...state,
        loading: false,
        permissions: [...state.permissions, action.payload],
      };

    case types.UPDATE_PERMISSION_SUCCESS:
      return {
        ...state,
        loading: false,
        permissions: state.permissions.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case types.DELETE_PERMISSION_SUCCESS:
      return {
        ...state,
        loading: false,
        permissions: state.permissions.filter((p) => p.id !== action.payload),
      };

    case types.FETCH_PERMISSIONS_FAILURE:
    case types.FETCH_PERMISSION_BY_ID_FAILURE:
    case types.CREATE_PERMISSION_FAILURE:
    case types.UPDATE_PERMISSION_FAILURE:
    case types.DELETE_PERMISSION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default permissionReducer;
