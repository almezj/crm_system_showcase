import * as types from './types';

const initialState = {
  proposalItemPieceMaterials: {}, // Key: proposalItemPieceId, Value: materials array
  loading: false,
  error: null
};

const proposalItemPieceMaterialsReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch materials
    case types.FETCH_PROPOSAL_ITEM_PIECE_MATERIALS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.FETCH_PROPOSAL_ITEM_PIECE_MATERIALS_SUCCESS:
      return {
        ...state,
        loading: false,
        proposalItemPieceMaterials: {
          ...state.proposalItemPieceMaterials,
          [action.payload.proposalItemPieceId]: action.payload.materials
        }
      };

    case types.FETCH_PROPOSAL_ITEM_PIECE_MATERIALS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    // Add material
    case types.ADD_PROPOSAL_ITEM_PIECE_MATERIAL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.ADD_PROPOSAL_ITEM_PIECE_MATERIAL_SUCCESS:
      return {
        ...state,
        loading: false,
        proposalItemPieceMaterials: {
          ...state.proposalItemPieceMaterials,
          [action.payload.proposalItemPieceId]: action.payload.materials
        }
      };

    case types.ADD_PROPOSAL_ITEM_PIECE_MATERIAL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    // Remove material
    case types.REMOVE_PROPOSAL_ITEM_PIECE_MATERIAL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.REMOVE_PROPOSAL_ITEM_PIECE_MATERIAL_SUCCESS:
      return {
        ...state,
        loading: false,
        proposalItemPieceMaterials: {
          ...state.proposalItemPieceMaterials,
          [action.payload.proposalItemPieceId]: action.payload.materials
        }
      };

    case types.REMOVE_PROPOSAL_ITEM_PIECE_MATERIAL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    // Update materials
    case types.UPDATE_PROPOSAL_ITEM_PIECE_MATERIALS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.UPDATE_PROPOSAL_ITEM_PIECE_MATERIALS_SUCCESS:
      return {
        ...state,
        loading: false,
        proposalItemPieceMaterials: {
          ...state.proposalItemPieceMaterials,
          [action.payload.proposalItemPieceId]: action.payload.materials
        }
      };

    case types.UPDATE_PROPOSAL_ITEM_PIECE_MATERIALS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    default:
      return state;
  }
};

export default proposalItemPieceMaterialsReducer; 