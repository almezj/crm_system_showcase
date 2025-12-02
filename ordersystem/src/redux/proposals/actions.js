import * as types from "./types";
import api from "../../services/api";

// PDF Snapshots
export const fetchPdfSnapshotsRequest = (proposalId) => ({
  type: types.FETCH_PDF_SNAPSHOTS_REQUEST,
  payload: proposalId,
});

export const fetchPdfSnapshotsSuccess = (snapshots) => ({
  type: types.FETCH_PDF_SNAPSHOTS_SUCCESS,
  payload: snapshots,
});

export const fetchPdfSnapshotsFailure = (error) => ({
  type: types.FETCH_PDF_SNAPSHOTS_FAILURE,
  payload: error,
});

export const fetchPdfSnapshots = (proposalId) => ({
  type: types.FETCH_PDF_SNAPSHOTS_REQUEST,
  payload: proposalId,
});

// Fetch Proposals
export const fetchProposalsRequest = (page = 1, limit = 10) => ({
  type: types.FETCH_PROPOSALS_REQUEST,
  payload: { page, limit },
});
export const fetchProposalsSuccess = (data) => ({
  type: types.FETCH_PROPOSALS_SUCCESS,
  payload: data,
});
export const fetchProposalsFailure = (error) => ({
  type: types.FETCH_PROPOSALS_FAILURE,
  payload: error,
});

// Fetch Proposal by ID
export const fetchProposalByIdRequest = (id) => ({
  type: types.FETCH_PROPOSAL_BY_ID_REQUEST,
  payload: id,
});
export const fetchProposalByIdSuccess = (proposal) => ({
  type: types.FETCH_PROPOSAL_BY_ID_SUCCESS,
  payload: proposal,
});
export const fetchProposalByIdFailure = (error) => ({
  type: types.FETCH_PROPOSAL_BY_ID_FAILURE,
  payload: error,
});

// Create Proposal
export const createProposalRequest = (proposal) => ({
  type: types.CREATE_PROPOSAL_REQUEST,
  payload: proposal,
});
export const createProposalSuccess = (proposal) => ({
  type: types.CREATE_PROPOSAL_SUCCESS,
  payload: proposal,
});
export const createProposalFailure = (error) => ({
  type: types.CREATE_PROPOSAL_FAILURE,
  payload: error,
});

// Update Proposal
export const updateProposalRequest = (proposal) => ({
  type: types.UPDATE_PROPOSAL_REQUEST,
  payload: proposal,
});
export const updateProposalSuccess = (proposal) => ({
  type: types.UPDATE_PROPOSAL_SUCCESS,
  payload: proposal,
});
export const updateProposalFailure = (error) => ({
  type: types.UPDATE_PROPOSAL_FAILURE,
  payload: error,
});

// Delete Proposal
export const deleteProposalRequest = (id) => ({
  type: types.DELETE_PROPOSAL_REQUEST,
  payload: id,
});
export const deleteProposalSuccess = (id) => ({
  type: types.DELETE_PROPOSAL_SUCCESS,
  payload: id,
});
export const deleteProposalFailure = (error) => ({
  type: types.DELETE_PROPOSAL_FAILURE,
  payload: error,
});

// Generate Proposal PDF
export const generateProposalPDFRequest = (id, templateType, options = {}) => ({
  type: types.GENERATE_PROPOSAL_PDF_REQUEST,
  payload: { id, templateType, options },
});
export const generateProposalPDFSuccess = (proposalId, pdfUrl) => ({
  type: types.GENERATE_PROPOSAL_PDF_SUCCESS,
  payload: { proposalId, pdfUrl },
});
export const generateProposalPDFFailure = (error) => ({
  type: types.GENERATE_PROPOSAL_PDF_FAILURE,
  payload: error,
});

// Convert Proposal to Order
export const convertProposalToOrderRequest = (id) => ({
  type: types.CONVERT_PROPOSAL_TO_ORDER_REQUEST,
  payload: id,
});
export const convertProposalToOrderSuccess = (order) => ({
  type: types.CONVERT_PROPOSAL_TO_ORDER_SUCCESS,
  payload: order,
});
export const convertProposalToOrderFailure = (error) => ({
  type: types.CONVERT_PROPOSAL_TO_ORDER_FAILURE,
  payload: error,
});

// Upload Item Image
export const uploadItemImageRequest = (proposalItemId, imageData) => ({
  type: types.UPLOAD_ITEM_IMAGE_REQUEST,
  payload: { proposalItemId, imageData },
});
export const uploadItemImageSuccess = (proposalItemId, image) => ({
  type: types.UPLOAD_ITEM_IMAGE_SUCCESS,
  payload: { proposalItemId, image },
});
export const uploadItemImageFailure = (proposalItemId, error) => ({
  type: types.UPLOAD_ITEM_IMAGE_FAILURE,
  payload: { proposalItemId, error },
});

// Upload Temp Image
export const uploadTempImageRequest = (imageData) => ({
  type: types.UPLOAD_TEMP_IMAGE_REQUEST,
  payload: imageData,
});

export const uploadTempImageSuccess = (image) => ({
  type: types.UPLOAD_TEMP_IMAGE_SUCCESS,
  payload: image,
});

export const uploadTempImageFailure = (error) => ({
  type: types.UPLOAD_TEMP_IMAGE_FAILURE,
  payload: error,
});

export const clearProposalPdf = () => ({
  type: types.CLEAR_PROPOSAL_PDF,
});

// Update image description
export const updateItemImageDescription = (imageId, description) => ({
  type: types.UPDATE_ITEM_IMAGE_DESCRIPTION_REQUEST,
  payload: { imageId, description }
});

export const updateItemImageDescriptionSuccess = (imageId, description) => ({
  type: types.UPDATE_ITEM_IMAGE_DESCRIPTION_SUCCESS,
  payload: { imageId, description }
});

export const updateItemImageDescriptionFailure = (error) => ({
  type: types.UPDATE_ITEM_IMAGE_DESCRIPTION_FAILURE,
  payload: error
});

// Reorder images
export const reorderItemImages = (proposalItemId, imageOrder) => ({
  type: types.REORDER_ITEM_IMAGES_REQUEST,
  payload: { proposalItemId, imageOrder }
});

export const reorderItemImagesSuccess = (proposalItemId, imageOrder) => ({
  type: types.REORDER_ITEM_IMAGES_SUCCESS,
  payload: { proposalItemId, imageOrder }
});

export const reorderItemImagesFailure = (error) => ({
  type: types.REORDER_ITEM_IMAGES_FAILURE,
  payload: error
});

// Delete image
export const deleteItemImage = (imageId) => ({
  type: types.DELETE_ITEM_IMAGE_REQUEST,
  payload: { imageId }
});

export const deleteItemImageSuccess = (imageId) => ({
  type: types.DELETE_ITEM_IMAGE_SUCCESS,
  payload: { imageId }
});

export const deleteItemImageFailure = (error) => ({
  type: types.DELETE_ITEM_IMAGE_FAILURE,
  payload: error
});

// Upload additional image
export const uploadAdditionalItemImage = (proposalItemId, formData) => ({
  type: types.UPLOAD_ADDITIONAL_ITEM_IMAGE_REQUEST,
  payload: { proposalItemId, formData }
});

export const uploadAdditionalItemImageSuccess = (proposalItemId, image) => ({
  type: types.UPLOAD_ADDITIONAL_ITEM_IMAGE_SUCCESS,
  payload: { proposalItemId, image }
});

export const uploadAdditionalItemImageFailure = (error) => ({
  type: types.UPLOAD_ADDITIONAL_ITEM_IMAGE_FAILURE,
  payload: error
});

// Upload custom section image
export const uploadCustomSectionImageRequest = (imageData) => ({
  type: types.UPLOAD_CUSTOM_SECTION_IMAGE_REQUEST,
  payload: imageData,
});

export const uploadCustomSectionImageSuccess = (image) => ({
  type: types.UPLOAD_CUSTOM_SECTION_IMAGE_SUCCESS,
  payload: image,
});

export const uploadCustomSectionImageFailure = (error) => ({
  type: types.UPLOAD_CUSTOM_SECTION_IMAGE_FAILURE,
  payload: error,
});

// Optimistic update for proposal state
export const updateProposalOptimistically = (updatedProposal) => ({
  type: types.UPDATE_PROPOSAL_OPTIMISTICALLY,
  payload: updatedProposal
});
