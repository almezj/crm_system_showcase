import React from 'react';
import ProposalItem from '../../pages/proposals/ProposalItem';

const ProposalItemsList = ({ 
  items, 
  products, 
  languages, 
  proposalCurrency, 
  onItemChange, 
  onItemBlur,
  onDeleteItem, 
  onDrop, 
  onRemoveImage, 
  onReorderImages,
  onUpdateImageDescription,
  proposalId,
  validationErrors = {}
}) => {
  return (
    <div className="mb-4" data-testid="proposal-items-list">
      <h5>Items</h5>
      {items.map((item, index) => (
        <ProposalItem
          key={index}
          index={index}
          item={item}
          products={products}
          languages={languages}
          proposalCurrency={proposalCurrency}
          handleItemChange={onItemChange}
          handleItemBlur={onItemBlur}
          handleDeleteItem={onDeleteItem}
          handleDrop={onDrop}
          handleRemoveImage={onRemoveImage}
          handleReorderImages={onReorderImages}
          handleUpdateImageDescription={onUpdateImageDescription}
          proposalId={proposalId}
          validationError={validationErrors[index]}
        />
      ))}
    </div>
  );
};

export default ProposalItemsList;
