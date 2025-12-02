import { call, put, takeLatest } from "redux-saga/effects";
import * as actions from "./actions";
import * as types from "./types";
import axios from "../../services/axiosInstance";

// Fetch Piece Images
function* fetchPieceImages(action) {
  try {
    const pieceId = action.payload;
    const response = yield call(axios.get, `/pieces/${pieceId}/images`);
    yield put(actions.fetchPieceImagesSuccess(pieceId, response.data));
  } catch (error) {
    yield put(actions.fetchPieceImagesFailure(error.message));
  }
}

// Upload Piece Image
function* uploadPieceImage(action) {
  try {
    const { pieceId, formData } = action.payload;
    const response = yield call(axios.post, `/pieces/${pieceId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    yield put(actions.uploadPieceImageSuccess(pieceId, response.data));
  } catch (error) {
    yield put(actions.uploadPieceImageFailure(error.message));
  }
}

// Update Piece Image
function* updatePieceImage(action) {
  try {
    const { imageId, data } = action.payload;
    const response = yield call(axios.patch, `/piece-images/${imageId}`, data);
    yield put(actions.updatePieceImageSuccess(imageId, data));
  } catch (error) {
    yield put(actions.updatePieceImageFailure(error.message));
  }
}

// Delete Piece Image
function* deletePieceImage(action) {
  try {
    const imageId = action.payload;
    yield call(axios.delete, `/piece-images/${imageId}`);
    yield put(actions.deletePieceImageSuccess(imageId));
  } catch (error) {
    yield put(actions.deletePieceImageFailure(error.message));
  }
}

// Reorder Piece Images
function* reorderPieceImages(action) {
  try {
    const { pieceId, imageOrder } = action.payload;
    yield call(axios.post, `/pieces/${pieceId}/images/reorder`, { image_order: imageOrder });
    yield put(actions.reorderPieceImagesSuccess(pieceId, imageOrder));
  } catch (error) {
    yield put(actions.reorderPieceImagesFailure(error.message));
  }
}

// Set Primary Piece Image
function* setPrimaryPieceImage(action) {
  try {
    const imageId = action.payload;
    yield call(axios.post, `/piece-images/${imageId}/primary`);
    yield put(actions.setPrimaryPieceImageSuccess(imageId));
  } catch (error) {
    yield put(actions.setPrimaryPieceImageFailure(error.message));
  }
}

export default function* pieceImagesSaga() {
  yield takeLatest(types.FETCH_PIECE_IMAGES_REQUEST, fetchPieceImages);
  yield takeLatest(types.UPLOAD_PIECE_IMAGE_REQUEST, uploadPieceImage);
  yield takeLatest(types.UPDATE_PIECE_IMAGE_REQUEST, updatePieceImage);
  yield takeLatest(types.DELETE_PIECE_IMAGE_REQUEST, deletePieceImage);
  yield takeLatest(types.REORDER_PIECE_IMAGES_REQUEST, reorderPieceImages);
  yield takeLatest(types.SET_PRIMARY_PIECE_IMAGE_REQUEST, setPrimaryPieceImage);
} 