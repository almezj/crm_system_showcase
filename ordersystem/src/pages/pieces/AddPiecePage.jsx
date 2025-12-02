import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPieceRequest, clearCreatedPiece } from '../../redux/pieces/actions';
import { toast } from 'react-toastify';
import AdminLayout from '../../layouts/AdminLayout';

const AddPiecePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, createdPiece } = useSelector(state => state.pieces);
  
  // Get product_id from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('product_id');
  
  const [formData, setFormData] = useState({
    internal_manufacturer_code: '',
    ean_code: '',
    qr_code: '',
    description: '',
    is_active: true
  });

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

    if (!productId) {
      toast.error('Product ID is required');
      return;
    }

    const createData = {
      ...formData,
      product_id: parseInt(productId)
    };

    dispatch(createPieceRequest(createData));
  };

  const handleCancel = () => {
    if (productId) {
      navigate(`/products/${productId}`);
    } else {
      navigate('/products');
    }
  };

  // Watch for success
  useEffect(() => {
    if (!loading && !error && createdPiece) {
      toast.success('Piece created successfully');
      if (productId) {
        navigate(`/products/${productId}`);
      } else {
        navigate('/products');
      }
      dispatch(clearCreatedPiece());
    }
  }, [loading, error, createdPiece, navigate, productId, dispatch]);

  if (!productId) {
    return (
      <AdminLayout>
        <div className="alert alert-warning">
          Product ID is required. Please navigate from a product page.
        </div>
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
                <div>
                  <h5 className="card-title mb-0">Add New Piece</h5>
                  <p className="text-muted mb-0">Product ID: {productId}</p>
                </div>
                <Link to={`/products/${productId}`} className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Product
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
                      <i className="bi bi-plus-circle me-1"></i>
                      {loading ? 'Creating...' : 'Create Piece'}
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

export default AddPiecePage; 