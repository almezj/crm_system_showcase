import * as types from "./types";

const initialState = {
  loading: false,
  persons: [],
  personTypes: [], // Add a state for person types
  addressTypes: [], // Add address types to state
  person: null,
  error: null,
};

const personReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PERSONS_REQUEST:
    case types.FETCH_PERSON_BY_ID_REQUEST:
    case types.CREATE_PERSON_REQUEST:
    case types.UPDATE_PERSON_REQUEST:
    case types.DELETE_PERSON_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PERSONS_SUCCESS:
      return { ...state, loading: false, persons: action.payload };

    case types.FETCH_PERSON_BY_ID_SUCCESS:
      return { ...state, loading: false, person: action.payload };

    case types.CREATE_PERSON_SUCCESS:
      return {
        ...state,
        loading: false,
        persons: [...state.persons, action.payload],
        person: action.payload,
      };

    case types.UPDATE_PERSON_SUCCESS:
      return {
        ...state,
        loading: false,
        person: action.payload,
        persons: state.persons.map((p) =>
          (p.id === action.payload.id || p.person_id === action.payload.person_id) ? action.payload : p
        ),
      };

    case types.DELETE_PERSON_SUCCESS:
      return {
        ...state,
        loading: false,
        persons: state.persons.filter((p) => p.id !== action.payload && p.person_id !== action.payload),
      };

    case types.FETCH_PERSONS_FAILURE:
    case types.FETCH_PERSON_BY_ID_FAILURE:
    case types.CREATE_PERSON_FAILURE:
    case types.UPDATE_PERSON_FAILURE:
    case types.DELETE_PERSON_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // Add cases for person types
    case types.FETCH_PERSON_TYPES_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PERSON_TYPES_SUCCESS:
      return { ...state, loading: false, personTypes: action.payload };

    case types.FETCH_PERSON_TYPES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Add cases for address types
    case types.FETCH_ADDRESS_TYPES_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_ADDRESS_TYPES_SUCCESS:
      return { ...state, loading: false, addressTypes: action.payload };

    case types.FETCH_ADDRESS_TYPES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.CLEAR_CREATED_PERSON:
      return {
        ...state,
        person: null,
      };

    default:
      return state;
  }
};

export default personReducer;
