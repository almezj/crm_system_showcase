import { call, put, takeLatest, select } from "redux-saga/effects";
import * as types from "./types";
import * as actions from "./actions";
import axios from "../../services/axiosInstance";
import qs from 'qs';
import api from "../../services/api";
import { extractErrorMessage, extractErrorDetails } from "../../utils/errorUtils";

// Fetch Proposals
function* fetchProposals(action) {
  try {
    const { page, limit } = action.payload;
    const response = yield call(axios.get, `/proposals?page=${page}&limit=${limit}`);
    
    // Check if response.data has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      console.error("API returned unexpected data structure:", response.data);
      yield put(actions.fetchProposalsFailure("Invalid response format from server"));
      return;
    }
    
    // Ensure we have the expected structure
    const data = {
      proposals: response.data.proposals || [],
      pagination: response.data.pagination || {
        current_page: 1,
        per_page: limit,
        total: 0,
        total_pages: 0
      }
    };
    
    yield put(actions.fetchProposalsSuccess(data));
  } catch (error) {
    console.error("Error fetching proposals:", error);
    const errorMessage = extractErrorMessage(error, "Fetching proposals");
    const errorDetails = extractErrorDetails(error, "fetchProposals");
    console.error("Error details:", errorDetails);
    yield put(actions.fetchProposalsFailure(errorMessage));
  }
}

// Fetch Proposal by ID
function* fetchProposalById(action) {
  try {
    console.log("Saga: Fetching proposal with ID:", action.payload);
    const response = yield call(axios.get, `/proposals/${action.payload}`);
    console.log("Saga: API response:", response.data);
    
    // Check if response.data is valid
    if (!response.data || typeof response.data !== 'object') {
      console.error("Saga: Invalid response data:", response.data);
      yield put(actions.fetchProposalByIdFailure("Invalid response format from server"));
      return;
    }
    
    yield put(actions.fetchProposalByIdSuccess(response.data));
  } catch (error) {
    console.error("Saga: Error fetching proposal:", error);
    console.error("Saga: Error response:", error.response?.data);
    const errorMessage = extractErrorMessage(error, "Fetching proposal details");
    const errorDetails = extractErrorDetails(error, "fetchProposalById");
    console.error("Error details:", errorDetails);
    yield put(actions.fetchProposalByIdFailure(errorMessage));
  }
}

// Create Proposal
function* createProposal(action) {
  try {
    console.log("Creating proposal with payload:", JSON.stringify(action.payload, null, 2));
    const response = yield call(axios.post, "/proposals", action.payload);
    console.log("Proposal creation response:", response.data);
    yield put(actions.createProposalSuccess(response.data));
  } catch (error) {
    console.error("Proposal creation error:", error);
    yield put(actions.createProposalFailure(error.message));
  }
}

// Update Proposal
function* updateProposal(action) {
  try {
    const response = yield call(
      axios.patch,
      `/proposals/${action.payload.id}`,
      action.payload
    );
    yield put(actions.updateProposalSuccess(response.data));
  } catch (error) {
    yield put(actions.updateProposalFailure(error.message));
  }
}

// Delete Proposal
function* deleteProposal(action) {
  try {
    yield call(axios.delete, `/proposals/${action.payload}`);
    yield put(actions.deleteProposalSuccess(action.payload));
  } catch (error) {
    yield put(actions.deleteProposalFailure(error.message));
  }
}

// Generate Proposal PDF
function* generateProposalPDF(action) {
  try {
    const { id, templateType, options } = action.payload;
    console.log("Generating PDF for proposal:", id, "with template:", templateType, "and options:", options);
    // Build query string from options using qs
    // Handle customSections and prettyProposalOptions separately to ensure proper serialization
    const { customSections, prettyProposalOptions, ...otherOptions } = options;
    const params = qs.stringify({ 
      type: templateType, 
      ...otherOptions,
      customSections: customSections ? JSON.stringify(customSections) : undefined,
      prettyProposalOptions: prettyProposalOptions ? JSON.stringify(prettyProposalOptions) : undefined
    }, { arrayFormat: 'brackets' });
    
    const response = yield call(
      axios.get,
      `/proposals/${id}/generate-pdf?${params}`
    );
    console.log("PDF generation response:", response.data);
    
    if (response.data.type === 'download') {
      // Large file - trigger download
      const downloadUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/proposals/${id}/download-pdf?${params}`;
      window.open(downloadUrl, '_blank');
      yield put(actions.generateProposalPDFSuccess(id, null)); // No inline display
    } else {
      // Small file - display inline
      yield put(actions.generateProposalPDFSuccess(id, response.data.pdf_url));
    }
    
    // Refresh PDF snapshots to show the new version in history
    yield put(actions.fetchPdfSnapshots(id));
  } catch (error) {
    console.error("PDF generation error:", error);
    yield put(actions.generateProposalPDFFailure(error.message));
  }
}

// Convert Proposal to Order
function* convertProposalToOrder(action) {
  try {
    const response = yield call(axios.post, `/orders/convert`, {
      proposal_id: action.payload,
    });
    yield put(actions.convertProposalToOrderSuccess(response.data));
  } catch (error) {
    yield put(actions.convertProposalToOrderFailure(error.message));
  }
}

// Upload Item Image
function* uploadItemImage(action) {
  const { proposalItemId, imageData } = action.payload;
  const formData = new FormData();
  formData.append("image", imageData.file);
  formData.append("description", imageData.description || "");

  try {
    const response = yield call(
      axios.post,
      `/proposals/${proposalItemId}/upload-item-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    yield put(
      actions.uploadItemImageSuccess(proposalItemId, response.data.image)
    );
  } catch (error) {
    yield put(actions.uploadItemImageFailure(proposalItemId, error.message));
  }
}

function* uploadTempImage(action) {
  console.log("Uploading temp image", action);
  const { itemTempKey, file, description } = action.payload;
  const formData = new FormData();
  formData.append("image", file);
  formData.append("description", description || "");
  formData.append("temp_key", itemTempKey);
  console.log("Uploading temp image", formData);

  try {
    const response = yield call(
      axios.post,
      `/proposals/temp-upload-item-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    yield put(actions.uploadTempImageSuccess(response.data.image));
  } catch (error) {
    yield put(actions.uploadTempImageFailure(error.message));
  }
}

// Update image description
function* updateItemImageDescription(action) {
  try {
    const { imageId, description } = action.payload;
    const response = yield call(
      axios.patch,
      `/proposals/items/images/${imageId}/description`,
      { description }
    );
    yield put(actions.updateItemImageDescriptionSuccess(imageId, description));
  } catch (error) {
    yield put(actions.updateItemImageDescriptionFailure(error.message));
  }
}

// Upload custom section image
function* uploadCustomSectionImage(action) {
  try {
    const { file, description } = action.payload;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description || "");

    const response = yield call(
      axios.post,
      `/proposals/upload-custom-section-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    yield put(actions.uploadCustomSectionImageSuccess(response.data));
  } catch (error) {
    yield put(actions.uploadCustomSectionImageFailure(error.message));
  }
}

// Reorder images
function* reorderItemImages(action) {
  try {
    const { proposalItemId, imageOrder } = action.payload;
    const response = yield call(
      axios.post,
      `/proposals/items/${proposalItemId}/images/reorder`,
      { image_order: imageOrder }
    );
    yield put(actions.reorderItemImagesSuccess(proposalItemId, imageOrder));
    
    // Don't refetch here - the updateProposal saga already handles state updates
    // Refetching here causes state mutations when called after updateProposal
  } catch (error) {
    yield put(actions.reorderItemImagesFailure(error.message));
  }
}

// Delete image
function* deleteItemImage(action) {
  try {
    const { imageId } = action.payload;
    const response = yield call(
      axios.delete,
      `/proposals/items/images/${imageId}`
    );
    yield put(actions.deleteItemImageSuccess(imageId));
  } catch (error) {
    yield put(actions.deleteItemImageFailure(error.message));
  }
}

// Upload additional image
function* uploadAdditionalItemImage(action) {
  try {
    const { proposalItemId, formData } = action.payload;
    const response = yield call(
      axios.post,
      `/proposals/items/${proposalItemId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    yield put(actions.uploadAdditionalItemImageSuccess(proposalItemId, response.data));
  } catch (error) {
    yield put(actions.uploadAdditionalItemImageFailure(error.message));
  }
}

// PDF Snapshots Saga
function* fetchPdfSnapshotsSaga(action) {
  try {
    console.log('fetchPdfSnapshotsSaga: Starting for proposalId:', action.payload);
    const response = yield call(axios.get, `/proposals/${action.payload}/pdf-snapshots`);
    console.log('fetchPdfSnapshotsSaga: Response received:', response.data);
    yield put(actions.fetchPdfSnapshotsSuccess(response.data));
  } catch (error) {
    console.error('fetchPdfSnapshotsSaga: Error occurred:', error);
    yield put(actions.fetchPdfSnapshotsFailure(error.message));
  }
}

export default function* proposalSaga() {
  yield takeLatest(types.FETCH_PROPOSALS_REQUEST, fetchProposals);
  yield takeLatest(types.FETCH_PROPOSAL_BY_ID_REQUEST, fetchProposalById);
  yield takeLatest(types.CREATE_PROPOSAL_REQUEST, createProposal);
  yield takeLatest(types.UPDATE_PROPOSAL_REQUEST, updateProposal);
  yield takeLatest(types.DELETE_PROPOSAL_REQUEST, deleteProposal);
  yield takeLatest(types.GENERATE_PROPOSAL_PDF_REQUEST, generateProposalPDF);
  yield takeLatest(
    types.CONVERT_PROPOSAL_TO_ORDER_REQUEST,
    convertProposalToOrder
  );
  yield takeLatest(types.UPLOAD_ITEM_IMAGE_REQUEST, uploadItemImage);
  yield takeLatest(types.UPLOAD_TEMP_IMAGE_REQUEST, uploadTempImage);
  yield takeLatest(types.UPDATE_ITEM_IMAGE_DESCRIPTION_REQUEST, updateItemImageDescription);
  yield takeLatest(types.UPLOAD_CUSTOM_SECTION_IMAGE_REQUEST, uploadCustomSectionImage);
  yield takeLatest(types.REORDER_ITEM_IMAGES_REQUEST, reorderItemImages);
  yield takeLatest(types.DELETE_ITEM_IMAGE_REQUEST, deleteItemImage);
  yield takeLatest(types.UPLOAD_ADDITIONAL_ITEM_IMAGE_REQUEST, uploadAdditionalItemImage);
  yield takeLatest(types.FETCH_PDF_SNAPSHOTS_REQUEST, fetchPdfSnapshotsSaga);
}
