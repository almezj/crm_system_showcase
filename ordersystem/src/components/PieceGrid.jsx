import React, { useState } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import PieceDisplayCard from './PieceDisplayCard';

const PieceGrid = ({ 
  pieces = [], 
  title = "Pieces", 
  onPieceClick, 
  expandedPieceId = null
}) => {
  const [expandedPiece, setExpandedPiece] = useState(expandedPieceId);

  const handlePieceToggle = (pieceId) => {
    if (onPieceClick) {
      onPieceClick(pieceId);
    } else {
      setExpandedPiece(expandedPiece === pieceId ? null : pieceId);
    }
  };

  if (!pieces || pieces.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <i className="fas fa-cube fa-2x mb-3"></i>
        <p>No pieces available.</p>
      </div>
    );
  }

  return (
    <div className="piece-grid-container">
      {title && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 text-muted">
            <i className="fas fa-cube me-2"></i>
            {title} ({pieces.length})
          </h6>
        </div>
      )}
      
      <Row className="g-3">
        {pieces.map((piece, index) => (
          <Col key={piece.id || piece.piece_id || index} xs={12} sm={6} md={4} lg={4} xl={3}>
            <PieceDisplayCard
              piece={piece}
              index={index}
              isExpanded={expandedPiece === (piece.id || piece.piece_id)}
              onToggleExpand={handlePieceToggle}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PieceGrid; 