import * as types from "./types";

const initialState = {
  pieces: {}, // Changed to object to store pieces by productId
  loading: false,
  error: null,
  createdPiece: null,
  pieceMaterials: {}, // New state for piece materials
  currentPiece: null // New state for single piece
};

const piecesReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch Pieces
    case types.FETCH_PIECES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.FETCH_PIECES_SUCCESS:
      return {
        ...state,
        pieces: {
          ...state.pieces,
          [action.payload.productId]: action.payload.pieces
        },
        loading: false,
        error: null,
      };
    case types.FETCH_PIECES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch Single Piece
    case types.FETCH_PIECE_BY_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        currentPiece: null,
      };
    case types.FETCH_PIECE_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        currentPiece: action.payload,
        error: null,
      };
    case types.FETCH_PIECE_BY_ID_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        currentPiece: null,
      };

    // Create Piece
    case types.CREATE_PIECE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.CREATE_PIECE_SUCCESS:
      return {
        ...state,
        createdPiece: action.payload,
        loading: false,
        error: null,
      };
    case types.CREATE_PIECE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update Piece
    case types.UPDATE_PIECE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.UPDATE_PIECE_SUCCESS:
      return {
        ...state,
        pieces: {
          ...state.pieces,
          [action.payload.product_id]: state.pieces[action.payload.product_id]?.map(piece => 
            piece.piece_id === action.payload.piece_id ? action.payload : piece
          ) || []
        },
        loading: false,
        error: null,
      };
    case types.UPDATE_PIECE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Delete Piece
    case types.DELETE_PIECE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.DELETE_PIECE_SUCCESS:
      return {
        ...state,
        pieces: {
          ...state.pieces,
          [action.payload.productId]: state.pieces[action.payload.productId]?.filter(piece => piece.piece_id !== action.payload.pieceId) || []
        },
        loading: false,
        error: null,
      };
    case types.DELETE_PIECE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Clear Created Piece
    case types.CLEAR_CREATED_PIECE:
      return {
        ...state,
        createdPiece: null,
      };

    // Piece Materials Cases
    case types.FETCH_PIECE_MATERIALS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.FETCH_PIECE_MATERIALS_SUCCESS:
      return {
        ...state,
        loading: false,
        pieceMaterials: {
          ...state.pieceMaterials,
          [action.payload.pieceId]: action.payload.materials
        }
      };

    case types.FETCH_PIECE_MATERIALS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.ADD_PIECE_MATERIAL_SUCCESS:
    case types.REMOVE_PIECE_MATERIAL_SUCCESS:
    case types.UPDATE_PIECE_MATERIALS_SUCCESS:
      return {
        ...state,
        pieceMaterials: {
          ...state.pieceMaterials,
          [action.payload.pieceId]: action.payload.materials
        }
      };

    case types.ADD_PIECE_MATERIAL_FAILURE:
    case types.REMOVE_PIECE_MATERIAL_FAILURE:
    case types.UPDATE_PIECE_MATERIALS_FAILURE:
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};

export default piecesReducer; 