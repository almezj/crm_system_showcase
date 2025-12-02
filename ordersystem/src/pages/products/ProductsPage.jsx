import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProductsRequest, deleteProductRequest } from "../../redux/products/actions";
import { getImageUrl } from "../../utils/imageUtils";
import { formatPrice } from "../../utils/currencyUtils";
import Pagination from "../../components/Pagination";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, pagination, loading, error } = useSelector((state) => state.products);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchProductsRequest(false, currentPage, itemsPerPage));
  }, [dispatch, currentPage, itemsPerPage]);

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProductRequest(productToDelete.product_id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) {
    return <div className="alert alert-info">Loading products...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/products/add")}
        >
          Add Product
        </button>
      </div>

      {/* Items per page selector */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <label htmlFor="itemsPerPage" className="form-label me-2 mb-0">
            Show:
          </label>
          <select
            id="itemsPerPage"
            className="form-select"
            style={{ width: 'auto' }}
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ms-2 text-muted">products per page</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="alert alert-info">
          No products found.{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => navigate("/products/add")}
          >
            Add your first product
          </button>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Manufacturer</th>
                  <th>Price</th>
                  <th>Languages</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} className={!product.is_active ? "table-secondary" : ""}>
                    <td>
                      {product.primary_image_url ? (
                        <img
                          src={getImageUrl(product.primary_image_url)}
                          alt="Primary"
                          style={{ height: "70px", objectFit: "cover", borderRadius: "4px" }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>{product.product_id}</td>
                    <td>{product.name}</td>
                    <td>{product.manufacturer_name}</td>
                    <td>{formatPrice(product.base_price, 'CZK')}</td>
                    <td>
                      {product.language_codes ? (
                        <div>
                          {product.language_codes.split(', ').map((code, index) => (
                            <span key={index} className="badge bg-info me-1">{code}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No translations</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${product.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/products/${product.product_id}`)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/products/${product.product_id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
            totalItems={pagination.total}
            itemsPerPage={pagination.per_page}
            showInfo={true}
          />

          {/* Delete Confirmation Modal */}
          {showDeleteModal && productToDelete && (
            <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Delete</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={handleCancelDelete}></button>
                  </div>
                  <div className="modal-body text-center">
                    <p>Are you sure you want to delete the product:</p>
                    <h5 className="mb-3">{productToDelete.name}</h5>
                    {productToDelete.primary_image_url ? (
                      <img
                        src={getImageUrl(productToDelete.primary_image_url)}
                        alt="Primary"
                        style={{ height: "100px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
