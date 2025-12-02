import * as types from './types';

const initialState = {
  debugFeatures: {
    enabled: false,
    showPdfPreview: false,
  },
  loading: false,
  error: null,
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.TOGGLE_DEBUG_FEATURES:
      return {
        ...state,
        debugFeatures: {
          ...state.debugFeatures,
          enabled: !state.debugFeatures.enabled,
          showPdfPreview: !state.debugFeatures.enabled, // PDF preview follows main toggle
        },
      };

    case types.SET_DEBUG_FEATURES:
      return {
        ...state,
        debugFeatures: {
          ...state.debugFeatures,
          enabled: action.payload,
          showPdfPreview: action.payload, // PDF preview follows main toggle
        },
      };

    case types.LOAD_DEBUG_SETTINGS:
      // Load from localStorage, fallback to default
      const savedSettings = localStorage.getItem('debugSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          return {
            ...state,
            debugFeatures: {
              enabled: parsed.enabled || false,
              showPdfPreview: parsed.showPdfPreview || false,
            },
          };
        } catch (error) {
          console.warn('Failed to parse saved debug settings:', error);
        }
      }
      return state;

    default:
      return state;
  }
};

export default appReducer;
