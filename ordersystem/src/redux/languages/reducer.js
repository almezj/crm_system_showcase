import {
  FETCH_LANGUAGES_REQUEST,
  FETCH_LANGUAGES_SUCCESS,
  FETCH_LANGUAGES_FAILURE,
} from './actions';

const initialState = {
  languages: [],
  loading: false,
  error: null,
};

const languagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LANGUAGES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_LANGUAGES_SUCCESS:
      return {
        ...state,
        languages: action.payload,
        loading: false,
        error: null,
      };
    case FETCH_LANGUAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default languagesReducer; 