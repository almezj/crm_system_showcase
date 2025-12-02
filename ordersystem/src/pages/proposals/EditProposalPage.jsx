import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import ProposalForm from "./ProposalForm";
import { 
  fetchProposalByIdRequest,
  updateProposalRequest,
  reorderItemImages
} from "../../redux/proposals/actions";

const EditProposalPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { proposal, loading, error } = useSelector((state) => state.proposals);

  useEffect(() => {
    dispatch(fetchProposalByIdRequest(id));
  }, [dispatch, id]);

  const handleUpdateProposal = async (data) => {
    try {
      // Use Redux action for proper state management
      await dispatch(updateProposalRequest({ id, ...data }));
      
      // Save image orders for items that have them
      if (data.items) {
        for (const item of data.items) {
          if (item.proposal_item_id && item.image_order && item.image_order.length > 0) {
            try {
              await dispatch(reorderItemImages(item.proposal_item_id, item.image_order));
            } catch (error) {
              console.error('Failed to save image order for item:', item.proposal_item_id, error);
            }
          }
        }
      }
      
      navigate("/proposals");
    } catch (error) {
      console.error('Error updating proposal:', error);
      // Error handling is done by the Redux action and toast notifications
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Loading...</div>;
  }

  if (!proposal) {
    return <div>No proposal found.</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Edit Proposal</h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/proposals/${id}`)}
          title="Go back to proposal details without saving changes"
        >
          <i className="fas fa-arrow-left me-1"></i>
          Cancel Edit
        </button>
      </div>
      <ProposalForm 
        onSubmit={handleUpdateProposal} 
        loading={loading}
        initialData={proposal}
        isEdit={true}
        onCancel={() => navigate(`/proposals/${id}`)}
      />
    </div>
  );
};

export default EditProposalPage; 