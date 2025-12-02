import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductByIdRequest } from "../../redux/products/actions";
import { fetchPiecesRequest } from "../../redux/pieces/actions";
import axios from "../../services/axiosInstance";
import { getImageUrl } from "../../utils/imageUtils";
import { formatPrice } from "../../utils/currencyUtils";
import { Card, Badge, Button, Image, Tab, Nav } from "react-bootstrap";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.products);
  const { pieces, loading: piecesLoading, error: piecesError } = useSelector((state) => state.pieces);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [metadata, setMetadata] = useState([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdRequest(id));
      dispatch(fetchPiecesRequest(id));
      loadProductImages(id);
      loadProductMetadata(id);
    }
  }, [dispatch, id]);

  const loadProductImages = async (productId) => {
    try {
      console.log("Loading images for product:", productId);
      // Add timestamp to prevent caching
      const response = await axios.get(`products/${productId}/images?t=${Date.now()}`);
      console.log("Received images data:", response.data);
      setImages(response.data);
      // Set the primary image as selected by default
      const primaryImage = response.data.find(img => img.is_primary === '1' || img.is_primary === true);
      if (primaryImage) {
        setSelectedImage(primaryImage);
      } else if (response.data.length > 0) {
        setSelectedImage(response.data[0]);
      }
    } catch (err) {
      console.error("Error loading product images:", err);
    }
  };

  const loadProductMetadata = async (productId) => {
    try {
      const response = await axios.get(`products/${productId}/metadata`);
      setMetadata(response.data);
    } catch (err) {
      console.error("Error loading product metadata:", err);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    if (!id) return;
    try {
      await axios.post(`products/${id}/images/${imageId}/primary`);
      // Refresh images after setting primary
      loadProductImages(id);
    } catch (err) {
      console.error("Error setting primary image:", err);
    }
  };

  const handleUnsetPrimaryImage = async () => {
    if (!id) return;
    try {
      console.log("Unsetting primary image for product:", id);
      await axios.post(`products/${id}/images/unset-primary`);
      console.log("Primary image unset successfully, refreshing images...");
      // Refresh images after unsetting primary
      await loadProductImages(id);
      console.log("Images refreshed after unset primary");
    } catch (err) {
      console.error("Error unsetting primary image:", err);
    }
  };

  // Get pieces for this product
  const productPieces = pieces[id] || [];
  
  // Debug: Log piece data to see if images are included
  useEffect(() => {
    if (productPieces.length > 0) {
      console.log('Product pieces with images:', productPieces);
    }
  }, [productPieces]);

  if (loading) {
    return <div className="alert alert-info">Loading product details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!product) {
    return <div className="alert alert-warning">Product not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{product.name}</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/products/${id}/edit`)}
        >
          Edit Product
        </button>
      </div>
      
      {/* Product Images */}
      {images.length > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Product Images</h3>
            {images.some(img => img.is_primary === '1' || img.is_primary === true) && (
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={handleUnsetPrimaryImage}
              >
                Unset Primary Image
              </button>
            )}
          </div>
          {/* Main Image Display */}
          {selectedImage && (
            <div className="mb-3">
              <img
                src={getImageUrl(selectedImage.image_url)}
                className="img-fluid rounded"
                alt="Selected Product"
                style={{ maxHeight: "400px", width: "auto", margin: "0 auto", display: "block" }}
              />
            </div>
          )}
          {/* Thumbnail Gallery */}
          <div className="row">
            {images.map((image) => (
              <div key={image.product_image_id} className="col-md-2 col-4 mb-3">
                <div 
                  className={`card cursor-pointer ${selectedImage?.product_image_id === image.product_image_id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedImage(image)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={getImageUrl(image.image_url)}
                    className="card-img-top"
                    alt="Product"
                    style={{ height: "100px", objectFit: "cover" }}
                  />
                  <div className="card-body p-2">
                    {image.is_primary === '1' || image.is_primary === true ? (
                      <span className="badge bg-success">Primary</span>
                    ) : (
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleSetPrimaryImage(image.product_image_id)}
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabbed Interface */}
      <Tab.Container id="product-tabs" defaultActiveKey="general">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="general">General Information</Nav.Link>
          </Nav.Item>
          {product.translations && product.translations.map((translation, index) => (
            <Nav.Item key={translation.translation_id || index}>
              <Nav.Link eventKey={`translation-${translation.translation_id || index}`}>
                {translation.language_name || `Translation ${index + 1}`} ({translation.language_code})
              </Nav.Link>
            </Nav.Item>
          ))}
          <Nav.Item>
            <Nav.Link eventKey="metadata">Metadata</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="pieces">Pieces</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* General Information Tab */}
          <Tab.Pane eventKey="general">
            <div className="row">
              <div className="col-md-6">
                <h3>Product Details</h3>
                <table className="table">
                  <tbody>
                    <tr>
                      <th>ID:</th>
                      <td>{product.product_id}</td>
                    </tr>
                    <tr>
                      <th>Name:</th>
                      <td>{product.name}</td>
                    </tr>
                    <tr>
                      <th>Description:</th>
                      <td>{product.description || 'No description'}</td>
                    </tr>
                    <tr>
                      <th>Base Price:</th>
                      <td>{formatPrice(product.base_price, 'CZK')}</td>
                    </tr>
                    <tr>
                      <th>Manufacturer:</th>
                      <td>{product.manufacturer_name}</td>
                    </tr>
                    <tr>
                      <th>Customizable:</th>
                      <td>{product.is_customizable ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <th>Status:</th>
                      <td>
                        <span className={`badge ${product.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Pane>

          {/* Translation Tabs */}
          {product.translations && product.translations.map((translation, index) => (
            <Tab.Pane key={translation.translation_id || index} eventKey={`translation-${translation.translation_id || index}`}>
              <div className="row">
                <div className="col-md-8">
                  <h3>{translation.language_name || `Translation ${index + 1}`} Details</h3>
                  <table className="table">
                    <tbody>
                      <tr>
                        <th>Language:</th>
                        <td>{translation.language_name} ({translation.language_code})</td>
                      </tr>
                      <tr>
                        <th>Name:</th>
                        <td>{translation.name}</td>
                      </tr>
                      <tr>
                        <th>Description:</th>
                        <td>
                          <div dangerouslySetInnerHTML={{ __html: translation.description || 'No description' }} />
                        </td>
                      </tr>
                      <tr>
                        <th>Base Price:</th>
                        <td>
                          {translation.currency_symbol || '$'}{Number(translation.base_price).toFixed(2)} {translation.currency_code || 'USD'}
                        </td>
                      </tr>
                      {translation.web_id && (
                        <tr>
                          <th>Carelli Item ID:</th>
                          <td>
                            <span className="badge bg-info">{translation.web_id}</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tab.Pane>
          ))}

          {/* Metadata Tab */}
          <Tab.Pane eventKey="metadata">
            <div className="mb-4">
              <h3>Product Metadata</h3>
              <p className="text-muted mb-3">
                These metadata fields will be inherited by proposal items when this product is added to a proposal.
              </p>
              {metadata.length === 0 ? (
                <div className="alert alert-info">
                  No metadata fields defined for this product.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Key Name</th>
                        <th>Default Value</th>
                        <th>Mandatory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metadata.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.key_name}</strong>
                          </td>
                          <td>
                            {item.value || (
                              <span className="text-muted">No default value</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${item.is_mandatory ? 'bg-warning' : 'bg-secondary'}`}>
                              {item.is_mandatory ? 'Required' : 'Optional'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tab.Pane>

                    {/* Pieces Tab */}
          <Tab.Pane eventKey="pieces">
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Product Pieces</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/pieces/add?product_id=${id}`)}
                >
                  Add Piece
                </button>
              </div>
              
              {piecesLoading ? (
                <div className="alert alert-info">Loading pieces...</div>
              ) : piecesError ? (
                <div className="alert alert-danger">Error loading pieces: {piecesError}</div>
              ) : productPieces.length === 0 ? (
                <div className="alert alert-warning">No pieces found for this product.</div>
              ) : (
                <div className="row">
                  {productPieces.map((piece) => (
                    <div key={piece.piece_id} className="col-md-6 col-lg-4 mb-3">
                      <Card className="h-100 shadow-sm">
                        {/* Piece Image */}
                        {piece.images && piece.images.length > 0 ? (
                          <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                            <Image 
                              src={getImageUrl(piece.images.find(img => img.is_primary)?.image_url || piece.images[0].image_url)}
                              alt={piece.internal_manufacturer_code}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                            <div className="position-absolute top-0 end-0 m-2">
                              <Badge bg="warning" className="text-dark">
                                {piece.images.length} {piece.images.length === 1 ? 'image' : 'images'}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="position-relative" style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                            <div className="d-flex align-items-center justify-content-center h-100">
                              <div className="text-center text-muted">
                                <i className="fas fa-image fa-3x mb-2"></i>
                                <p className="mb-0">No images</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title mb-0">{piece.internal_manufacturer_code}</h5>
                            <Badge bg={piece.is_active ? 'success' : 'secondary'}>
                              {piece.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          {piece.ean_code && (
                            <p className="card-text mb-1">
                              <small className="text-muted">
                                <strong>EAN:</strong> {piece.ean_code}
                              </small>
                            </p>
                          )}
                          
                          {piece.qr_code && (
                            <p className="card-text mb-1">
                              <small className="text-muted">
                                <strong>QR:</strong> {piece.qr_code}
                              </small>
                            </p>
                          )}
                          
                          {piece.description && (
                            <p className="card-text mb-2">
                              <small className="text-muted">{piece.description}</small>
                            </p>
                          )}
                          
                          <div className="mt-auto pt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => navigate(`/pieces/${piece.piece_id}`)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              View Details
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => navigate(`/pieces/${piece.piece_id}/edit`)}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Edit
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default ProductDetailsPage;
