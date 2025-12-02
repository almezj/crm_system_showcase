import React, { useState, useEffect } from 'react';
import AutocompleteInput from './AutocompleteInput';

const CustomerAutocomplete = ({ 
    selectedCustomerId,
    onSelect, 
    customers = [], 
    placeholder = "Search customers...",
    disabled = false
}) => {
    const [internalValue, setInternalValue] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Update selected customer display when selectedCustomerId changes
    useEffect(() => {
        if (selectedCustomerId) {
            const customer = customers.find(c => c.person_id === selectedCustomerId);
            if (customer) {
                setSelectedCustomer(customer);
                setInternalValue(`${customer.first_name} ${customer.last_name}`);
            } else {
                setSelectedCustomer(null);
                setInternalValue('');
            }
        } else {
            setSelectedCustomer(null);
            setInternalValue('');
        }
    }, [selectedCustomerId, customers]);

    const handleInputChange = (newValue) => {
        setInternalValue(newValue);
        // If user starts typing, clear the selection
        if (selectedCustomer && newValue !== `${selectedCustomer.first_name} ${selectedCustomer.last_name}`) {
            setSelectedCustomer(null);
            if (onSelect) {
                onSelect(null);
            }
        }
    };

    const handleCustomerSelect = (customer) => {
        if (customer) {
            const customerName = `${customer.first_name} ${customer.last_name}`;
            setSelectedCustomer(customer);
            // Set the value - AutocompleteInput's useEffect will sync this to display
            setInternalValue(customerName);
            if (onSelect) {
                onSelect(customer);
            }
        }
    };

    const searchCustomers = async (query) => {
        // Filter customers locally by name
        if (customers && customers.length > 0) {
            const queryLower = query.toLowerCase();
            return customers.filter(customer => {
                const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase();
                const email = (customer.email || '').toLowerCase();
                return fullName.includes(queryLower) || email.includes(queryLower);
            });
        }
        
        return [];
    };

    const renderCustomerOption = (customer) => (
        <div>
            <div className="fw-medium">
                {customer.first_name} {customer.last_name}
            </div>
            {customer.email && (
                <div className="text-muted small">
                    {customer.email}
                </div>
            )}
            {customer.phone && (
                <div className="text-muted small">
                    {customer.phone}
                </div>
            )}
        </div>
    );

    return (
        <AutocompleteInput
            value={internalValue}
            onChange={handleInputChange}
            onSelect={handleCustomerSelect}
            placeholder={placeholder}
            searchFunction={searchCustomers}
            minChars={2}
            renderOption={renderCustomerOption}
            className={disabled ? "opacity-50" : ""}
        />
    );
};

export default CustomerAutocomplete;

