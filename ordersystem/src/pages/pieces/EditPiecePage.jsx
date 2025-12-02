import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updatePieceRequest, fetchPiecesRequest, fetchPieceByIdRequest } from '../../redux/pieces/actions';
import { toast } from 'react-toastify';
import AdminLayout from '../../layouts/AdminLayout';

const EditPiecePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { pieces, currentPiece, loading, error } = useSelector(state => state.pieces);
  
  // Find the piece from the pieces state or currentPiece
  const allPieces = Object.values(pieces).flat();
  const piece = allPieces.find(p => p.piece_id == id) || currentPiece;
  
  // Fetch piece if not found
  useEffect(() => {
    if (!piece && id) {
      dispatch(fetchPieceByIdRequest(id));
    }
  }, [piece, id, dispatch]);
  
  const [formData, setFormData] = useState({
    internal_manufacturer_code: '',
    ean_code: '',
    qr_code: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (piece) {
      setFormData({
        internal_manufacturer_code: piece.internal_manufacturer_code || '',
        ean_code: piece.ean_code || '',
        qr_code: piece.qr_code || '',
        description: piece.description || '',
        is_active: piece.is_active !== undefined ? piece.is_active : true
      });
    }
  }, [piece]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.internal_manufacturer_code.trim()) {
      toast.error('Internal manufacturer code is required');
      return;
    }

    const updateData = {
      ...formData,
      piece_id: parseInt(id),
      product_id: piece.product_id
    };

    dispatch(updatePieceRequest(updateData));
  };

  const handleCancel = () => {
    navigate(`/pieces/${id}`);
  };

  // Watch for successful update
  useEffect(() => {
    if (!loading && !error && piece) {
      toast.success('Piece updated successfully');
      navigate(`/pieces/${id}`);
    }
  }, [loading, error, piece, navigate, id]);

  if (!piece) {
    return (
      <AdminLayout>
        <div className="alert alert-warning">Piece not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-xl-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Edit Piece</h5>
                <Link to={`/pieces/${id}`} className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Details
                </Link>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="internal_manufacturer_code" className="form-label">
                      Internal Manufacturer Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="internal_manufacturer_code"
                      name="internal_manufacturer_code"
                      value={formData.internal_manufacturer_code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ean_code" className="form-label">
                      EAN Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="ean_code"
                      name="ean_code"
                      value={formData.ean_code}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="qr_code" className="form-label">
                      QR Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="qr_code"
                      name="qr_code"
                      value={formData.qr_code}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_active">
                        Active
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger mb-3">
                      {error}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      {loading ? 'Updating...' : 'Update Piece'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditPiecePage; 