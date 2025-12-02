import * as types from "./types";

const initialState = {
  loading: false,
  proposals: [],
  pagination: {
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  },
  proposal: null,
  pdfUrls: {},
  order: null,
  error: null,

  uploadErrors: {},
  
  // PDF Snapshots
  pdfSnapshots: [],
  pdfSnapshotsLoading: false,
  pdfSnapshotsError: null,
};

const proposalReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PROPOSALS_REQUEST:
    case types.FETCH_PROPOSAL_BY_ID_REQUEST:
    case types.CREATE_PROPOSAL_REQUEST:
    case types.UPDATE_PROPOSAL_REQUEST:
    case types.DELETE_PROPOSAL_REQUEST:
    case types.GENERATE_PROPOSAL_PDF_REQUEST:
    case types.CONVERT_PROPOSAL_TO_ORDER_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PDF_SNAPSHOTS_REQUEST:
      return { ...state, pdfSnapshotsLoading: true, pdfSnapshotsError: null };

    case types.FETCH_PROPOSALS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        proposals: Array.isArray(action.payload.proposals) ? action.payload.proposals.map(proposal => ({
          ...proposal,
          total_price: parseFloat(proposal.total_price) || 0
        })) : [],
        pagination: action.payload.pagination || {
          current_page: 1,
          per_page: 10,
          total: 0,
          total_pages: 0
        }
      };

    case types.FETCH_PROPOSAL_BY_ID_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        proposal: {
          ...action.payload,
          total_price: parseFloat(action.payload.total_price) || 0
        }
      };

    case types.CREATE_PROPOSAL_SUCCESS:
      return {
        ...state,
        loading: false,
        proposals: [...state.proposals, action.payload],
      };

    case types.UPDATE_PROPOSAL_SUCCESS:
      return {
        ...state,
        loading: false,
        proposals: state.proposals.map((p) =>
          p.id === action.payload.id ? { ...action.payload } : p
        ),
        proposal: action.payload ? { ...action.payload } : state.proposal, // Create new object to avoid mutations
      };

    case types.DELETE_PROPOSAL_SUCCESS:
      return {
        ...state,
        loading: false,
        proposals: state.proposals.filter((p) => p.id !== action.payload),
      };

    case types.FETCH_PDF_SNAPSHOTS_SUCCESS:
      return {
        ...state,
        pdfSnapshotsLoading: false,
        pdfSnapshots: action.payload,
        pdfSnapshotsError: null,
      };

    case types.FETCH_PDF_SNAPSHOTS_FAILURE:
      return {
        ...state,
        pdfSnapshotsLoading: false,
        pdfSnapshotsError: action.payload,
      };

    case types.GENERATE_PROPOSAL_PDF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.GENERATE_PROPOSAL_PDF_SUCCESS:
      const { proposalId, pdfUrl } = action.payload;
      return {
        ...state,
        loading: false,
        pdfUrls: {
          ...state.pdfUrls,
          [proposalId]: pdfUrl,
        },
      };

    case types.CONVERT_PROPOSAL_TO_ORDER_SUCCESS:
      const { orderId } = action.payload;
      return {
        ...state,
        loading: false,
        order: action.payload,
        proposals: state.proposals.map((p) =>
          p.id === action.payload.proposalId
            ? { ...p, convertedToOrderId: orderId }
            : p
        ),
      };

    case types.FETCH_PROPOSALS_FAILURE:
    case types.FETCH_PROPOSAL_BY_ID_FAILURE:
    case types.CREATE_PROPOSAL_FAILURE:
    case types.UPDATE_PROPOSAL_FAILURE:
    case types.DELETE_PROPOSAL_FAILURE:
    case types.GENERATE_PROPOSAL_PDF_FAILURE:
    case types.CONVERT_PROPOSAL_TO_ORDER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case types.UPLOAD_ITEM_IMAGE_REQUEST:
      return {
        ...state,
        uploadErrors: {
          ...state.uploadErrors,
          [action.payload.proposalItemId]: null,
        },
      };

    case types.UPLOAD_ITEM_IMAGE_SUCCESS:
      return {
        ...state,
        proposals: state.proposals.map((proposal) =>
          proposal.items.map((item) =>
            item.id === action.payload.proposalItemId
              ? {
                  ...item,
                  images: [...item.images, action.payload.image],
                }
              : item
          )
        ),
      };

    case types.UPLOAD_ITEM_IMAGE_FAILURE:
      return {
        ...state,
        uploadErrors: {
          ...state.uploadErrors,
          [action.payload.proposalItemId]: action.payload.error,
        },
      };

    case types.UPLOAD_TEMP_IMAGE_REQUEST:
      return {
        ...state,
        uploadErrors: {
          ...state.uploadErrors,
          temp: null,
        },
      };

    case types.UPLOAD_TEMP_IMAGE_SUCCESS:
      return {
        ...state,
        proposals: state.proposals.map((proposal) =>
          proposal.tempKey === action.payload.tempKey
            ? {
                ...proposal,
                images: [...proposal.images, action.payload.image],
              }
            : proposal
        ),
      };

    case types.UPLOAD_TEMP_IMAGE_FAILURE:
      return {
        ...state,
        uploadErrors: {
          ...state.uploadErrors,
          [action.payload.tempKey]: action.payload.error,
        },
      };

    case types.UPDATE_ITEM_IMAGE_DESCRIPTION_SUCCESS:
      // Don't update proposal state here - it causes mutations when called during proposal updates
      // The proposal state is updated by UPDATE_PROPOSAL_SUCCESS instead
      return state;

    case types.CLEAR_PROPOSAL_PDF:
      return { ...state, pdfUrls: {} };

    case types.UPLOAD_ADDITIONAL_ITEM_IMAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case types.UPDATE_PROPOSAL_OPTIMISTICALLY:
      return {
        ...state,
        proposal: action.payload ? { ...action.payload } : state.proposal
      };

    case types.REORDER_ITEM_IMAGES_SUCCESS:
      return {
        ...state,
        loading: false
      };

    default:
      return state;
  }
};

export default proposalReducer;
