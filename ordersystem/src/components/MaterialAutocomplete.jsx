import React, { useState } from 'react';
import AutocompleteInput from './AutocompleteInput';
import axios from '../services/axiosInstance';
import { getImageUrl } from '../utils/imageUtils';

const MaterialAutocomplete = ({ 
    value, 
    onChange, 
    onSelect, 
    onMaterialSelect, 
    materials = [], 
    placeholder = "Search materials...", 
    excludeSelected = [] 
}) => {
    const [internalValue, setInternalValue] = useState('');

    const handleInputChange = (newValue) => {
        setInternalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleMaterialSelect = (material) => {
        // Clear the input after selection to allow multiple selections
        setInternalValue('');
        if (onSelect || onMaterialSelect) {
            (onSelect || onMaterialSelect)(material);
        }
    };

    const searchMaterials = async (query) => {
        // If materials prop is provided, filter locally
        if (materials && materials.length > 0) {
            return materials.filter(material => 
                material.name.toLowerCase().includes(query.toLowerCase()) &&
                !excludeSelected.includes(material.material_id || material.id)
            );
        }
        
        // Fallback to API call if no materials provided
        try {
            const response = await axios.get(`/materials/search?q=${encodeURIComponent(query)}`);
            // Filter out already selected materials
            return response.data.filter(material => !excludeSelected.includes(material.material_id || material.id));
        } catch (error) {
            console.error('Error searching materials:', error);
            return [];
        }
    };

    const renderMaterialOption = (material) => (
        <div className="flex items-center space-x-3">
            {material.image_path && (
                <div className="flex-shrink-0">
                    <img
                        src={getImageUrl(material.image_path)}
                        alt={material.name}
                        className="w-12 h-12 object-cover rounded-md"
                        style={{ maxHeight: '48px', width: '48px' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                    {material.name}
                </div>
                {material.code && (
                    <div className="text-sm text-gray-600">
                        Code: {material.code}
                    </div>
                )}
                {material.color && (
                    <div className="text-sm text-gray-600">
                        Color: {material.color}
                    </div>
                )}
                {material.type && (
                    <div className="text-sm text-gray-600">
                        Type: {material.type}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AutocompleteInput
            value={internalValue}
            onChange={handleInputChange}
            onSelect={handleMaterialSelect}
            placeholder={placeholder}
            searchFunction={searchMaterials}
            minChars={3}
            renderOption={renderMaterialOption}
        />
    );
};

export default MaterialAutocomplete; 