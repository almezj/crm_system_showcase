import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchPersonByIdRequest,
    updatePersonRequest,
    fetchPersonTypesRequest,
    fetchAddressTypesRequest,
} from "../../redux/persons/actions";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button } from "react-bootstrap";

const EditPersonPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { person, personTypes, addressTypes, loading, error } = useSelector(
        (state) => state.persons
    );

    const [activeTab, setActiveTab] = useState(0);
    const [personData, setPersonData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        person_type_id: "",
        is_active: true,
        addresses: [],
    });
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAddressIndex, setEditingAddressIndex] = useState(null);
    const [newAddressMode, setNewAddressMode] = useState(false);
    const [newAddress, setNewAddress] = useState({
        address_type_id: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
    });

    useEffect(() => {
        dispatch(fetchPersonByIdRequest(id));
        dispatch(fetchPersonTypesRequest());
        dispatch(fetchAddressTypesRequest());
    }, [dispatch, id]);

    useEffect(() => {
        if (person) {
            setPersonData({
                ...person,
                person_type_id: person.person_type_id || "",
                addresses: person.addresses || [],
            });
            setSavedAddresses(person.addresses || []);
        }
    }, [person]);

    const handleInputChange = (field, value) => {
        setPersonData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (addressTypeId, field, value) => {
        setPersonData((prev) => {
            const existingAddressIndex = prev.addresses.findIndex(
                addr => addr.address_type_id === addressTypeId
            );

            if (existingAddressIndex >= 0) {
                // Update existing address
                const updatedAddresses = [...prev.addresses];
                updatedAddresses[existingAddressIndex] = {
                    ...updatedAddresses[existingAddressIndex],
                    [field]: value
                };
                return { ...prev, addresses: updatedAddresses };
            } else {
                // Create new address
                const newAddress = {
                    address_type_id: addressTypeId,
                    street: "",
                    city: "",
                    state: "",
                    postal_code: "",
                    country: "",
                    [field]: value
                };
                return { ...prev, addresses: [...prev.addresses, newAddress] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const submitData = {
                ...personData,
                person_id: id,
            };

            // Dispatch the update action
            dispatch(updatePersonRequest(submitData));

            // Wait for the update to complete
            await new Promise((resolve) => {
                const unsubscribe = () => {
                    if (!loading) {
                        resolve();
                    }
                };
                unsubscribe();
            });

            setSavedAddresses(personData.addresses);
            toast.success('Person updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate("/persons");
        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error?.message || 'Failed to update person', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to check if an address is empty
    const isAddressEmpty = (address) => {
        return !address || !address.street && !address.city && !address.state && 
               !address.postal_code && !address.country;
    };

    // Helper function to check if an address has been modified
    const isAddressModified = (addressTypeId) => {
        const currentAddress = personData.addresses.find(addr => addr.address_type_id === addressTypeId);
        const savedAddress = savedAddresses.find(addr => addr.address_type_id === addressTypeId);
        if (!savedAddress) return !isAddressEmpty(currentAddress);
        return JSON.stringify(currentAddress) !== JSON.stringify(savedAddress);
    };

    // Create tabs based on address types
    const addressTabs = addressTypes.map((type, index) => {
        const address = personData.addresses.find(addr => addr.address_type_id === type.address_type_id);
        const isEmpty = isAddressEmpty(address);
        const isModified = isAddressModified(type.address_type_id);
        const isSaved = savedAddresses.find(addr => addr.address_type_id === type.address_type_id) && !isModified;

        let tabClass = 'text-secondary'; // Grey for empty
        if (!isEmpty) {
            if (isSaved) {
                tabClass = 'text-success'; // Green for saved
            } else if (isModified) {
                tabClass = 'text-primary'; // Blue for modified
            }
        }

        return {
            index,
            addressTypeId: type.address_type_id,
            address,
            label: type.type_name,
            tabClass
        };
    });

    const getCurrentAddress = () => {
        const activeAddressType = addressTabs[activeTab]?.addressTypeId;
        const found = personData.addresses.find(addr => addr.address_type_id === activeAddressType);
        return {
            address_type_id: activeAddressType,
            street: found?.street || "",
            city: found?.city || "",
            state: found?.state || "",
            postal_code: found?.postal_code || "",
            country: found?.country || "",
        };
    };

    // Directly copy address fields from another address into the current tab
    const handleTemplateSelect = (addressTypeId, templateAddressTypeId) => {
        if (!templateAddressTypeId) return;
        // Always compare as strings
        const template = personData.addresses.find(
            addr => String(addr.address_type_id) === String(templateAddressTypeId)
        );
        if (!template) return;
        const fieldsToCopy = ['street', 'city', 'state', 'postal_code', 'country'];
        setPersonData((prev) => {
            const updatedAddresses = [...prev.addresses];
            const idx = updatedAddresses.findIndex(
                addr => String(addr.address_type_id) === String(addressTypeId)
            );
            const newAddress = {
                address_type_id: addressTypeId,
            };
            fieldsToCopy.forEach(field => {
                newAddress[field] = template[field] || '';
            });
            if (idx >= 0) {
                updatedAddresses[idx] = newAddress;
            } else {
                updatedAddresses.push(newAddress);
            }
            return { ...prev, addresses: updatedAddresses };
        });
    };

    // Clear the current address form for the active tab
    const handleClearCurrentAddress = () => {
        const activeAddressType = addressTabs[activeTab]?.addressTypeId;
        setPersonData((prev) => {
            const updatedAddresses = prev.addresses.filter(
                addr => String(addr.address_type_id) !== String(activeAddressType)
            );
            return { ...prev, addresses: updatedAddresses };
        });
    };

    // Handle address field change for editing
    const handleEditAddressChange = (index, field, value) => {
        setPersonData((prev) => ({
            ...prev,
            addresses: prev.addresses.map((addr, i) =>
                i === index ? { ...addr, [field]: value } : addr
            ),
        }));
    };

    const handleNewAddressChange = (field, value) => {
        setNewAddress((prev) => ({ ...prev, [field]: value }));
    };

    // Save edited address
    const handleSaveEditAddress = (index) => {
        setEditingAddressIndex(null);
    };

    // Cancel
    const handleCancelEditAddress = () => {
        setEditingAddressIndex(null);
    };

    // Save new address
    const handleSaveNewAddress = () => {
        setPersonData((prev) => ({
            ...prev,
            addresses: [...prev.addresses, newAddress],
        }));
        setNewAddressMode(false);
        setNewAddress({
            address_type_id: "",
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: "",
        });
    };

    // Cancel new address
    const handleCancelNewAddress = () => {
        setNewAddressMode(false);
        setNewAddress({
            address_type_id: "",
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: "",
        });
    };

    // Remove address
    const handleRemoveAddress = (index) => {
        setPersonData((prev) => ({
            ...prev,
            addresses: prev.addresses.filter((_, i) => i !== index),
        }));
    };



    return (
        <div>
            <h1 className="mb-4">Edit Person</h1>
            <form onSubmit={handleSubmit}>
                {/* Basic Details */}
                <div className="card mb-4">
                    <div className="card-header">Basic Details</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label>First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={personData.first_name}
                                onChange={(e) =>
                                    handleInputChange("first_name", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label>Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={personData.last_name}
                                onChange={(e) => handleInputChange("last_name", e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={personData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label>Phone</label>
                            <input
                                type="text"
                                className="form-control"
                                value={personData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label>Person Type</label>
                            <select
                                className="form-select"
                                value={personData.person_type_id || ""}
                                onChange={(e) =>
                                    handleInputChange("person_type_id", e.target.value)
                                }
                            >
                                <option value="" disabled>
                                    Select Type
                                </option>
                                {personTypes.map((type) => (
                                    <option
                                        key={type.person_type_id}
                                        value={type.person_type_id}
                                    >
                                        {type.type_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Addresses List */}
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Addresses</span>
                        <Button variant="success" size="sm" onClick={() => setNewAddressMode(true)} disabled={newAddressMode}>
                            Add new
                        </Button>
                    </div>
                    <div className="card-body">
                        {personData.addresses && personData.addresses.length > 0 ? (
                            <div className="row w-100">
                                {personData.addresses.map((address, idx) => (
                                    <div key={address.address_id || idx} className="col-12 col-md-6 col-lg-4 mb-4">
                                        <div className="p-3 border rounded h-100 bg-light">
                                            {editingAddressIndex === idx ? (
                                                <div>
                                                    <div className="row">
                                                        <div className="col-12 mb-2">
                                                            <label>Type</label>
                                                            <select
                                                                className="form-select"
                                                                value={address.address_type_id || ""}
                                                                onChange={e => handleEditAddressChange(idx, "address_type_id", e.target.value)}
                                                            >
                                                                <option value="" disabled>Select Type</option>
                                                                {addressTypes.map(type => (
                                                                    <option key={type.address_type_id} value={type.address_type_id}>
                                                                        {type.type_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-12 mb-2">
                                                            <label>Street</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={address.street}
                                                                onChange={e => handleEditAddressChange(idx, "street", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-12 mb-2">
                                                            <label>Floor</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={address.floor || ""}
                                                                onChange={e => handleEditAddressChange(idx, "floor", e.target.value)}
                                                                min="0"
                                                                placeholder="Floor number"
                                                                title="Enter floor number (0 for ground floor)"
                                                            />
                                                            <small className="form-text text-muted">
                                                                Floor number for delivery surcharge calculations
                                                            </small>
                                                        </div>
                                                        <div className="col-12 mb-2">
                                                            <label>City</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={address.city}
                                                                onChange={e => handleEditAddressChange(idx, "city", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-12 mb-2">
                                                            <label>State/Province</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={address.state}
                                                                onChange={e => handleEditAddressChange(idx, "state", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-12 mb-2">
                                                            <label>Postal Code</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={address.postal_code}
                                                                onChange={e => handleEditAddressChange(idx, "postal_code", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-12 mb-2">
                                                            <label>Country</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={address.country}
                                                                onChange={e => handleEditAddressChange(idx, "country", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 d-flex gap-2">
                                                        <Button variant="primary" size="sm" onClick={() => handleSaveEditAddress(idx)}>
                                                            Save
                                                        </Button>
                                                        <Button variant="secondary" size="sm" onClick={handleCancelEditAddress}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleRemoveAddress(idx)}>
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="mb-1"><strong>Type:</strong> {addressTypes.find(type => String(type.address_type_id) === String(address.address_type_id))?.type_name || address.address_type_id || 'N/A'}</p>
                                                    <p className="mb-1"><strong>Street:</strong> {address.street}</p>
                                                    {address.floor !== null && address.floor !== undefined && address.floor !== "" && (
                                                        <p className="mb-1"><strong>Floor:</strong> {address.floor}</p>
                                                    )}
                                                    <p className="mb-1"><strong>City:</strong> {address.city}</p>
                                                    <p className="mb-1"><strong>State/Province:</strong> {address.state}</p>
                                                    <p className="mb-1"><strong>Postal Code:</strong> {address.postal_code}</p>
                                                    <p className="mb-1"><strong>Country:</strong> {address.country}</p>
                                                    <div className="mt-2 d-flex gap-2">
                                                        <Button variant="outline-primary" size="sm" onClick={() => setEditingAddressIndex(idx)}>
                                                            Edit
                                                        </Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleRemoveAddress(idx)}>
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No addresses available.</p>
                        )}

                        {/* New Address Form */}
                        {newAddressMode && (
                            <div className="mb-3 p-3 border rounded bg-light">
                                <div className="row">
                                    <div className="col-12 mb-2">
                                        <label>Type</label>
                                        <select
                                            className="form-select"
                                            value={newAddress.address_type_id || ""}
                                            onChange={e => handleNewAddressChange("address_type_id", e.target.value)}
                                        >
                                            <option value="" disabled>Select Type</option>
                                            {addressTypes.map(type => (
                                                <option key={type.address_type_id} value={type.address_type_id}>
                                                    {type.type_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 mb-2">
                                        <label>Street</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newAddress.street}
                                            onChange={e => handleNewAddressChange("street", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mb-2">
                                        <label>Floor</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newAddress.floor || ""}
                                            onChange={e => handleNewAddressChange("floor", e.target.value)}
                                            min="0"
                                            placeholder="Floor number"
                                            title="Enter floor number (0 for ground floor)"
                                        />
                                        <small className="form-text text-muted">
                                            Floor number for delivery surcharge calculations
                                        </small>
                                    </div>
                                    <div className="col-12 mb-2">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newAddress.city}
                                            onChange={e => handleNewAddressChange("city", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mb-2">
                                        <label>State/Province</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newAddress.state}
                                            onChange={e => handleNewAddressChange("state", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mb-2">
                                        <label>Postal Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newAddress.postal_code}
                                            onChange={e => handleNewAddressChange("postal_code", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mb-2">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newAddress.country}
                                            onChange={e => handleNewAddressChange("country", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 d-flex gap-2">
                                    <Button variant="primary" size="sm" onClick={handleSaveNewAddress}>
                                        Save
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={handleCancelNewAddress}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="form-check form-switch mb-4">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={personData.is_active}
                        onChange={(e) => handleInputChange("is_active", e.target.checked)}
                    />
                    <label className="form-check-label">Active</label>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary" disabled={loading || isSubmitting}>
                    {loading || isSubmitting ? "Updating..." : "Update Person"}
                </button>
                {error && <p className="text-danger mt-3">Error: {error}</p>}
            </form>
        </div>
    );
};

export default EditPersonPage;
