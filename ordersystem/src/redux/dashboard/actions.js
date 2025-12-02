import * as types from "./types";

// Fetch Dashboard Statistics - TODO better UI + different graphs + overhaul
export const fetchDashboardStatisticsRequest = () => ({
  type: types.FETCH_DASHBOARD_STATISTICS_REQUEST,
});

export const fetchDashboardStatisticsSuccess = (statistics) => ({
  type: types.FETCH_DASHBOARD_STATISTICS_SUCCESS,
  payload: statistics,
});

export const fetchDashboardStatisticsFailure = (error) => ({
  type: types.FETCH_DASHBOARD_STATISTICS_FAILURE,
  payload: error,
}); 