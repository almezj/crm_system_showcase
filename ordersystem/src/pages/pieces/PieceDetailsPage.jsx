import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPiecesRequest, fetchPieceByIdRequest, deletePieceRequest } from '../../redux/pieces/actions';
import PieceImageUpload from '../../components/PieceImageUpload';
import { getImageUrl } from '../../utils/imageUtils';
import { toast } from 'react-toastify';

const PieceDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pieces, currentPiece, loading, error } = useSelector(state => state.pieces);
    const [piece, setPiece] = useState(null);

    useEffect(() => {
        // First try to find the piece from the pieces state
        const allPieces = Object.values(pieces).flat();
        const foundPiece = allPieces.find(p => p.piece_id == id);
        
        if (foundPiece) {
            setPiece(foundPiece);
        } else if (currentPiece && currentPiece.piece_id == id) {
            setPiece(currentPiece);
        } else {
            // If piece not found in state, fetch it by ID
            dispatch(fetchPieceByIdRequest(id));
        }
    }, [pieces, currentPiece, id, dispatch]);

    // Watch for successful deletion
    useEffect(() => {
        if (!loading && !error && piece) {
            // Check if the piece was deleted (it should no longer exist in the pieces state)
            const allPieces = Object.values(pieces).flat();
            const pieceStillExists = allPieces.find(p => p.piece_id == id);
            
            if (!pieceStillExists && piece) {
                toast.success('Piece deleted successfully');
                navigate(`/products/${piece.product_id}`);
            }
        }
    }, [pieces, loading, error, piece, id, navigate]);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this piece?')) {
            dispatch(deletePieceRequest({ productId: piece.product_id, pieceId: piece.piece_id }));
        }
    };

    if (loading) {
        return (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
        );
    }

    if (error) {
        return (
                <div className="alert alert-danger">
                    Error: {error}
                </div>
        );
    }

    if (!piece) {
        return (
                <div className="alert alert-warning">
                    Piece not found
                </div>
        );
    }

    return (
            <div className="container-fluid">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="h2 mb-1">
                            {piece.internal_manufacturer_code}
                        </h1>
                        <p className="text-muted">Piece Details</p>
                    </div>
                    <div className="btn-group" role="group">
                        <Link
                            to={`/products/${piece.product_id}`}
                            className="btn btn-secondary"
                        >
                            <i className="bi bi-arrow-left me-1"></i>
                            Back to Product
                        </Link>
                        <Link
                            to={`/pieces/${piece.piece_id}/edit`}
                            className="btn btn-primary"
                        >
                            <i className="bi bi-pencil me-1"></i>
                            Edit Piece
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="btn btn-danger"
                        >
                            <i className="bi bi-trash me-1"></i>
                            Delete Piece
                        </button>
                    </div>
                </div>

                {/* Piece Information */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Piece Information</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">
                                    Internal Manufacturer Code
                                </label>
                                <p className="form-control-plaintext">{piece.internal_manufacturer_code}</p>
                            </div>
                            
                            {piece.ean_code && (
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">
                                        EAN Code
                                    </label>
                                    <p className="form-control-plaintext">{piece.ean_code}</p>
                                </div>
                            )}
                            
                            {piece.qr_code && (
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">
                                        QR Code
                                    </label>
                                    <p className="form-control-plaintext">{piece.qr_code}</p>
                                </div>
                            )}
                            
                            {piece.description && (
                                <div className="col-12 mb-3">
                                    <label className="form-label fw-bold">
                                        Description
                                    </label>
                                    <p className="form-control-plaintext">{piece.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Piece Images */}
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Piece Images</h5>
                    </div>
                    <div className="card-body">
                        <PieceImageUpload pieceId={piece.piece_id} />
                    </div>
                </div>
            </div>
    );
};

export default PieceDetailsPage; 