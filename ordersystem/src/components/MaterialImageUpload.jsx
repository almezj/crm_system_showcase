import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from '../services/axiosInstance';
import { getImageUrl } from '../utils/imageUtils';

const MaterialImageUpload = ({ materialId, onImageUploaded, onImageDeleted }) => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        
        for (const file of acceptedFiles) {
            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('material_id', materialId);
                formData.append('title', file.name);
                formData.append('description', '');

                const response = await axios.post(`/materials/${materialId}/images`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    const newImage = {
                        image_id: response.data.image_id,
                        image_path: response.data.image_path,
                        title: file.name,
                        description: '',
                        uploaded_at: new Date().toISOString()
                    };
                    
                    setImages(prev => [...prev, newImage]);
                    if (onImageUploaded) {
                        onImageUploaded(newImage);
                    }
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                // Error handling moved to toast notifications
            }
        }
        
        setUploading(false);
    }, [materialId, onImageUploaded]);

    const handleDeleteImage = async (imageId) => {
        try {
            const response = await axios.delete(`/materials/${materialId}/images/${imageId}`);
            if (response.data.success) {
                setImages(prev => prev.filter(img => img.image_id !== imageId));
                if (onImageDeleted) {
                    onImageDeleted(imageId);
                }
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            // Error handling moved to toast notifications
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        multiple: true
    });

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Uploading...</span>
                    </div>
                ) : isDragActive ? (
                    <p className="text-blue-600">Drop the images here...</p>
                ) : (
                    <div>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            Drag and drop images here, or click to select files
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 5MB each
                        </p>
                    </div>
                )}
            </div>

            {/* Uploaded Images */}
            {images.length > 0 && (
                <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image) => (
                            <div key={image.image_id} className="relative group">
                                <img
                                    src={getImageUrl(image.image_path)}
                                    alt={image.title || 'Material image'}
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <button
                                        onClick={() => handleDeleteImage(image.image_id)}
                                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                                        title="Delete image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {image.title && (
                                    <p className="text-xs text-gray-600 mt-1 truncate" title={image.title}>
                                        {image.title}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialImageUpload; 