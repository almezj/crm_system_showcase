import { call, put, takeLatest } from "redux-saga/effects";
import * as actions from "./actions";
import * as types from "./types";
import axios from "../../services/axiosInstance";
import { extractErrorMessage, extractErrorDetails } from "../../utils/errorUtils";

// Fetch Pieces for a Product
function* fetchPieces(action) {
  try {
    const productId = action.payload;
    const response = yield call(axios.get, `/products/${productId}/pieces`);
    yield put(actions.fetchPiecesSuccess(productId, response.data));
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Fetching pieces");
    const errorDetails = extractErrorDetails(error, "fetchPieces");
    console.error("Error details:", errorDetails);
    yield put(actions.fetchPiecesFailure(errorMessage));
  }
}

// Fetch Single Piece by ID
function* fetchPieceById(action) {
  try {
    const pieceId = action.payload;
    const response = yield call(axios.get, `/pieces/${pieceId}`);
    yield put(actions.fetchPieceByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchPieceByIdFailure(error.message));
  }
}

// Create Piece
function* createPiece(action) {
  console.log('=== PIECE CREATION SAGA START ===');
  console.log('Action payload:', action.payload);
  
  try {
    console.log('Making POST request to /pieces...');
    const response = yield call(axios.post, "/pieces", action.payload);
    console.log('Response received:', response.data);
    yield put(actions.createPieceSuccess(response.data));
    // Fetch updated pieces list for the product
    yield put(actions.fetchPiecesRequest(action.payload.product_id));
    console.log('=== PIECE CREATION SAGA SUCCESS ===');
  } catch (error) {
    console.log('=== PIECE CREATION SAGA ERROR ===');
    console.log('Error:', error);
    console.log('Error message:', error.message);
    const errorMessage = extractErrorMessage(error, "Creating piece");
    const errorDetails = extractErrorDetails(error, "createPiece");
    console.error("Error details:", errorDetails);
    yield put(actions.createPieceFailure(errorMessage));
  }
}

// Update Piece
function* updatePiece(action) {
  try {
    const { piece_id, ...pieceData } = action.payload;
    const response = yield call(axios.patch, `/pieces/${piece_id}`, pieceData);
    yield put(actions.updatePieceSuccess(response.data));
    // Fetch updated pieces list
    yield put(actions.fetchPiecesRequest(action.payload.product_id));
  } catch (error) {
    yield put(actions.updatePieceFailure(error.message));
  }
}

// Delete Piece
function* deletePiece(action) {
  try {
    const { productId, pieceId } = action.payload;
    yield call(axios.delete, `/pieces/${pieceId}`);
    yield put(actions.deletePieceSuccess(productId, pieceId));
  } catch (error) {
    yield put(actions.deletePieceFailure(error.message));
  }
}

// Piece Materials Sagas
function* fetchPieceMaterials(action) {
  try {
    const pieceId = action.payload;
    const response = yield call(axios.get, `/pieces/${pieceId}/materials`);
    yield put(actions.fetchPieceMaterialsSuccess(pieceId, response.data));
  } catch (error) {
    yield put(actions.fetchPieceMaterialsFailure(error.message));
  }
}

function* addPieceMaterial(action) {
  try {
    const { pieceId, materialId } = action.payload;
    const response = yield call(axios.post, `/pieces/${pieceId}/materials`, { material_id: materialId });
    yield put(actions.addPieceMaterialSuccess(pieceId, response.data));
  } catch (error) {
    yield put(actions.addPieceMaterialFailure(error.message));
  }
}

function* removePieceMaterial(action) {
  try {
    const { pieceId, materialId } = action.payload;
    const response = yield call(axios.delete, `/pieces/${pieceId}/materials/${materialId}`);
    yield put(actions.removePieceMaterialSuccess(pieceId, response.data));
  } catch (error) {
    yield put(actions.removePieceMaterialFailure(error.message));
  }
}

function* updatePieceMaterials(action) {
  try {
    const { pieceId, materialIds } = action.payload;
    const response = yield call(axios.put, `/pieces/${pieceId}/materials`, { material_ids: materialIds });
    yield put(actions.updatePieceMaterialsSuccess(pieceId, response.data));
  } catch (error) {
    yield put(actions.updatePieceMaterialsFailure(error.message));
  }
}

export default function* piecesSaga() {
  yield takeLatest(types.FETCH_PIECES_REQUEST, fetchPieces);
  yield takeLatest(types.FETCH_PIECE_BY_ID_REQUEST, fetchPieceById);
  yield takeLatest(types.CREATE_PIECE_REQUEST, createPiece);
  yield takeLatest(types.UPDATE_PIECE_REQUEST, updatePiece);
  yield takeLatest(types.DELETE_PIECE_REQUEST, deletePiece);
  
  // Piece Materials
  yield takeLatest(types.FETCH_PIECE_MATERIALS_REQUEST, fetchPieceMaterials);
  yield takeLatest(types.ADD_PIECE_MATERIAL_REQUEST, addPieceMaterial);
  yield takeLatest(types.REMOVE_PIECE_MATERIAL_REQUEST, removePieceMaterial);
  yield takeLatest(types.UPDATE_PIECE_MATERIALS_REQUEST, updatePieceMaterials);
} 