import { put, takeEvery, select } from 'redux-saga/effects';
import * as types from './types';

function* saveDebugSettings() {
  try {
    const state = yield select();
    const debugSettings = {
      enabled: state.app.debugFeatures.enabled,
      showPdfPreview: state.app.debugFeatures.showPdfPreview,
    };
    
    localStorage.setItem('debugSettings', JSON.stringify(debugSettings));
  } catch (error) {
    console.warn('Failed to save debug settings:', error);
  }
}

function* appSaga() {
  yield takeEvery(types.TOGGLE_DEBUG_FEATURES, saveDebugSettings);
  yield takeEvery(types.SET_DEBUG_FEATURES, saveDebugSettings);
}

export default appSaga;
