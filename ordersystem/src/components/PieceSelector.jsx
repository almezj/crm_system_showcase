import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPiecesRequest } from '../redux/pieces/actions';
import { Table, Button, Badge, Form, Alert } from 'react-bootstrap';
import MaterialAutocomplete from './MaterialAutocomplete';
import MaterialCreationModal from './modals/MaterialCreationModal';
import PieceCreationModal from './modals/PieceCreationModal';
import ProposalItemPieceMaterialSelector from './ProposalItemPieceMaterialSelector';
import PieceGrid from './PieceGrid';
import './PieceSelector.css';
import './PieceGrid.css';

const PieceSelector = ({ 
  product, 
  selectedPieces = [], 
  onPiecesChange, 
  proposalId = null,
  proposalItemId = null
}) => {
  const dispatch = useDispatch();
  const { pieces: piecesByProduct, loading } = useSelector((state) => state.pieces);
  const existingPieces = product?.product_id ? (piecesByProduct[product.product_id] || []) : [];
  const [showPieceModal, setShowPieceModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  
  // Load existing pieces when product changes
  useEffect(() => {
    if (product && product.product_id) {
      dispatch(fetchPiecesRequest(product.product_id));
    }
  }, [product, dispatch]);

  // Debug: Log existing pieces to verify they have images
  useEffect(() => {
    if (existingPieces.length > 0) {
      console.log('Existing pieces loaded:', existingPieces);
      existingPieces.forEach((piece, index) => {
        console.log(`Piece ${index}:`, {
          piece_id: piece.piece_id,
          internal_manufacturer_code: piece.internal_manufacturer_code,
          images_count: piece.images?.length || 0,
          images: piece.images
        });
      });
    }
  }, [existingPieces]);

  const handleExistingPieceToggle = (piece, isSelected) => {
    let updatedPieces;
    
    if (isSelected) {
      // Add piece to selection (create a copy for this proposal)
      const pieceCopy = {
        piece_id: piece.piece_id,
        internal_manufacturer_code: piece.internal_manufacturer_code,
        description: '', // This will be the proposal-specific description
        materials: [], // Initialize empty materials array
        images: piece.images || [] // Include piece images
      };
      
      console.log('Creating piece copy:', {
        original_piece: piece,
        piece_copy: pieceCopy,
        images_included: pieceCopy.images.length
      });
      
      updatedPieces = [...selectedPieces, pieceCopy];
    } else {
      // Remove piece from selection
      updatedPieces = selectedPieces.filter(p => p.piece_id !== piece.piece_id);
    }
    
    onPiecesChange(updatedPieces);
  };

  const handleRemovePiece = (pieceId) => {
    const updatedPieces = selectedPieces.filter(p => p.piece_id !== pieceId);
    onPiecesChange(updatedPieces);
  };

  const handleUpdatePiece = (pieceId, field, value) => {
    const updatedPieces = selectedPieces.map(piece => 
      piece.piece_id === pieceId ? { ...piece, [field]: value } : piece
    );
    onPiecesChange(updatedPieces);
  };

  const handleMaterialCreated = (newMaterial) => {
    // Material was created successfully, just close the modal
    setShowMaterialModal(false);
  };

  const handlePieceCreated = (newPiece) => {
    // Add the newly created piece to the selection
    const pieceCopy = {
      piece_id: newPiece.piece_id,
      internal_manufacturer_code: newPiece.internal_manufacturer_code,
      description: '', // This will be the proposal-specific description
      materials: [], // Initialize empty materials array
      images: newPiece.images || [] // Include piece images
    };
    
    const updatedPieces = [...selectedPieces, pieceCopy];
    onPiecesChange(updatedPieces);
    
    setShowPieceModal(false);
  };

  const isPieceSelected = (piece) => {
    return selectedPieces.some(p => p.piece_id === piece.piece_id);
  };

  return (
    <div className="piece-selector">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <i className="fas fa-cube me-2"></i>
          Pieces ({selectedPieces.length} selected)
        </h6>
        <button 
          type="button" 
          className="btn btn-primary btn-sm" 
          onClick={() => setShowPieceModal(true)} 
          disabled={!product?.product_id}
          title={!product?.product_id ? "Please select a product first" : "Create a new piece for this product"}
        >
          <i className="fas fa-plus me-1"></i> Create New Piece
        </button>
      </div>

      {/* Existing Pieces Section */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : existingPieces.length > 0 ? (
        <div className="mb-4">
          <h6 className="text-muted mb-3">Available Pieces from Product</h6>
          <div className="row g-3">
            {existingPieces.map((piece) => (
              <div key={piece.piece_id} className="col-12 col-md-6 col-lg-4">
                <div className={`card h-100 ${isPieceSelected(piece) ? 'border-primary' : 'border-light'}`}>
                  <div className="card-body p-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isPieceSelected(piece)}
                        onChange={(e) => handleExistingPieceToggle(piece, e.target.checked)}
                        id={`piece_${piece.piece_id}`}
                      />
                      <label className="form-check-label w-100" htmlFor={`piece_${piece.piece_id}`}>
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="fw-bold small">{piece.internal_manufacturer_code}</div>
                            <div className="text-muted small">{piece.description || 'No description'}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-cube fa-2x mb-3"></i>
          <p>No pieces available for this product.</p>
          <p>Click "Create New Piece" to add the first piece.</p>
        </div>
      )}

      {/* Selected Pieces Section */}
      {selectedPieces.length > 0 && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Selected Pieces ({selectedPieces.length})</h6>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  // Add functionality to expand all pieces
                }}
              >
                <i className="fas fa-expand-alt me-1"></i>
                Expand All
              </Button>
            </div>
          </div>
          <div className="card-body">
            <PieceGrid 
              pieces={selectedPieces}
              title=""
              isEditable={false}
            />
            
            {/* Material Selector for each piece */}
            {selectedPieces.map((piece, index) => (
              <div key={piece.piece_id} className="mt-4">
                <div className="card border-primary">
                  <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">
                          <i className="fas fa-cog me-2"></i>
                          Configure: <span className="text-primary fw-bold">{piece.internal_manufacturer_code || piece.description || `Piece ID: ${piece.piece_id}`}</span>
                        </h6>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePiece(piece.piece_id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <i className="fas fa-times me-1"></i> Remove
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label className="form-label small fw-bold">Piece Description:</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={piece.description || ''}
                            onChange={(e) => handleUpdatePiece(piece.piece_id, 'description', e.target.value)}
                            placeholder="Enter piece description..."
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-muted small">
                          <strong>Piece ID:</strong> {piece.piece_id}<br/>
                          <strong>Materials:</strong> {(piece.materials || []).length}
                        </div>
                      </div>
                    </div>
                    
                    {/* Material Selector */}
                    <div className="mt-3">
                      <ProposalItemPieceMaterialSelector
                        pieceId={piece.piece_id}
                        materials={piece.materials || []}
                        onMaterialsChange={(materials) => {
                          handleUpdatePiece(piece.piece_id, 'materials', materials);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Material Creation Modal */}
      <MaterialCreationModal
        show={showMaterialModal}
        onHide={() => setShowMaterialModal(false)}
        onMaterialCreated={handleMaterialCreated}
      />

      {/* Piece Creation Modal */}
      <PieceCreationModal
        show={showPieceModal}
        onHide={() => setShowPieceModal(false)}
        onPieceCreated={handlePieceCreated}
        productId={product?.product_id}
      />
      
      {/* Debug info */}
      {showPieceModal && (
        <div className="alert alert-info mt-2">
          <small>
            <strong>Debug Info:</strong><br/>
            Product: {product ? JSON.stringify(product) : 'No product'}<br/>
            Product ID: {product?.product_id || 'No product ID'}<br/>
            Modal Open: {showPieceModal ? 'Yes' : 'No'}
          </small>
        </div>
      )}
    </div>
  );
};

export default PieceSelector; 