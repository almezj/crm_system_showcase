import * as types from "./types";

const initialState = {
  images: {}, // pieceId -> images[]
  loading: false,
  error: null,
};

const pieceImagesReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch Piece Images
    case types.FETCH_PIECE_IMAGES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.FETCH_PIECE_IMAGES_SUCCESS:
      return {
        ...state,
        images: {
          ...state.images,
          [action.payload.pieceId]: action.payload.images,
        },
        loading: false,
        error: null,
      };
    case types.FETCH_PIECE_IMAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Upload Piece Image
    case types.UPLOAD_PIECE_IMAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.UPLOAD_PIECE_IMAGE_SUCCESS:
      const { pieceId, image } = action.payload;
      const currentImages = state.images[pieceId] || [];
      return {
        ...state,
        images: {
          ...state.images,
          [pieceId]: [...currentImages, image],
        },
        loading: false,
        error: null,
      };
    case types.UPLOAD_PIECE_IMAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update Piece Image
    case types.UPDATE_PIECE_IMAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.UPDATE_PIECE_IMAGE_SUCCESS:
      const { imageId, data } = action.payload;
      return {
        ...state,
        images: Object.keys(state.images).reduce((acc, pieceId) => {
          acc[pieceId] = state.images[pieceId].map(img =>
            img.piece_image_id === imageId ? { ...img, ...data } : img
          );
          return acc;
        }, {}),
        loading: false,
        error: null,
      };
    case types.UPDATE_PIECE_IMAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Delete Piece Image
    case types.DELETE_PIECE_IMAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.DELETE_PIECE_IMAGE_SUCCESS:
      const deletedImageId = action.payload;
      return {
        ...state,
        images: Object.keys(state.images).reduce((acc, pieceId) => {
          acc[pieceId] = state.images[pieceId].filter(
            img => img.piece_image_id !== deletedImageId
          );
          return acc;
        }, {}),
        loading: false,
        error: null,
      };
    case types.DELETE_PIECE_IMAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Reorder Piece Images
    case types.REORDER_PIECE_IMAGES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.REORDER_PIECE_IMAGES_SUCCESS:
      const { pieceId: reorderPieceId, imageOrder } = action.payload;
      const reorderImages = state.images[reorderPieceId] || [];
      const reorderedImages = imageOrder.map(imageId =>
        reorderImages.find(img => img.piece_image_id === imageId)
      ).filter(Boolean);
      
      return {
        ...state,
        images: {
          ...state.images,
          [reorderPieceId]: reorderedImages,
        },
        loading: false,
        error: null,
      };
    case types.REORDER_PIECE_IMAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Set Primary Piece Image
    case types.SET_PRIMARY_PIECE_IMAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.SET_PRIMARY_PIECE_IMAGE_SUCCESS:
      const primaryImageId = action.payload;
      return {
        ...state,
        images: Object.keys(state.images).reduce((acc, pieceId) => {
          acc[pieceId] = state.images[pieceId].map(img => ({
            ...img,
            is_primary: img.piece_image_id === primaryImageId ? 1 : 0,
          }));
          return acc;
        }, {}),
        loading: false,
        error: null,
      };
    case types.SET_PRIMARY_PIECE_IMAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default pieceImagesReducer; 