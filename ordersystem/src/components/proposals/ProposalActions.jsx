import React from 'react';

const ProposalActions = ({ 
  onAddItem, 
  onCancel, 
  onSubmit, 
  loading, 
  isEdit 
}) => {
  return (
    <div className="d-flex gap-3 align-items-center">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onAddItem}
        data-testid="add-item-btn"
      >
        Add Item
      </button>

      {onCancel && (
        <button 
          type="button" 
          className="btn btn-outline-secondary me-2"
          onClick={onCancel}
          disabled={loading}
          data-testid="cancel-btn"
        >
          <i className="fas fa-times me-1"></i>
          Cancel
        </button>
      )}
      
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
        data-testid="submit-btn"
      >
        {loading ? "Saving..." : isEdit ? "Update Proposal" : "Save Proposal"}
      </button>
    </div>
  );
};

export default ProposalActions;
