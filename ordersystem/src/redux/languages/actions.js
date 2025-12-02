import { call, put, takeLatest } from 'redux-saga/effects';
import axios from '../../services/axiosInstance';

// Action Types
export const FETCH_LANGUAGES_REQUEST = 'FETCH_LANGUAGES_REQUEST';
export const FETCH_LANGUAGES_SUCCESS = 'FETCH_LANGUAGES_SUCCESS';
export const FETCH_LANGUAGES_FAILURE = 'FETCH_LANGUAGES_FAILURE';

// Action Creators
export const fetchLanguagesRequest = () => ({
  type: FETCH_LANGUAGES_REQUEST,
});

export const fetchLanguagesSuccess = (languages) => ({
  type: FETCH_LANGUAGES_SUCCESS,
  payload: languages,
});

export const fetchLanguagesFailure = (error) => ({
  type: FETCH_LANGUAGES_FAILURE,
  payload: error,
});

// Saga
export function* fetchLanguagesSaga() {
  try {
    const response = yield call(axios.get, '/languages');
    yield put(fetchLanguagesSuccess(response.data));
  } catch (error) {
    yield put(fetchLanguagesFailure(error.message));
  }
}

export function* languagesSaga() {
  yield takeLatest(FETCH_LANGUAGES_REQUEST, fetchLanguagesSaga);
} 