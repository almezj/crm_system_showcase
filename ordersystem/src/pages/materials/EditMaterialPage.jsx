import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaterialsRequest, updateMaterialRequest } from '../../redux/materials/actions';
import { getImageUrl } from '../../utils/imageUtils';
import axios from '../../services/axiosInstance';

const EditMaterialPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { materials, loading, error, updating } = useSelector(state => state.materials);
    
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        color: '',
        type: '',
        style: '',
        description: ''
    });
    
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (materials.length === 0) {
            dispatch(fetchMaterialsRequest());
        }
    }, [dispatch, materials.length]);

    useEffect(() => {
        if (materials.length > 0) {
            const material = materials.find(m => m.id == id);
            if (material) {
                setFormData({
                    name: material.name || '',
                    code: material.code || '',
                    color: material.color || '',
                    type: material.type || '',
                    style: material.style || '',
                    description: material.description || ''
                });
                if (material.image_path) {
                    setCurrentImage(material.image_path);
                }
            }
        }
    }, [materials, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validate required fields
        if (!formData.name.trim()) {
            setFormError('Material name is required');
            return;
        }

        try {
            console.log('FormData before submission:', formData);
            
            // First, update the material data (without image) using axios directly
            console.log('Sending material data as JSON:', formData);
            console.log('FormData keys:', Object.keys(formData));
            console.log('FormData values:', Object.values(formData));
            
            const updateResponse = await axios.patch(`/materials/${id}`, formData);
            
            console.log('Material updated successfully');
            
            // If there's an image, upload it separately
            if (image) {
                console.log('Uploading image separately');
                const imageFormData = new FormData();
                imageFormData.append('image', image);
                imageFormData.append('material_id', id);
                imageFormData.append('title', image.name);
                imageFormData.append('description', '');
                
                // Debug: Log FormData contents
                for (let [key, value] of imageFormData.entries()) {
                    console.log(`Image FormData entry: ${key} = ${value}`);
                }
                
                // Upload image using the dedicated endpoint
                const imageResponse = await axios.post(`/materials/${id}/images`, imageFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                console.log('Image uploaded successfully');
            }
            
            // Refresh the materials list
            dispatch(fetchMaterialsRequest());
            
            // Navigate back to material details after successful update
            setTimeout(() => {
                navigate(`/materials/${id}`);
            }, 1000);
        } catch (err) {
            setFormError(err.message || 'Failed to update material');
        }
    };

    const handleCancel = () => {
        navigate(`/materials/${id}`);
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

    const material = materials.find(m => m.id == id);
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
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="mb-2">Edit Material</h1>
                            <p className="text-muted">Update material details and image</p>
                        </div>
                        <Link
                            to={`/materials/${id}`}
                            className="btn btn-secondary"
                        >
                            Back to Material
                        </Link>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Error Message */}
                                {formError && (
                                    <div className="alert alert-danger">
                                        {formError}
                                    </div>
                                )}

                                <div className="row">
                                    {/* Left Column */}
                                    <div className="col-lg-6">
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label">
                                                Material Name *
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="code" className="form-label">
                                                Code
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="code"
                                                name="code"
                                                value={formData.code}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="color" className="form-label">
                                                Color
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="color"
                                                name="color"
                                                value={formData.color}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="type" className="form-label">
                                                Type
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="type"
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="style" className="form-label">
                                                Style
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="style"
                                                name="style"
                                                value={formData.style}
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
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={4}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="col-lg-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Material Image
                                            </label>
                                            
                                            {/* Current Image */}
                                            {currentImage && !imagePreview && (
                                                <div className="mb-3">
                                                    <p className="text-muted small mb-2">Current Image:</p>
                                                    <img
                                                        src={getImageUrl(currentImage)}
                                                        alt="Current material"
                                                        className="img-fluid rounded border"
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* New Image Preview */}
                                            {imagePreview && (
                                                <div className="mb-3">
                                                    <p className="text-muted small mb-2">New Image Preview:</p>
                                                    <img
                                                        src={imagePreview}
                                                        alt="New material preview"
                                                        className="img-fluid rounded border"
                                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}

                                            {/* File Input */}
                                            <div className="border border-dashed border-secondary rounded p-4 text-center">
                                                <input
                                                    type="file"
                                                    className="form-control d-none"
                                                    accept=".jpg,.jpeg,.png,.webp"
                                                    onChange={handleImageChange}
                                                    id="image-upload"
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="cursor-pointer"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="bi bi-cloud-upload fs-1 text-muted"></i>
                                                    <p className="mt-2 mb-1">Click to upload a new image</p>
                                                    <p className="text-muted small">JPG, JPEG, PNG, WEBP up to 5MB</p>
                                                </label>
                                            </div>

                                            {image && (
                                                <div className="mt-2">
                                                    <span className="text-success small">
                                                        <i className="bi bi-check-circle"></i> {image.name} selected
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="btn btn-primary"
                                    >
                                        {updating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Material'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditMaterialPage; 