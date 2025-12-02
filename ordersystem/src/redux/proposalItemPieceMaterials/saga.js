import { call, put, takeLatest } from 'redux-saga/effects';
import axios from '../../services/axiosInstance';
import * as actions from './actions';
import * as types from './types';

// Fetch materials for a proposal item piece
function* fetchProposalItemPieceMaterials(action) {
  try {
    const { proposalItemPieceId } = action.payload;
    const response = yield call(axios.get, `/proposal-item-pieces/${proposalItemPieceId}/materials`);
    yield put(actions.fetchProposalItemPieceMaterialsSuccess(proposalItemPieceId, response.data));
  } catch (error) {
    yield put(actions.fetchProposalItemPieceMaterialsFailure(error.message));
  }
}

// Add material to a proposal item piece
function* addProposalItemPieceMaterial(action) {
  try {
    const { proposalItemPieceId, materialId } = action.payload;
    const response = yield call(axios.post, `/proposal-item-pieces/${proposalItemPieceId}/materials`, {
      material_id: materialId
    });
    yield put(actions.addProposalItemPieceMaterialSuccess(proposalItemPieceId, response.data));
  } catch (error) {
    yield put(actions.addProposalItemPieceMaterialFailure(error.message));
  }
}

// Remove material from a proposal item piece
function* removeProposalItemPieceMaterial(action) {
  try {
    const { proposalItemPieceId, materialId } = action.payload;
    const response = yield call(axios.delete, `/proposal-item-pieces/${proposalItemPieceId}/materials/${materialId}`);
    yield put(actions.removeProposalItemPieceMaterialSuccess(proposalItemPieceId, response.data));
  } catch (error) {
    yield put(actions.removeProposalItemPieceMaterialFailure(error.message));
  }
}

// Update all materials for a proposal item piece
function* updateProposalItemPieceMaterials(action) {
  try {
    const { proposalItemPieceId, materialIds } = action.payload;
    const response = yield call(axios.put, `/proposal-item-pieces/${proposalItemPieceId}/materials`, {
      material_ids: materialIds
    });
    yield put(actions.updateProposalItemPieceMaterialsSuccess(proposalItemPieceId, response.data));
  } catch (error) {
    yield put(actions.updateProposalItemPieceMaterialsFailure(error.message));
  }
}

// Watcher sagas
export function* proposalItemPieceMaterialsSaga() {
  yield takeLatest(types.FETCH_PROPOSAL_ITEM_PIECE_MATERIALS_REQUEST, fetchProposalItemPieceMaterials);
  yield takeLatest(types.ADD_PROPOSAL_ITEM_PIECE_MATERIAL_REQUEST, addProposalItemPieceMaterial);
  yield takeLatest(types.REMOVE_PROPOSAL_ITEM_PIECE_MATERIAL_REQUEST, removeProposalItemPieceMaterial);
  yield takeLatest(types.UPDATE_PROPOSAL_ITEM_PIECE_MATERIALS_REQUEST, updateProposalItemPieceMaterials);
} 