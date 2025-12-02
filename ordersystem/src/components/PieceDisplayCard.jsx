import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import PieceImage from './pieces/PieceImage';
import PieceHeader from './pieces/PieceHeader';
import PieceMaterials from './pieces/PieceMaterials';

const PieceDisplayCard = ({ 
  piece, 
  index, 
  isExpanded = false, 
  onToggleExpand
}) => {
  const [showMaterials, setShowMaterials] = useState(false);

  // Debug logging to identify broken pieces
  console.log(`PieceDisplayCard ${index}:`, {
    piece_id: piece?.piece_id,
    id: piece?.id,
    internal_manufacturer_code: piece?.internal_manufacturer_code,
    materials: piece?.materials,
    materials_count: piece?.materials?.length,
    description: piece?.description
  });

  // Debug material image paths
  if (piece?.materials && Array.isArray(piece.materials)) {
    piece.materials.forEach((material, idx) => {
      console.log(`Material ${idx}:`, {
        name: material.name,
        material_image_path: material.material_image_path,
        image_path: material.image_path,
        id: material.id,
        material_id: material.material_id,
        full_material_object: material
      });
    });
  }


  const handleCardClick = () => {
    if (onToggleExpand) {
      onToggleExpand(piece.id || piece.piece_id);
    }
  };

  const handleToggleMaterials = (e) => {
    e.stopPropagation();
    setShowMaterials(!showMaterials);
  };


  // Safety check - if piece is null/undefined, don't render
  if (!piece) {
    console.warn(`PieceDisplayCard ${index}: piece is null or undefined`);
    return null;
  }

  return (
    <Card 
      className={`piece-card h-100 ${isExpanded ? 'border-primary' : ''}`}
      style={{ 
        cursor: onToggleExpand ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={handleCardClick}
      data-testid={`piece-card-${piece.id || piece.piece_id || index}`}
    >
      <PieceImage piece={piece} />

      <Card.Body className="p-3">
        <PieceHeader
          piece={piece}
          index={index}
          showMaterials={showMaterials}
          onToggleMaterials={handleToggleMaterials}
        />

        {/* Piece Description */}
        {piece.description && (
          <div className="small text-muted text-center mb-2">
            {piece.description.length > 50 
              ? `${piece.description.substring(0, 50)}...` 
              : piece.description
            }
          </div>
        )}
      </Card.Body>

      <PieceMaterials
        piece={piece}
        showMaterials={showMaterials}
      />
    </Card>
  );
};

export default PieceDisplayCard; 