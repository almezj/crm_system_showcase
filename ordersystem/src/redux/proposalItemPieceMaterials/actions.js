import * as types from './types';

// Fetch materials for a proposal item piece
export const fetchProposalItemPieceMaterialsRequest = (proposalItemPieceId) => ({
  type: types.FETCH_PROPOSAL_ITEM_PIECE_MATERIALS_REQUEST,
  payload: { proposalItemPieceId }
});

export const fetchProposalItemPieceMaterialsSuccess = (proposalItemPieceId, materials) => ({
  type: types.FETCH_PROPOSAL_ITEM_PIECE_MATERIALS_SUCCESS,
  payload: { proposalItemPieceId, materials }
});

export const fetchProposalItemPieceMaterialsFailure = (error) => ({
  type: types.FETCH_PROPOSAL_ITEM_PIECE_MATERIALS_FAILURE,
  payload: { error }
});

// Add material to a proposal item piece
export const addProposalItemPieceMaterialRequest = (proposalItemPieceId, materialId) => ({
  type: types.ADD_PROPOSAL_ITEM_PIECE_MATERIAL_REQUEST,
  payload: { proposalItemPieceId, materialId }
});

export const addProposalItemPieceMaterialSuccess = (proposalItemPieceId, materials) => ({
  type: types.ADD_PROPOSAL_ITEM_PIECE_MATERIAL_SUCCESS,
  payload: { proposalItemPieceId, materials }
});

export const addProposalItemPieceMaterialFailure = (error) => ({
  type: types.ADD_PROPOSAL_ITEM_PIECE_MATERIAL_FAILURE,
  payload: { error }
});

// Remove material from a proposal item piece
export const removeProposalItemPieceMaterialRequest = (proposalItemPieceId, materialId) => ({
  type: types.REMOVE_PROPOSAL_ITEM_PIECE_MATERIAL_REQUEST,
  payload: { proposalItemPieceId, materialId }
});

export const removeProposalItemPieceMaterialSuccess = (proposalItemPieceId, materials) => ({
  type: types.REMOVE_PROPOSAL_ITEM_PIECE_MATERIAL_SUCCESS,
  payload: { proposalItemPieceId, materials }
});

export const removeProposalItemPieceMaterialFailure = (error) => ({
  type: types.REMOVE_PROPOSAL_ITEM_PIECE_MATERIAL_FAILURE,
  payload: { error }
});

// Update all materials for a proposal item piece
export const updateProposalItemPieceMaterialsRequest = (proposalItemPieceId, materialIds) => ({
  type: types.UPDATE_PROPOSAL_ITEM_PIECE_MATERIALS_REQUEST,
  payload: { proposalItemPieceId, materialIds }
});

export const updateProposalItemPieceMaterialsSuccess = (proposalItemPieceId, materials) => ({
  type: types.UPDATE_PROPOSAL_ITEM_PIECE_MATERIALS_SUCCESS,
  payload: { proposalItemPieceId, materials }
});

export const updateProposalItemPieceMaterialsFailure = (error) => ({
  type: types.UPDATE_PROPOSAL_ITEM_PIECE_MATERIALS_FAILURE,
  payload: { error }
}); 