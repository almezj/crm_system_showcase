import * as types from "./types";

// Fetch Piece Images
export const fetchPieceImagesRequest = (pieceId) => ({
  type: types.FETCH_PIECE_IMAGES_REQUEST,
  payload: pieceId,
});

export const fetchPieceImagesSuccess = (pieceId, images) => ({
  type: types.FETCH_PIECE_IMAGES_SUCCESS,
  payload: { pieceId, images },
});

export const fetchPieceImagesFailure = (error) => ({
  type: types.FETCH_PIECE_IMAGES_FAILURE,
  payload: error,
});

// Upload Piece Image
export const uploadPieceImageRequest = (pieceId, formData) => ({
  type: types.UPLOAD_PIECE_IMAGE_REQUEST,
  payload: { pieceId, formData },
});

export const uploadPieceImageSuccess = (pieceId, image) => ({
  type: types.UPLOAD_PIECE_IMAGE_SUCCESS,
  payload: { pieceId, image },
});

export const uploadPieceImageFailure = (error) => ({
  type: types.UPLOAD_PIECE_IMAGE_FAILURE,
  payload: error,
});

// Update Piece Image
export const updatePieceImageRequest = (imageId, data) => ({
  type: types.UPDATE_PIECE_IMAGE_REQUEST,
  payload: { imageId, data },
});

export const updatePieceImageSuccess = (imageId, data) => ({
  type: types.UPDATE_PIECE_IMAGE_SUCCESS,
  payload: { imageId, data },
});

export const updatePieceImageFailure = (error) => ({
  type: types.UPDATE_PIECE_IMAGE_FAILURE,
  payload: error,
});

// Delete Piece Image
export const deletePieceImageRequest = (imageId) => ({
  type: types.DELETE_PIECE_IMAGE_REQUEST,
  payload: imageId,
});

export const deletePieceImageSuccess = (imageId) => ({
  type: types.DELETE_PIECE_IMAGE_SUCCESS,
  payload: imageId,
});

export const deletePieceImageFailure = (error) => ({
  type: types.DELETE_PIECE_IMAGE_FAILURE,
  payload: error,
});

// Reorder Piece Images
export const reorderPieceImagesRequest = (pieceId, imageOrder) => ({
  type: types.REORDER_PIECE_IMAGES_REQUEST,
  payload: { pieceId, imageOrder },
});

export const reorderPieceImagesSuccess = (pieceId, imageOrder) => ({
  type: types.REORDER_PIECE_IMAGES_SUCCESS,
  payload: { pieceId, imageOrder },
});

export const reorderPieceImagesFailure = (error) => ({
  type: types.REORDER_PIECE_IMAGES_FAILURE,
  payload: error,
});

// Set Primary Piece Image
export const setPrimaryPieceImageRequest = (imageId) => ({
  type: types.SET_PRIMARY_PIECE_IMAGE_REQUEST,
  payload: imageId,
});

export const setPrimaryPieceImageSuccess = (imageId) => ({
  type: types.SET_PRIMARY_PIECE_IMAGE_SUCCESS,
  payload: imageId,
});

export const setPrimaryPieceImageFailure = (error) => ({
  type: types.SET_PRIMARY_PIECE_IMAGE_FAILURE,
  payload: error,
}); 