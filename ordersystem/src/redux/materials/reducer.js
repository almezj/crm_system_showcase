import * as types from './types';

const initialState = {
    materials: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
    material: null
};

const materialsReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_MATERIALS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case types.FETCH_MATERIALS_SUCCESS:
            return {
                ...state,
                loading: false,
                materials: action.payload,
                error: null
            };
        case types.FETCH_MATERIALS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        case types.CREATE_MATERIAL_REQUEST:
            return {
                ...state,
                creating: true,
                error: null
            };
        case types.CREATE_MATERIAL_SUCCESS:
            return {
                ...state,
                creating: false,
                materials: [...state.materials, action.payload],
                material: action.payload,
                error: null
            };
        case types.CREATE_MATERIAL_FAILURE:
            return {
                ...state,
                creating: false,
                error: action.payload
            };
        case types.CLEAR_CREATED_MATERIAL:
            return {
                ...state,
                material: null
            };

        case types.UPDATE_MATERIAL_REQUEST:
            return {
                ...state,
                updating: true,
                error: null
            };
        case types.UPDATE_MATERIAL_SUCCESS:
            return {
                ...state,
                updating: false,
                materials: state.materials.map(material =>
                    material.id === action.payload.id ? action.payload : material
                ),
                error: null
            };
        case types.UPDATE_MATERIAL_FAILURE:
            return {
                ...state,
                updating: false,
                error: action.payload
            };

        case types.DELETE_MATERIAL_REQUEST:
            return {
                ...state,
                deleting: true,
                error: null
            };
        case types.DELETE_MATERIAL_SUCCESS:
            return {
                ...state,
                deleting: false,
                materials: state.materials.filter(material => material.id !== action.payload),
                error: null
            };
        case types.DELETE_MATERIAL_FAILURE:
            return {
                ...state,
                deleting: false,
                error: action.payload
            };

        default:
            return state;
    }
};

export default materialsReducer; 