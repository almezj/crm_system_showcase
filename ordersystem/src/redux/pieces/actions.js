import * as types from "./types";

// Fetch Pieces
export const fetchPiecesRequest = (productId) => ({
  type: types.FETCH_PIECES_REQUEST,
  payload: productId,
});

export const fetchPiecesSuccess = (productId, pieces) => ({
  type: types.FETCH_PIECES_SUCCESS,
  payload: { productId, pieces },
});

export const fetchPiecesFailure = (error) => ({
  type: types.FETCH_PIECES_FAILURE,
  payload: error,
});

// Fetch Single Piece
export const fetchPieceByIdRequest = (pieceId) => ({
  type: types.FETCH_PIECE_BY_ID_REQUEST,
  payload: pieceId,
});

export const fetchPieceByIdSuccess = (piece) => ({
  type: types.FETCH_PIECE_BY_ID_SUCCESS,
  payload: piece,
});

export const fetchPieceByIdFailure = (error) => ({
  type: types.FETCH_PIECE_BY_ID_FAILURE,
  payload: error,
});

// Create Piece
export const createPieceRequest = (piece) => ({
  type: types.CREATE_PIECE_REQUEST,
  payload: piece,
});

export const createPieceSuccess = (piece) => ({
  type: types.CREATE_PIECE_SUCCESS,
  payload: piece,
});

export const createPieceFailure = (error) => ({
  type: types.CREATE_PIECE_FAILURE,
  payload: error,
});

// Update Piece
export const updatePieceRequest = (piece) => ({
  type: types.UPDATE_PIECE_REQUEST,
  payload: piece,
});

export const updatePieceSuccess = (piece) => ({
  type: types.UPDATE_PIECE_SUCCESS,
  payload: piece,
});

export const updatePieceFailure = (error) => ({
  type: types.UPDATE_PIECE_FAILURE,
  payload: error,
});

// Delete Piece
export const deletePieceRequest = (data) => ({
  type: types.DELETE_PIECE_REQUEST,
  payload: data,
});

export const deletePieceSuccess = (productId, pieceId) => ({
  type: types.DELETE_PIECE_SUCCESS,
  payload: { productId, pieceId },
});

export const deletePieceFailure = (error) => ({
  type: types.DELETE_PIECE_FAILURE,
  payload: error,
});

// Clear Created Piece
export const clearCreatedPiece = () => ({
  type: types.CLEAR_CREATED_PIECE,
});

// Piece Materials Actions
export const fetchPieceMaterialsRequest = (pieceId) => ({
  type: types.FETCH_PIECE_MATERIALS_REQUEST,
  payload: pieceId
});

export const fetchPieceMaterialsSuccess = (pieceId, materials) => ({
  type: types.FETCH_PIECE_MATERIALS_SUCCESS,
  payload: { pieceId, materials }
});

export const fetchPieceMaterialsFailure = (error) => ({
  type: types.FETCH_PIECE_MATERIALS_FAILURE,
  payload: error
});

export const addPieceMaterialRequest = (pieceId, materialId) => ({
  type: types.ADD_PIECE_MATERIAL_REQUEST,
  payload: { pieceId, materialId }
});

export const addPieceMaterialSuccess = (pieceId, materials) => ({
  type: types.ADD_PIECE_MATERIAL_SUCCESS,
  payload: { pieceId, materials }
});

export const addPieceMaterialFailure = (error) => ({
  type: types.ADD_PIECE_MATERIAL_FAILURE,
  payload: error
});

export const removePieceMaterialRequest = (pieceId, materialId) => ({
  type: types.REMOVE_PIECE_MATERIAL_REQUEST,
  payload: { pieceId, materialId }
});

export const removePieceMaterialSuccess = (pieceId, materials) => ({
  type: types.REMOVE_PIECE_MATERIAL_SUCCESS,
  payload: { pieceId, materials }
});

export const removePieceMaterialFailure = (error) => ({
  type: types.REMOVE_PIECE_MATERIAL_FAILURE,
  payload: error
});

export const updatePieceMaterialsRequest = (pieceId, materialIds) => ({
  type: types.UPDATE_PIECE_MATERIALS_REQUEST,
  payload: { pieceId, materialIds }
});

export const updatePieceMaterialsSuccess = (pieceId, materials) => ({
  type: types.UPDATE_PIECE_MATERIALS_SUCCESS,
  payload: { pieceId, materials }
});

export const updatePieceMaterialsFailure = (error) => ({
  type: types.UPDATE_PIECE_MATERIALS_FAILURE,
  payload: error
}); 