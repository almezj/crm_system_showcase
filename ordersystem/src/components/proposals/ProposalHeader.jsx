import React from 'react';
import AddCustomerModal from '../modals/AddCustomerModal';
import CustomerAutocomplete from '../CustomerAutocomplete';

const ProposalHeader = ({ 
  formData, 
  customers, 
  languages, 
  isEdit, 
  onInputChange, 
  onNewCustomer, 
  showNewCustomerModal, 
  setShowNewCustomerModal,
  onCustomerSelect
}) => {
  return (
    <div data-testid="proposal-header">
      {/* Customer Details */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label htmlFor="prospect_id" className="form-label mb-0">
            Customer
          </label>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowNewCustomerModal(true)}
            data-testid="add-customer-btn"
          >
            New Customer
          </button>
        </div>
        {isEdit ? (
          <input
            type="text"
            className="form-control"
            value={customers.find(c => c.person_id === formData.prospect_id) 
              ? `${customers.find(c => c.person_id === formData.prospect_id).first_name} ${customers.find(c => c.person_id === formData.prospect_id).last_name}`
              : ''}
            disabled
            data-testid="customer-display"
          />
        ) : (
          <CustomerAutocomplete
            selectedCustomerId={formData.prospect_id}
            onSelect={onCustomerSelect}
            customers={customers}
            placeholder="Type to search customers..."
            data-testid="customer-autocomplete"
          />
        )}
        <input
          type="hidden"
          name="prospect_id"
          value={formData.prospect_id || ''}
          required
        />
      </div>

      {/* Proposal Details */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="valid_until" className="form-label">
            Valid Until
          </label>
          <input
            type="date"
            id="valid_until"
            name="valid_until"
            className="form-control"
            value={formData.valid_until}
            onChange={onInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
            data-testid="valid-until"
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="language_id" className="form-label">
            Proposal Language
          </label>
          <select
            id="language_id"
            name="language_id"
            className="form-select"
            value={formData.language_id ?? 1}
            onChange={onInputChange}
            required
            data-testid="language-select"
          >
            {languages.map((l) => (
              <option key={l.language_id} value={l.language_id}>{l.name}</option>
            ))}
          </select>
          <small className="form-text text-muted">
            Affects text and translations only
          </small>
        </div>
        <div className="col-md-4">
          <label htmlFor="currency_code" className="form-label">
            Proposal Currency
          </label>
          <select
            id="currency_code"
            name="currency_code"
            className="form-select"
            value={formData.currency_code}
            onChange={onInputChange}
            required
            data-testid="currency-select"
          >
            <option value="CZK">CZK (Czech Koruna)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
          <small className="form-text text-muted">
            All prices in this proposal will be in the selected currency
          </small>
        </div>
      </div>

      <AddCustomerModal
        show={showNewCustomerModal}
        onHide={() => setShowNewCustomerModal(false)}
        onCustomerCreated={onNewCustomer}
      />
    </div>
  );
};

export default ProposalHeader;
