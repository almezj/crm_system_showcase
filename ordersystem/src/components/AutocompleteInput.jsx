import React, { useState, useEffect, useRef } from 'react';

const AutocompleteInput = ({
    value,
    onChange,
    onSelect,
    placeholder = "Type to search...",
    searchFunction,
    minChars = 3,
    renderOption,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const [hasSelection, setHasSelection] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = async (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        
        // If user is typing after a selection, clear the selection flag and allow new search
        if (hasSelection) {
            setHasSelection(false);
        }
        
        // Always call onChange to update parent component
        onChange(newValue);

        if (newValue.length >= minChars) {
            setLoading(true);
            try {
                const results = await searchFunction(newValue);
                setOptions(results);
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        } else {
            setOptions([]);
            setIsOpen(false);
        }
    };

    const handleOptionClick = (option) => {
        // Clear the input to allow for multiple selections
        setInputValue('');
        setHasSelection(false);
        // Call onSelect to handle the selection
        onSelect(option);
        // Close the dropdown
        setIsOpen(false);
        setOptions([]);
    };

    const handleInputFocus = () => {
        if (inputValue.length >= minChars && options.length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div ref={wrapperRef} className={`position-relative ${className}`}>
            <div className="position-relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="form-control"
                    data-testid="autocomplete-input"
                />
                
                {loading && (
                    <div className="position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="spinner-border spinner-border-sm text-primary" role="status" data-testid="autocomplete-loading">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
            </div>

            {isOpen && options.length > 0 && (
                <div 
                    className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg" 
                    style={{ zIndex: 1050, maxHeight: '240px', overflowY: 'auto' }}
                    data-testid="autocomplete-dropdown"
                >
                    <ul className="list-group list-group-flush mb-0">
                        {options.map((option, index) => (
                            <li
                                key={option.id || index}
                                onClick={() => handleOptionClick(option)}
                                className="list-group-item list-group-item-action"
                                style={{ cursor: 'pointer' }}
                            >
                                {renderOption ? renderOption(option) : (
                                    <div>
                                        <div className="fw-medium">
                                            {option.name || option.internal_manufacturer_code}
                                        </div>
                                        {option.code && (
                                            <div className="text-muted small">
                                                Code: {option.code}
                                            </div>
                                        )}
                                        {option.color && (
                                            <div className="text-muted small">
                                                Color: {option.color}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AutocompleteInput; 