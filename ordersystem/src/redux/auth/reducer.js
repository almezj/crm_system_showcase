import * as types from "./types";

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
  user: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_REQUEST:
    case types.RENEW_SESSION_REQUEST:
      return { ...state, loading: true, error: null };

    case types.LOGIN_SUCCESS:
    case types.RENEW_SESSION_SUCCESS:
      return { ...state, loading: false, token: action.payload.token, user: action.payload.user, isAuthenticated: true };

    case types.LOGIN_FAILURE:
    case types.RENEW_SESSION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.LOGOUT_REQUEST:
      return { ...state, loading: true };

    case types.LOGOUT_SUCCESS:
      return { ...state, token: null, user: null, isAuthenticated: false, loading: false };

    case types.UPDATE_TOKEN:
      return { ...state, token: action.payload };

    default:
      return state;
  }
};

export default authReducer;
