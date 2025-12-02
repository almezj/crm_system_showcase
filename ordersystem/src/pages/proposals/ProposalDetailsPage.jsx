import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProposalByIdRequest,
  generateProposalPDFRequest,
  updateProposalRequest,
  clearProposalPdf,
  updateItemImageDescription,
  reorderItemImages,
  deleteItemImage,
  uploadAdditionalItemImage,
  updateProposalOptimistically
} from "../../redux/proposals/actions";
import { useParams, useNavigate } from "react-router-dom";
import ProposalConversionButton from "../../components/ProposalConversionButton";
import axios from "../../services/axiosInstance";
import { toast } from "react-toastify";
import StatusBadge from "../../components/StatusBadge";
import PDFTemplateOptions from "./PDFTemplateOptions";
import CleanProposalPDFOptions from "./CleanProposalPDFOptions";
import { formatPrice, convertAndFormatPrice } from "../../utils/currencyUtils";
import { getImageUrl } from "../../utils/imageUtils";
import { savePdfOptions, loadPdfOptions } from "../../utils/pdfOptionsPersistence";
import PdfSnapshotsTable from "../../components/PdfSnapshotsTable";
import PieceGrid from "../../components/PieceGrid";
import PDFGenerationLoader from "../../components/PDFGenerationLoader";
import ProposalPreview from "../../components/ProposalPreview";
import "../../components/PieceGrid.css";

const ProposalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const proposalState = useSelector((state) => {
    console.log("Current Redux State:", state.proposals); // Add state logging
    return state.proposals;
  });
  const { loading, proposal, error, pdfUrls } = proposalState;
  
  // Debug: Log proposal items when they change
  useEffect(() => {
    if (proposal && proposal.items) {
      console.log("ProposalDetailsPage - Proposal items debug:");
      proposal.items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          item_name: item.item_name,
          is_custom: item.is_custom,
          is_custom_type: typeof item.is_custom,
          product_id: item.product_id,
          images: item.images?.length || 0
        });
      });
    }
  }, [proposal]);
  
  // Get debug settings from Redux store
  const debugFeatures = useSelector((state) => state.app?.debugFeatures);

  const [statusOptions, setStatusOptions] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('product_summary');
  const [selectedImageSize, setSelectedImageSize] = useState('small');
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [statusHistoryError, setStatusHistoryError] = useState(null);
  // Default PDF options
  const defaultPdfOptions = { 
    imageSize: 'small', 
    showCustomerInfo: true,
    selectedImages: {},
    selectedProductSummaryImages: {},
    customSections: [],
    additionalInformation: ''
  };

  const [pdfOptions, setPdfOptions] = useState(defaultPdfOptions);
  const [pdfDebugInfo, setPdfDebugInfo] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [uploadingImages, setUploadingImages] = useState({});
  const [draggedImage, setDraggedImage] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfTimeoutId, setPdfTimeoutId] = useState(null);
  const [uploadingCustomSectionImages, setUploadingCustomSectionImages] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [refreshPreview, setRefreshPreview] = useState(() => () => {});

  const templateOptions = [
    { value: 'product_summary', label: 'Product Summary Proposal' },
    { value: 'pretty_proposal', label: 'Pretty Proposal' },
  ];
  const imageSizeOptions = [
    { value: 'small', label: 'Small (60px)' },
    { value: 'large', label: 'Large (120px)' },
  ];

  // Helper function to get template display name
  const getTemplateDisplayName = (templateValue) => {
    const template = templateOptions.find(opt => opt.value === templateValue);
    return template ? template.label : 'PDF';
  };

  useEffect(() => {
    if (id) {
      console.log("ProposalDetailsPage: Fetching proposal with ID:", id);
      dispatch(fetchProposalByIdRequest(id));
    }
  }, [dispatch, id]);

  // Load PDF options from localStorage when proposal ID changes
  useEffect(() => {
    if (id) {
      const savedOptions = loadPdfOptions(id, selectedTemplate, defaultPdfOptions);
      // Merge with existing options to preserve any nested options (like prettyProposalOptions)
      setPdfOptions(prev => ({
        ...prev,
        ...savedOptions
      }));
      console.log(`Loaded PDF options for proposal ${id}, template ${selectedTemplate}:`, savedOptions);
    }
  }, [id, selectedTemplate]);

  // Save PDF options to localStorage whenever they change
  useEffect(() => {
    if (id && pdfOptions !== defaultPdfOptions) {
      savePdfOptions(id, selectedTemplate, pdfOptions);
    }
  }, [id, selectedTemplate, pdfOptions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pdfTimeoutId) {
        clearTimeout(pdfTimeoutId);
      }
    };
  }, [pdfTimeoutId]);

  useEffect(() => {
    console.log('ProposalDetailsPage: Current Redux State:', { 
      loading, 
      proposal: proposal ? { 
        id: proposal.proposal_id, 
        status: proposal.proposal_status_id,
        hasItems: proposal.items ? proposal.items.length : 0
      } : null, 
      error 
    });
  }, [loading, proposal, error]);

  // Handle PDF generation completion and errors
  useEffect(() => {
    // If loading is false and we were generating PDF, it means generation completed
    if (!loading && isGeneratingPDF) {
      setIsGeneratingPDF(false);
      if (pdfTimeoutId) {
        clearTimeout(pdfTimeoutId);
        setPdfTimeoutId(null);
      }
    }
    
    // Handle errors
    if (error && isGeneratingPDF) {
      setIsGeneratingPDF(false);
      if (pdfTimeoutId) {
        clearTimeout(pdfTimeoutId);
        setPdfTimeoutId(null);
      }
      toast.error('PDF generation failed. Please try again.');
    }
  }, [loading, error, isGeneratingPDF, pdfTimeoutId]);

  useEffect(() => {
    if (proposal && pdfUrls && pdfUrls[proposal.proposal_id]) {
      const pdfUrl = pdfUrls[proposal.proposal_id];
      
      if (pdfUrl === null) {
        // PDF was downloaded (large file)
        setPdfDebugInfo({
          message: "PDF has been downloaded to your computer",
          type: "success"
        });
        setIsGeneratingPDF(false);
        return;
      }
      
      console.log("PDF URL length:", pdfUrl.length);
      console.log("PDF URL starts with:", pdfUrl.substring(0, 100));
      
      // Check if URL is too long (browser limits)
      if (pdfUrl.length > 2000000) { // ~2MB limit
        setPdfDebugInfo({
          error: "PDF is too large for browser display",
          size: `${(pdfUrl.length / 1024 / 1024).toFixed(2)}MB`,
          suggestion: "Consider reducing image sizes or using file download"
        });
      } else {
        setPdfDebugInfo(null);
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) {
          pdfFrame.src = pdfUrl;
        }
      }
      
      // PDF generation completed successfully
      setIsGeneratingPDF(false);
      if (pdfTimeoutId) {
        clearTimeout(pdfTimeoutId);
        setPdfTimeoutId(null);
      }
    }
  }, [pdfUrls, proposal]);

  useEffect(() => {
    // Fetch status options from reference table
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await axios.get("/references/proposal_status");
        // Map backend fields to frontend expected fields
        const mapped = res.data.map((s) => ({
          id: s.proposal_status_id,
          name: s.status_name,
        }));
        setStatusOptions(mapped);
        setStatusError(null);
      } catch (err) {
        setStatusError("Failed to load statuses");
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  // Refactored: fetch status history
  const fetchStatusHistory = React.useCallback(() => {
    if (!id) return;
    setStatusHistoryLoading(true);
    axios
      .get(`/proposals/${id}/status-history`)
      .then((res) => {
        setStatusHistory(res.data);
        setStatusHistoryError(null);
      })
      .catch(() => {
        setStatusHistoryError("Failed to load status history");
      })
      .finally(() => setStatusHistoryLoading(false));
  }, [id]);

  useEffect(() => {
    fetchStatusHistory();
  }, [fetchStatusHistory]);


  // Update options when template changes or proposal loads
  // Note: This is now handled by the persistence logic above, but we keep this for template-specific defaults
  useEffect(() => {
    if (selectedTemplate === 'product_summary') {
      setPdfOptions((opts) => ({ 
        ...opts, 
        imageSize: opts.imageSize || 'small',
        selectedProductSummaryImages: opts.selectedProductSummaryImages || {}
      }));
    } else if (selectedTemplate === 'image_proposal' || selectedTemplate === 'upgraded_image_proposal') {
      setPdfOptions((opts) => ({ 
        ...opts, 
        showCustomerInfo: opts.showCustomerInfo !== false,
        selectedImages: opts.selectedImages || {}
      }));
    }
  }, [selectedTemplate, proposal]);

  useEffect(() => {
    if (proposal && (selectedTemplate === 'image_proposal' || selectedTemplate === 'upgraded_image_proposal')) {
      setPdfOptions((opts) => {
        const newSelectedImages = { ...opts.selectedImages };
        proposal.items?.forEach(item => {
          if (!Array.isArray(newSelectedImages[item.proposal_item_id]) || newSelectedImages[item.proposal_item_id].length === 0) {
            newSelectedImages[item.proposal_item_id] = (item.all_images || []).map(img => img.image_id);
          }
        });
        return { ...opts, selectedImages: newSelectedImages };
      });
    }
  }, [proposal, selectedTemplate]);

  useEffect(() => {
    if (proposal && selectedTemplate === 'product_summary') {
      setPdfOptions((opts) => {
        const newSelectedProductSummaryImages = { ...opts.selectedProductSummaryImages };
        proposal.items?.forEach(item => {
          // If no image is selected for this item, select the first available image
          if (!newSelectedProductSummaryImages[item.proposal_item_id] && item.all_images && item.all_images.length > 0) {
            newSelectedProductSummaryImages[item.proposal_item_id] = item.all_images[0].image_id;
          }
        });
        return { ...opts, selectedProductSummaryImages: newSelectedProductSummaryImages };
      });
    }
  }, [proposal, selectedTemplate]);

  const handleDownloadPDF = () => {
    console.log("Requesting PDF download for proposal:", id, "with template:", selectedTemplate, "and options:", pdfOptions);
    setIsGeneratingPDF(true);
    
    // Clear any existing timeout
    if (pdfTimeoutId) {
      clearTimeout(pdfTimeoutId);
    }
    
    // Set a timeout to prevent infinite loading (5 minutes)
    const timeoutId = setTimeout(() => {
      setIsGeneratingPDF(false);
      toast.error('PDF generation timed out. Please try again.');
    }, 300000); // 5 minutes
    
    setPdfTimeoutId(timeoutId);
    dispatch(generateProposalPDFRequest(id, selectedTemplate, pdfOptions));
  };

  const handleStatusChange = async (e) => {
    const newStatusId = parseInt(e.target.value, 10);
    setUpdatingStatus(true);
    dispatch(updateProposalRequest({
      id: proposal.proposal_id,
      proposal_status_id: newStatusId,
    }));
    // Optionally, refetch proposal after update
    setTimeout(() => {
      dispatch(fetchProposalByIdRequest(id));
      setUpdatingStatus(false);
      fetchStatusHistory(); // Refetch status history after status change
    }, 500);
  };

  // Helper: get current status object
  const currentStatus = proposal ? statusOptions.find(
    (s) => s.id === proposal.proposal_status_id
  ) : null;

  // Helper: check if customer has delivery address
  const hasDeliveryAddress = () => {
    if (!proposal?.customer?.addresses) return false;
    return proposal.customer.addresses.some(address => 
      address.address_type_id === 2 || address.address_type_name === 'Delivery'
    );
  };

  // Helper: get next valid status transitions and their backend endpoints
  const getNextActions = () => {
    if (!currentStatus) return [];
    switch (currentStatus.name) {
      case "Draft":
        return [
          { name: "Send to Customer", endpoint: "send", btn: "primary" },
        ];
      case "Under Negotiation":
        const acceptAction = hasDeliveryAddress() 
          ? { name: "Accept", endpoint: "accept", btn: "success" }
          : { name: "Accept (No Delivery Address)", endpoint: "accept", btn: "secondary", disabled: true };
        return [
          acceptAction,
          { name: "Cancel Send", endpoint: "cancel-send", btn: "outline-warning" },
          { name: "Hold", endpoint: "hold", btn: "warning" },
          { name: "Expire", endpoint: "expire", btn: "secondary" },
        ];
      case "Accepted":
        const convertAction = hasDeliveryAddress() 
          ? { name: "Convert to Order", endpoint: "convert", btn: "primary" }
          : { name: "Convert to Order (No Delivery Address)", endpoint: "convert", btn: "secondary", disabled: true };
        return [
          convertAction,
          { name: "Hold", endpoint: "hold", btn: "warning" },
        ];
      case "On Hold":
        return [
          { name: "Accept", endpoint: "accept", btn: "success" },
          { name: "Expire", endpoint: "expire", btn: "secondary" },
        ];
      case "Expired":
        return [];
      case "Converted to Order":
        return [];
      case "Rejected":
        return [];
      default:
        return [];
    }
  };

  // Handle status action button click
  const handleStatusAction = async (endpoint) => {
    // Prevent accept/convert if no delivery address
    if ((endpoint === "accept" || endpoint === "convert") && !hasDeliveryAddress()) {
      toast.error("Customer must have a delivery address to accept proposal and convert to order");
      return;
    }
    
    // Confirm cancel send action
    if (endpoint === "cancel-send") {
      if (!window.confirm("Are you sure you want to cancel sending this proposal? This will revert it back to draft status.")) {
        return;
      }
    }
    
    setUpdatingStatus(true);
    try {
      await axios.post(`/proposals/${proposal.proposal_id}/${endpoint}`);
      toast.success(`Proposal status updated: ${endpoint}`);
      // If sending to customer, also generate PDF
      if (endpoint === "send") {
        await dispatch(generateProposalPDFRequest(proposal.proposal_id, selectedTemplate, pdfOptions));
        toast.success("Proposal PDF generated and sent to customer");
      }
      // If accepting, also convert to order
      if (endpoint === "accept") {
        await axios.post(`/proposals/${proposal.proposal_id}/convert`);
        toast.success("Proposal accepted and converted to order");
      }
      // If canceling send, show specific message
      if (endpoint === "cancel-send") {
        toast.success("Proposal reverted to draft status");
      }
      dispatch(fetchProposalByIdRequest(id));
      fetchStatusHistory(); // Refetch status history after status change
    } catch (err) {
      // Handle specific error messages from backend
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to update proposal status");
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Currency and language are read-only here; editing happens in Edit Proposal page

  const [languages, setLanguages] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/languages');
        setLanguages(res.data || []);
      } catch (e) {
        setLanguages([]);
      }
    })();
  }, []);

  // Helper to display language name
  const getLanguageName = (languageId) => {
    const lang = languages.find(l => String(l.language_id) === String(languageId));
    return lang ? lang.name : `Language #${languageId ?? ''}`;
  };

  const handleImageDescriptionUpdate = async (imageId, newDescription) => {
    try {
      await dispatch(updateItemImageDescription(imageId, newDescription));
      setEditingImageId(null);
      setEditingDescription('');
      // Refresh proposal data
      dispatch(fetchProposalByIdRequest(id));
    } catch (error) {
      console.error('Failed to update image description:', error);
    }
  };

  const handleImageReorder = async (proposalItemId, newOrder) => {
    try {
      // Send the request to the backend
      await dispatch(reorderItemImages(proposalItemId, newOrder));
      
      // Show success message
      console.log('Images reordered successfully');
      
      // The saga will automatically refetch the proposal data
      // so we don't need to manually refresh here
      
    } catch (error) {
      console.error('Failed to reorder images:', error);
      // No need to revert local state since we're using backend data
    }
  };

  const handleImageDelete = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await dispatch(deleteItemImage(imageId));
        // Refresh proposal data
        dispatch(fetchProposalByIdRequest(id));
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  const handleImageUpload = async (proposalItemId, files) => {
    setUploadingImages(prev => ({ ...prev, [proposalItemId]: true }));
    
    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', '');
        
        await dispatch(uploadAdditionalItemImage(proposalItemId, formData));
      }
      // Refresh proposal data
      dispatch(fetchProposalByIdRequest(id));
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImages(prev => ({ ...prev, [proposalItemId]: false }));
    }
  };

    const handleCustomSectionImageUpload = async (sectionIndex, file) => {
    try {
      // Set loading state
      setUploadingCustomSectionImages(prev => ({ ...prev, [sectionIndex]: true }));

      // Upload the image to the server
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', '');

      const response = await axios.post('/proposals/upload-custom-section-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add the uploaded image to the state
      const newImage = {
        url: response.data.url,
        description: response.data.description || '',
        filename: response.data.filename
      };

      setPdfOptions(opts => {
        const updatedSections = [...(opts.customSections || [])];
        updatedSections[sectionIndex].images.push(newImage);
        return {
          ...opts,
          customSections: updatedSections
        };
      });

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload custom section image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      // Clear loading state
      setUploadingCustomSectionImages(prev => ({ ...prev, [sectionIndex]: false }));
    }
  };

  const handleDragStart = (e, imageId, proposalItemId) => {
    console.log('Drag start:', { imageId, proposalItemId });
    setDraggedImage({ imageId, proposalItemId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${imageId}-${proposalItemId}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetImageId, targetProposalItemId) => {
    e.preventDefault();
    
    console.log('Drop event:', { 
      draggedImage, 
      targetImageId, 
      targetProposalItemId,
      draggedImageProposalItemId: draggedImage?.proposalItemId 
    });
    
    if (!draggedImage || String(draggedImage.proposalItemId) !== String(targetProposalItemId)) {
      console.log('Drop rejected: different proposal items or no dragged image');
      return;
    }
    
    // Don't reorder if dropping on the same image
    if (String(draggedImage.imageId) === String(targetImageId)) {
      console.log('Drop rejected: same image');
      return;
    }
    
    const item = proposal.items.find(item => String(item.proposal_item_id) === String(targetProposalItemId));
    if (!item || !item.images) {
      console.log('Drop rejected: item or images not found');
      return;
    }
    
    const images = [...item.images];
    const draggedIndex = images.findIndex(img => String(img.image_id) === String(draggedImage.imageId));
    const targetIndex = images.findIndex(img => String(img.image_id) === String(targetImageId));
    
    console.log('Indices:', { draggedIndex, targetIndex, imagesCount: images.length });
    
    if (draggedIndex === -1 || targetIndex === -1) {
      console.log('Drop rejected: indices not found');
      return;
    }
    
    // Reorder the images
    const [removed] = images.splice(draggedIndex, 1);
    images.splice(targetIndex, 0, removed);
    
    const newOrder = images.map(img => img.image_id);
    console.log('New order:', newOrder);
    
    // Update local state immediately for visual feedback
    setDraggedImage(null);
    
    // Send to backend
    handleImageReorder(targetProposalItemId, newOrder);
  };

  const handleDragEnd = () => {
    console.log('Drag end');
    setDraggedImage(null);
  };

  // Show general loading only when proposal data is not available
  if (!proposal) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading proposal details...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="proposal-details-container" style={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* PDF Generation Loading Screen */}
      <PDFGenerationLoader 
        isGenerating={isGeneratingPDF} 
      />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Proposal Details</h1>
          <p className="text-muted mb-0">Proposal #{proposal.proposal_id}</p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate(`/proposals/${id}/edit`)}
          title="Edit this proposal"
        >
          <i className="fas fa-edit me-1"></i>
          Edit Proposal
        </button>
      </div>

      {/* Customer Information */}
      <div className="card mb-4">
        <div className="card-header">Customer Information</div>
        <div className="card-body">
          {/* Delivery Address Warning */}
          {!hasDeliveryAddress() && (
            <div className="alert alert-warning mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> This customer has no delivery address. 
              You must add a delivery address before accepting this proposal to convert it to an order.
            </div>
          )}
          {proposal.customer ? (
            <>
              <p>
                <strong>Name:</strong> {proposal.customer.first_name} {proposal.customer.last_name}
              </p>
              <p>
                <strong>Email:</strong> {proposal.customer.email}
              </p>
              <p>
                <strong>Phone:</strong> {proposal.customer.phone}
              </p>
              <div className="w-100">
                <strong>Addresses:</strong>
                {proposal.customer.addresses && proposal.customer.addresses.length > 0 ? (
                  <div className="row g-3 mt-2 w-100 mx-0">
                    {proposal.customer.addresses.map((address, idx) => (
                      <div key={address.address_id || idx} className="col-12 col-md-4 px-2">
                        <div className="p-3 border rounded h-100 bg-light">
                          <p className="mb-1"><strong>Type:</strong> {address.address_type_name || address.address_type || 'N/A'}</p>
                          <p className="mb-1"><strong>Street:</strong> {address.street}</p>
                          {address.floor !== null && address.floor !== undefined && address.floor !== "" && (
                            <p className="mb-1"><strong>Floor:</strong> {address.floor}</p>
                          )}
                          <p className="mb-1"><strong>City:</strong> {address.city}</p>
                          <p className="mb-1"><strong>State/Province:</strong> {address.state_province}</p>
                          <p className="mb-1"><strong>Postal Code:</strong> {address.postal_code}</p>
                          <p className="mb-1"><strong>Country:</strong> {address.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="ms-3">No addresses found</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted">Customer information not available</p>
          )}
        </div>
      </div>

      {/* Proposal Metadata */}
      <div className="card mb-4">
        <div className="card-header">Proposal Information</div>
        <div className="card-body">
          {/* Core Information */}
          <div className="mb-3">
            <p className="mb-2">
              <strong>Status:</strong>
              {statusLoading ? (
                <span className="ms-2">Loading...</span>
              ) : statusError ? (
                <span className="text-danger ms-2">{statusError}</span>
              ) : (
                <span className="ms-2">
                  <StatusBadge status={currentStatus?.name || "Unknown"} />
                </span>
              )}
            </p>
            <p className="mb-2">
              <strong>Valid Until:</strong> {proposal.valid_until}
            </p>
            <p className="mb-2">
              <strong>Total:</strong>{" "}
              <span className="text-primary fw-bold">
                {convertAndFormatPrice(
                  proposal.total_price, 
                  proposal.currency_code || 'CZK', 
                  proposal.exchange_rate_used
                )}
              </span>
            </p>
            {proposal.exchange_rate_used && proposal.currency_code !== 'CZK' && (
              <p className="mb-2 text-muted small">
                <strong>Exchange Rate:</strong> 1 {proposal.currency_code} = {proposal.exchange_rate_used} CZK
              </p>
            )}
            <p className="mb-2">
              <strong>Proposal Currency:</strong> {proposal.currency_code || 'CZK'}
            </p>
            <p className="mb-0">
              <strong>Proposal Language:</strong> {getLanguageName(proposal.language_id)}
            </p>
          </div>

          {/* Action Buttons */}
          {getNextActions().length > 0 && (
            <div className="mb-3">
              {getNextActions().map((action) => (
                <button
                  key={action.endpoint}
                  className={`btn btn-${action.btn} me-2 mb-2`}
                  onClick={() => handleStatusAction(action.endpoint)}
                  disabled={updatingStatus || action.disabled}
                  title={action.disabled ? "Customer must have a delivery address to accept proposal and convert to order" : ""}
                >
                  {action.name}
                </button>
              ))}
              {updatingStatus && <span className="ms-2 text-muted">Updating...</span>}
            </div>
          )}
          
          {/* PDF Template Selection and Download */}
          <PDFTemplateOptions
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            templateOptions={templateOptions}
            pdfOptions={pdfOptions}
            setPdfOptions={setPdfOptions}
            imageSizeOptions={imageSizeOptions}
            proposal={proposal}
            uploadingImages={uploadingImages}
            handleImageUpload={handleImageUpload}
            draggedImage={draggedImage}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragEnd={handleDragEnd}
            editingImageId={editingImageId}
            editingDescription={editingDescription}
            setEditingImageId={setEditingImageId}
            setEditingDescription={setEditingDescription}
            handleImageDescriptionUpdate={handleImageDescriptionUpdate}
            handleCustomSectionImageUpload={handleCustomSectionImageUpload}
            uploadingCustomSectionImages={uploadingCustomSectionImages}
            handleImageDelete={handleImageDelete}
            handleDownloadPDF={handleDownloadPDF}
          />
          
          {/* HTML Preview Section - Only show when debug features are enabled */}
          {debugFeatures?.enabled && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">HTML Preview (Developer Tool)</h6>
                <div>
                  <button 
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  {showPreview && (
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={refreshPreview}
                    >
                      <i className="fas fa-sync-alt me-1"></i>
                      Refresh Preview
                    </button>
                  )}
                </div>
              </div>
              {showPreview && (
                <div className="card-body">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Developer Tool:</strong> This preview shows the exact HTML that will be used for PDF generation. 
                    Use browser developer tools to inspect and modify styling in real-time.
                  </div>
                  <ProposalPreview 
                    proposalId={id}
                    templateType={selectedTemplate}
                    pdfOptions={pdfOptions}
                    onRefresh={setRefreshPreview}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Clean proposal deprecated */}

          {/* Pretty Proposal PDF Options - Only show when pretty_proposal template is selected */}
          {selectedTemplate === 'pretty_proposal' && (
            <CleanProposalPDFOptions
              proposal={proposal}
              pdfOptions={pdfOptions}
              setPdfOptions={setPdfOptions}
              uploadingImages={uploadingImages}
              handleImageUpload={handleImageUpload}
              editingImageId={editingImageId}
              editingDescription={editingDescription}
              setEditingImageId={setEditingImageId}
              setEditingDescription={setEditingDescription}
              handleImageDescriptionUpdate={handleImageDescriptionUpdate}
              handleImageDelete={handleImageDelete}
              handleDownloadPDF={handleDownloadPDF}
              templateType="pretty_proposal"
            />
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      {proposal && pdfUrls && (pdfUrls[proposal.proposal_id] !== undefined) && (
        <div className="card mb-4">
          <div className="card-header">Proposal PDF</div>
          <div className="card-body">
            {/* Show any Redux errors */}
            
            {/* Show debug info if PDF is too large or downloaded */}
            {pdfDebugInfo && (
              <div className={`alert ${pdfDebugInfo.type === 'success' ? 'alert-success' : 'alert-warning'} mb-3`}>
                {pdfDebugInfo.type === 'success' ? (
                  <>
                    <strong>Success:</strong> {pdfDebugInfo.message}
                  </>
                ) : (
                  <>
                    <strong>PDF Size Issue:</strong> {pdfDebugInfo.error}<br/>
                    <strong>Size:</strong> {pdfDebugInfo.size}<br/>
                    <strong>Suggestion:</strong> {pdfDebugInfo.suggestion}
                  </>
                )}
              </div>
            )}
            
            {/* Show PDF URL info for debugging */}
            {pdfUrls[proposal.proposal_id] && (
              <div className="mb-3">
                <small className="text-muted">
                  PDF URL length: {pdfUrls[proposal.proposal_id]?.length || 0} characters
                  {pdfUrls[proposal.proposal_id]?.length > 2000000 && (
                    <span className="text-danger ms-2">⚠️ Too large for browser display</span>
                  )}
                </small>
              </div>
            )}
            
            {!pdfDebugInfo && pdfUrls[proposal.proposal_id] && (
              <iframe
                id="pdfFrame"
                src={pdfUrls[proposal.proposal_id]}
                style={{ 
                  width: '100%', 
                  height: '600px', 
                  border: 'none',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}
                title="Proposal PDF"
              />
            )}
            
            {/* Download button as fallback */}
            {pdfDebugInfo && pdfUrls[proposal.proposal_id] && (
              <div className="text-center">
                <p className="text-muted mb-3">PDF is too large to display in browser</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfUrls[proposal.proposal_id];
                    link.download = `CN_${proposal.proposal_id}_1.pdf`;
                    link.click();
                  }}
                >
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proposal Items */}
      <div className="card">
        <div className="card-header">Proposal Items</div>
        <div className="card-body">
          <div className="table-responsive w-100">
            <table className="table">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th>Item</th>
                <th style={{ width: "5%" }}>Quantity</th>
                <th style={{ width: "10%" }}>List Price</th>
                <th style={{ width: "10%" }}>Discount</th>
                <th style={{ width: "10%" }}>Final Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.items && Array.isArray(proposal.items) && proposal.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <tr className="table-primary">
                    <td>{index + 1}</td>
                    <td>
                      <strong>{item.item_name}</strong>
                      {(() => {
                        // Convert is_custom to boolean, handling various data types
                        const isCustom = item.is_custom;
                        const isCustomBool = isCustom === 1 || isCustom === "1" || isCustom === true || isCustom === "true";
                        console.log(`Item "${item.item_name}": is_custom = ${isCustom} (type: ${typeof isCustom}), isCustomBool = ${isCustomBool}`);
                        return isCustomBool;
                      })() && (
                        <span className="badge bg-warning ms-2">Custom</span>
                      )}
                      {item.description && (
                        <div className="text-muted small mt-1">{item.description}</div>
                      )}
                      {item.custom_description && (
                        <div className="text-muted small mt-1">
                          <strong>Custom Description:</strong> {item.custom_description}
                        </div>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{convertAndFormatPrice(item.list_price, proposal.currency_code || 'CZK', proposal.exchange_rate_used)}</td>
                    <td>{item.discount}%</td>
                    <td>{convertAndFormatPrice(item.final_price, proposal.currency_code || 'CZK', proposal.exchange_rate_used)}</td>
                    <td>{convertAndFormatPrice(item.quantity * item.final_price, proposal.currency_code || 'CZK', proposal.exchange_rate_used)}</td>
                  </tr>
                  
                  {/* Pieces as subitems */}
                  {item.pieces && Array.isArray(item.pieces) && item.pieces.length > 0 && (
                    <tr>
                      <td colSpan="12" className="p-0">
                        <div className="bg-light border-top">
                          <div className="p-3">
                            <PieceGrid 
                              pieces={item.pieces}
                              title={`Pieces for ${item.item_name}`}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* PDF Version History */}
      <div className="mb-4">
        <PdfSnapshotsTable proposalId={proposal.proposal_id} />
      </div>
    </div>
  );
};

export default ProposalDetailsPage;