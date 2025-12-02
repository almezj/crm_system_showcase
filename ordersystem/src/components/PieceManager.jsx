import React, { useState } from 'react';
import PieceForm from './pieces/PieceForm';
import PieceTable from './pieces/PieceTable';

const PieceManager = ({ pieces = [], onPiecesChange, onPendingImagesChange }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [pendingMaterialImages, setPendingMaterialImages] = useState({}); // pieceId -> File
    const initialNewPiece = {
        internal_manufacturer_code: '',
        ean_code: '',
        qr_code: '',
        estimated_delivery_date: '',
        custom_description: '',
        material_name: '',
        material_id: null,
        material_code: '',
        material_color: '',
        material_type: '',
        material_style: '',
        material_description: ''
    };
    const [newPiece, setNewPiece] = useState(initialNewPiece);

    const handleAddPiece = () => {
        const pieceToAdd = {
            ...newPiece,
            id: Date.now() // Temporary ID for frontend
        };
        
        // Store pending image separately if exists
        if (newPiece.pendingMaterialImage) {
            setPendingMaterialImages(prev => ({
                ...prev,
                [pieceToAdd.id]: newPiece.pendingMaterialImage
            }));
        }
        
        onPiecesChange([...pieces, pieceToAdd]);
        setNewPiece(initialNewPiece); // Reset fields, keep form open
        
        // Notify parent about pending images
        if (onPendingImagesChange) {
            const allPendingImages = {
                ...pendingMaterialImages,
                ...(newPiece.pendingMaterialImage ? { [pieceToAdd.id]: newPiece.pendingMaterialImage } : {})
            };
            onPendingImagesChange(allPendingImages);
        }
    };

    const handleMaterialSelect = (material) => {
        console.log('Material selected for new piece:', material);
        setNewPiece(prev => ({
            ...prev,
            material_name: material.name,
            material_id: material.id,
            material_code: material.code || '',
            material_color: material.color || '',
            material_type: material.type || '',
            material_style: material.style || '',
            material_description: material.description || ''
        }));
    };

    const handleRemovePiece = (index) => {
        const pieceToRemove = pieces[index];
        const updatedPieces = pieces.filter((_, i) => i !== index);
        onPiecesChange(updatedPieces);
        
        // Remove pending image for this piece
        if (pieceToRemove.id && pendingMaterialImages[pieceToRemove.id]) {
            const updatedPendingImages = { ...pendingMaterialImages };
            delete updatedPendingImages[pieceToRemove.id];
            setPendingMaterialImages(updatedPendingImages);
            
            if (onPendingImagesChange) {
                onPendingImagesChange(updatedPendingImages);
            }
        }
    };

    const handleUpdatePiece = (index, field, value) => {
        const updatedPieces = [...pieces];
        updatedPieces[index] = { ...updatedPieces[index], [field]: value };
        onPiecesChange(updatedPieces);
    };

    const handlePendingMaterialImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPiece(prev => ({ ...prev, pendingMaterialImage: file }));
        }
    };

    const handleRemovePendingMaterialImage = () => {
        setNewPiece(prev => ({ ...prev, pendingMaterialImage: null }));
    };

    return (
        <div className="piece-manager">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-3">Pieces</h5>
                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={showAddForm ? "btn btn-secondary" : "btn btn-primary"}
                >
                    {showAddForm ? 'Cancel' : 'Add Piece'}
                </button>
            </div>

            {showAddForm && (
                <PieceForm
                    newPiece={newPiece}
                    setNewPiece={setNewPiece}
                    onAddPiece={handleAddPiece}
                    onCancel={() => setShowAddForm(false)}
                    onMaterialSelect={handleMaterialSelect}
                    onPendingMaterialImageChange={handlePendingMaterialImageChange}
                    onRemovePendingMaterialImage={handleRemovePendingMaterialImage}
                />
            )}

            <PieceTable
                pieces={pieces}
                onRemovePiece={handleRemovePiece}
            />
        </div>
    );
};

export default PieceManager; 