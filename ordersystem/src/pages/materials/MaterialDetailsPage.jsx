import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaterialsRequest, deleteMaterialRequest } from '../../redux/materials/actions';
import axios from '../../services/axiosInstance';
import { getImageUrl } from '../../utils/imageUtils';

const MaterialDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { materials, loading, error } = useSelector(state => state.materials);
    const [material, setMaterial] = useState(null);
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    useEffect(() => {
        if (materials.length === 0) {
            dispatch(fetchMaterialsRequest());
        }
    }, [dispatch, materials.length]);

    useEffect(() => {
        if (materials.length > 0) {
            const foundMaterial = materials.find(m => m.id == id);
            setMaterial(foundMaterial);
        }
    }, [materials, id]);

    useEffect(() => {
        if (material) {
            loadMaterialImages();
        }
    }, [material]);

    const loadMaterialImages = async () => {
        if (!material) return;
        
        setLoadingImages(true);
        try {
            const response = await axios.get(`/materials/${material.id}/images`);
            setImages(response.data);
        } catch (error) {
            console.error('Error loading material images:', error);
        } finally {
            setLoadingImages(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this material?')) {
            dispatch(deleteMaterialRequest(material.id));
            navigate('/materials');
        }
    };

    if (loading) {
        return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
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

    if (!material) {
        return (
                <div className="alert alert-warning">
                    Material not found
                </div>
        );
    }

        return (
        <div className="w-100">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="mb-2">{material.name}</h1>
                            <p className="text-muted">Material Details</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Link
                                to={`/materials/${material.id}/edit`}
                                className="btn btn-primary"
                            >
                                Edit Material
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                            >
                                Delete Material
                            </button>
                            <Link
                                to="/materials"
                                className="btn btn-secondary"
                            >
                                Back to Materials
                            </Link>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Material Information</h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>ID:</strong> {material.id}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Name:</strong> {material.name}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Code:</strong> {material.code || 'N/A'}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Color:</strong> {material.color || 'N/A'}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Type:</strong> {material.type || 'N/A'}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Style:</strong> {material.style || 'N/A'}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Description:</strong> {material.description || 'No description available'}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <strong>Status:</strong> <span className={`badge ${material.is_active ? 'bg-success' : 'bg-danger'}`}>
                                            {material.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="mb-0">Material Images</h5>
                                </div>
                                <div className="card-body">
                                    {loadingImages ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : images.length > 0 ? (
                                        <div className="row">
                                            {images.map((image) => (
                                                <div key={image.image_id} className="col-6 mb-3">
                                                    <img
                                                        src={getImageUrl(image.image_path)}
                                                        alt={image.title || 'Material image'}
                                                        className="img-fluid rounded border"
                                                        style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                    {image.title && (
                                                        <p className="text-muted small mt-1 text-truncate" title={image.title}>
                                                            {image.title}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                                            <p className="text-muted mt-2">No images uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialDetailsPage; 