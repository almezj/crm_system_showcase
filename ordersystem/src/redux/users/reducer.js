import * as types from "./types";

const initialState = {
  loading: false,
  users: [],
  user: null,
  error: null,
  isUserUpdatedSuccess: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_USERS_REQUEST:
    case types.FETCH_USER_BY_ID_REQUEST:
      return { ...state, loading: true, error: null, user: null };
    case types.CREATE_USER_REQUEST:
    case types.UPDATE_USER_REQUEST:
    case types.DELETE_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_USERS_SUCCESS:
      return { ...state, loading: false, users: action.payload };

    case types.FETCH_USER_BY_ID_SUCCESS:
      return { ...state, loading: false, user: action.payload };

    case types.CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: [...state.users, action.payload],
      };

    case types.UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        isUserUpdatedSuccess: true,
        user: null,
        users: state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };

    case types.DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter((u) => u.id !== action.payload),
      };

    case types.FETCH_USERS_FAILURE:
    case types.FETCH_USER_BY_ID_FAILURE:
    case types.CREATE_USER_FAILURE:
    case types.UPDATE_USER_FAILURE:
    case types.DELETE_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default userReducer;
