import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMaterialsRequest } from '../../redux/materials/actions';
import axios from '../../services/axiosInstance';

const AddMaterialPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
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
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);

        // Validate required fields
        if (!formData.name.trim()) {
            setFormError('Material name is required');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('FormData before submission:', formData);
            
            // First, create the material data (without image) using axios directly
            console.log('Sending material data as JSON:', formData);
            
            const createResponse = await axios.post('/materials', formData);
            const newMaterialId = createResponse.data.id;
            
            console.log('Material created successfully with ID:', newMaterialId);
            
            // If there's an image, upload it separately
            if (image) {
                console.log('Uploading image separately');
                const imageFormData = new FormData();
                imageFormData.append('image', image);
                imageFormData.append('material_id', newMaterialId);
                imageFormData.append('title', image.name);
                imageFormData.append('description', '');
                
                // DEBUG: Log FormData contents
                for (let [key, value] of imageFormData.entries()) {
                    console.log(`Image FormData entry: ${key} = ${value}`);
                }
                
                // Upload image using the dedicated endpoint
                const imageResponse = await axios.post(`/materials/${newMaterialId}/images`, imageFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                // NICE
                console.log('Image uploaded successfully');
            }
            
            // Refresh the materials list
            dispatch(fetchMaterialsRequest());
            
            // Navigate to material details after successful creation
            setTimeout(() => {
                navigate(`/materials/${newMaterialId}`);
            }, 1000);
        } catch (err) {
            setFormError(err.message || 'Failed to create material');
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/materials');
    };

    return (
        <div className="w-100">
            <div className="row">
                <div className="col-12">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="mb-2">Add New Material</h1>
                            <p className="text-muted">Create a new material with details and image</p>
                        </div>
                        <Link
                            to="/materials"
                            className="btn btn-secondary"
                        >
                            Back to Materials
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
                                    {/* Left Column - Form Fields */}
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
                                                Material Code
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
                                                rows="4"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column - Image Upload */}
                                    <div className="col-lg-6">
                                        <div className="mb-3">
                                            <label htmlFor="image" className="form-label">
                                                Material Image
                                            </label>
                                                        <input
              type="file"
              className="form-control"
              id="image"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleImageChange}
            />
            <div className="form-text">
              Supported formats: JPG, JPEG, PNG, WEBP (max 5MB)
            </div>
                                            <div className="form-text">
                                                Upload an image for the material (optional)
                                            </div>
                                        </div>

                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="mb-3">
                                                <label className="form-label">Image Preview</label>
                                                <div className="border rounded p-2">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="img-fluid"
                                                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Material'
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

export default AddMaterialPage; 