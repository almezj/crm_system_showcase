import * as types from "./types";

const initialState = {
  loading: false,
  roles: [],
  role: null,
  error: null,
};

const roleReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_ROLES_REQUEST:
    case types.FETCH_ROLE_BY_ID_REQUEST:
    case types.CREATE_ROLE_REQUEST:
    case types.UPDATE_ROLE_REQUEST:
    case types.DELETE_ROLE_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_ROLES_SUCCESS:
      return { ...state, loading: false, roles: action.payload };

    case types.FETCH_ROLE_BY_ID_SUCCESS:
      return { ...state, loading: false, role: action.payload };

    case types.CREATE_ROLE_SUCCESS:
      return {
        ...state,
        loading: false,
        roles: [...state.roles, action.payload],
      };

    case types.UPDATE_ROLE_SUCCESS:
      return {
        ...state,
        loading: false,
        roles: state.roles.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case types.DELETE_ROLE_SUCCESS:
      return {
        ...state,
        loading: false,
        roles: state.roles.filter((r) => r.id !== action.payload),
      };

    case types.FETCH_ROLES_FAILURE:
    case types.FETCH_ROLE_BY_ID_FAILURE:
    case types.CREATE_ROLE_FAILURE:
    case types.UPDATE_ROLE_FAILURE:
    case types.DELETE_ROLE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default roleReducer;
