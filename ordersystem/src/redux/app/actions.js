import * as types from './types';

// Toggle debug features on/off
export const toggleDebugFeatures = () => ({
  type: types.TOGGLE_DEBUG_FEATURES,
});

// Set debug features to specific state
export const setDebugFeatures = (enabled) => ({
  type: types.SET_DEBUG_FEATURES,
  payload: enabled,
});

// Load debug settings from localStorage
export const loadDebugSettings = () => ({
  type: types.LOAD_DEBUG_SETTINGS,
});
