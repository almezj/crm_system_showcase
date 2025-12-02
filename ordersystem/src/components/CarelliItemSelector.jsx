import React, { useState, useEffect, useCallback } from 'react';
import { Form, InputGroup, ListGroup, Spinner, Alert } from 'react-bootstrap';
import axiosInstance from '../services/axiosInstance';
import { debounce } from 'lodash';

const CarelliItemSelector = ({ 
  onItemSelect,
  placeholder = "Search Carelli items...",
  disabled = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/carelli-items/search?q=${encodeURIComponent(query)}&limit=20`);
        setSearchResults(response.data.items || []);
      } catch (err) {
        console.error('Error searching Carelli items:', err);
        setError('Failed to search items. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
  };

  const handleItemSelect = (item) => {
    setSearchQuery(item.title);
    setShowResults(false);
    setSearchResults([]);
    onItemSelect(item);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  const clearSelection = () => {
    setSearchQuery('');
    setSelectedItem(null);
    onItemSelect(null);
  };

  return (
    <div className="carelli-item-selector">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          isInvalid={!!error}
        />
        {selectedItem && (
          <InputGroup.Text>
            <i className="fas fa-check text-success"></i>
          </InputGroup.Text>
        )}
        {isLoading && (
          <InputGroup.Text>
            <Spinner animation="border" size="sm" />
          </InputGroup.Text>
        )}
      </InputGroup>

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}

      {showResults && searchResults.length > 0 && (
        <ListGroup className="mt-2 border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {searchResults.map((item) => (
            <ListGroup.Item
              key={item.item_id}
              action
              onClick={() => handleItemSelect(item)}
              className="d-flex justify-content-between align-items-start"
            >
              <div className="flex-grow-1">
                <div className="fw-bold">{item.title}</div>
                <div className="text-muted small">
                  Code: {item.code} | Price: {item.price ? `€${item.price}` : 'N/A'} | Language ID: {item.language_id || 'N/A'}
                </div>
                {item.category_name && (
                  <div className="text-muted small">
                    {item.category_name}
                    {item.subcategory_name && ` > ${item.subcategory_name}`}
                  </div>
                )}
              </div>
              <div className="text-end">
                <small className="text-muted">ID: {item.item_id}</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {showResults && searchQuery && !isLoading && searchResults.length === 0 && (
        <div className="mt-2 text-muted small">
          No items found for "{searchQuery}"
        </div>
      )}

      {selectedItem && (
        <div className="mt-2 p-2 bg-light rounded">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <strong>Selected Item:</strong> {selectedItem.title}
              <br />
              <small className="text-muted">
                Code: {selectedItem.code} | ID: {selectedItem.item_id}
                {selectedItem.price && ` | Price: €${selectedItem.price}`}
                {selectedItem.language_id && ` | Language ID: ${selectedItem.language_id}`}
              </small>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={clearSelection}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarelliItemSelector;
