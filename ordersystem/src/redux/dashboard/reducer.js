import * as types from "./types";

const initialState = {
  loading: false,
  statistics: null,
  error: null,
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_DASHBOARD_STATISTICS_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_DASHBOARD_STATISTICS_SUCCESS:
      return { ...state, loading: false, statistics: action.payload };

    case types.FETCH_DASHBOARD_STATISTICS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default dashboardReducer; 