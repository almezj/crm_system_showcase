import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axios from "../../services/axiosInstance";

// Fetch Dashboard Statistics
function* fetchDashboardStatistics() {
  try {
    const response = yield call(axios.get, "/dashboard/statistics");
    yield put(actions.fetchDashboardStatisticsSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchDashboardStatisticsFailure(error.message));
  }
}

export default function* dashboardSaga() {
  yield takeLatest(types.FETCH_DASHBOARD_STATISTICS_REQUEST, fetchDashboardStatistics);
} 