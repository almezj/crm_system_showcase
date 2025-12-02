import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createPersonRequest, clearCreatedPerson } from '../../redux/persons/actions';
import AddPersonPage from '../../pages/persons/AddPersonPage';

const AddCustomerModal = ({ show, onHide, onCustomerCreated }) => {
  const dispatch = useDispatch();
  const { loading, error, person } = useSelector((state) => state.persons);
  const [formData, setFormData] = useState(null);

  // Watch for successful person creation
  useEffect(() => {
    console.log('Modal effect - loading:', loading, 'error:', error, 'person:', person);
    if (!loading && !error && person) {
      console.log('Customer created successfully:', person);
      onCustomerCreated(person);
      onHide();
      setFormData(null);
      dispatch(clearCreatedPerson());
    }
  }, [loading, error, person, onCustomerCreated, onHide, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('AddCustomerModal handleSubmit called with:', formData);

    try {
      if (!formData.person_type_id) {
        throw new Error('Please select a person type');
      }

      const submissionData = {
        ...formData,
        person_type: "customer",
        create_without_address: formData.noAddress || false
      };

      // Only include addresses if not creating without address
      if (!formData.noAddress && formData.addresses) {
        submissionData.addresses = formData.addresses.map(addr => ({
          ...addr,
          address_type: 'billing'
        }));
      }

      console.log('Dispatching createPersonRequest with:', submissionData);
      dispatch(createPersonRequest(submissionData));
    } catch (error) {
      console.error('Error in AddCustomerModal handleSubmit:', error);
    }
  };

  const isFormValid = formData && 
    formData.first_name && 
    formData.last_name && 
    formData.email && 
    formData.person_type_id;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Customer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AddPersonPage
          onSubmit={(data) => setFormData(data)}
          isModal={true}
          hideSubmitButton={true}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
        >
          {loading ? "Creating..." : "Create Customer"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCustomerModal; 