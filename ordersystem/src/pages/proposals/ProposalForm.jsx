import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProposalHeader from "../../components/proposals/ProposalHeader";
import ProposalItemsList from "../../components/proposals/ProposalItemsList";
import ProposalActions from "../../components/proposals/ProposalActions";
import { fetchPersonsRequest } from "../../redux/persons/actions";
import { fetchProductsRequest } from '../../redux/products/actions';
import { uploadTempImageRequest } from "../../redux/proposals/actions";
import { v4 as uuidv4 } from "uuid";
import store from "../../redux/store";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/environment";
import { deepClone } from "../../utils/deepClone";
import axios from "../../services/axiosInstance";

const ProposalForm = ({ initialData = {}, onSubmit, loading, isEdit = false, onCancel }) => {
  const dispatch = useDispatch();
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [shouldSelectNewCustomer, setShouldSelectNewCustomer] = useState(false);


  const [formData, setFormData] = useState(() => ({
    prospect_id: initialData.prospect_id || "",
    valid_until: initialData.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status_id: initialData.status_id || 1,
    vat: initialData.vat || 21,
    total_price: initialData.total_price || 0.0,
    currency_code: initialData.currency_code || 'CZK',
    language_id: initialData.language_id || 1,
    items: initialData.items ? deepClone(initialData.items) : [],
  }));

  const [validationErrors, setValidationErrors] = useState({});

  const [languages, setLanguages] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Display exchange rate for current selected currency (vs CZK)
  const [currentRate, setCurrentRate] = useState(1);


  useEffect(() => {
    dispatch(fetchPersonsRequest());
    dispatch(fetchProductsRequest());
    
    // Fetch languages for currency selection
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('/languages');
        setLanguages(response.data || []);
        // Set VAT from selected language if missing or default
        const selectedLangId = (initialData.language_id || 1);
        const lang = (response.data || []).find(l => String(l.language_id) === String(selectedLangId));
        if (lang && typeof lang.vat_rate !== 'undefined') {
          setFormData(prev => ({ ...prev, vat: Math.round(parseFloat(lang.vat_rate) * 100) }));
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        setLanguages([]);
      }
    };
    fetchLanguages();
  }, [dispatch]);

  // Initialize currentRate for initial currency selection
  useEffect(() => {
    const init = async () => {
      try {
        // Prefer proposal snapshot rate in edit mode to avoid mismatches
        if (isEdit && typeof initialData.exchange_rate_used !== 'undefined') {
          setCurrentRate(initialData.exchange_rate_used || 1);
          return;
        }
        const cur = (initialData.currency_code || 'CZK');
        if (cur === 'CZK') { setCurrentRate(1); return; }
        const res = await axios.get(`/exchange-rate`, { params: { currency: cur } });
        setCurrentRate(res.data?.exchange_rate || 1);
      } catch (e) {
        setCurrentRate(1);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-time conversion of CZK-stored item prices to proposal currency on edit load
  const [initializedDisplayPrices, setInitializedDisplayPrices] = useState(false);
  useEffect(() => {
    if (!isEdit || initializedDisplayPrices) return;
    const proposalCurrency = initialData.currency_code || 'CZK';
    const rate = (typeof initialData.exchange_rate_used !== 'undefined') ? (initialData.exchange_rate_used || 1) : currentRate;
    if (proposalCurrency === 'CZK' || !rate || rate <= 0) {
      setInitializedDisplayPrices(true);
      return;
    }
    // Convert from CZK (stored) to display currency using snapshot rate
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        const czkList = parseFloat(item.list_price) || 0;
        const discount = parseFloat(item.discount) || 0;
        
        // If price is 0, keep it as 0 regardless of currency conversion
        if (czkList === 0 || isNaN(czkList)) {
          return {
            ...item,
            list_price: 0,
            final_price: 0,
            price_currency_id: proposalCurrency === 'EUR' ? 2 : 1
          };
        }
        
        const newList = czkList / rate;
        const newFinal = newList * (1 - discount / 100);
        return {
          ...item,
          list_price: parseFloat(newList.toFixed(2)),
          final_price: parseFloat(newFinal.toFixed(2)),
          price_currency_id: proposalCurrency === 'EUR' ? 2 : 1
        };
      })
    }));
    setInitializedDisplayPrices(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, initialData.proposal_id, initialData.currency_code, initialData.exchange_rate_used]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        product_id: item.product_id || products[0]?.product_id,
        pieces: item.pieces || [],
        item_metadata: item.item_metadata || [],
      })),
    }));
  }, [products]);

  const { persons } = useSelector((state) => state.persons);
  const { products: fetchedProducts } = useSelector(state => state.products);
  useEffect(() => {
    if (persons) {
      const customerList = persons.filter(
        (person) => person.person_type?.toLowerCase() === "customer"
      );
      setCustomers(customerList);

      if (shouldSelectNewCustomer && customerList.length > 0) {
        setFormData(prev => ({
          ...prev,
          prospect_id: customerList[customerList.length - 1].person_id
        }));
        setShouldSelectNewCustomer(false);
      }
    }
    if (fetchedProducts) {
      setProducts(fetchedProducts.filter((product) => product.is_active));
    }
  }, [persons, fetchedProducts, shouldSelectNewCustomer]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'currency_code') {
      try {
        const oldCurrency = formData.currency_code;
        const oldRate = oldCurrency === 'CZK' ? 1 : currentRate;

        let newRate = 1;
        if (isEdit && initialData?.proposal_id) {
          // Persist change and get snapshot rate from backend
          const resp = await axios.put(`/proposals/${initialData.proposal_id}/currency`, { currency_code: value });
          newRate = resp.data?.exchange_rate_used ?? 1;
        } else {
          // New proposal: get current market rate
          const resp = await axios.get(`/exchange-rate`, { params: { currency: value } });
          newRate = resp.data?.exchange_rate ?? 1;
        }

        setCurrentRate(newRate);

        // Convert existing item prices via CZK to avoid compounding
      setFormData((prev) => ({
        ...prev,
        [name]: value,
          items: prev.items.map(item => {
            const list = parseFloat(item.list_price) || 0;
            const discount = parseFloat(item.discount) || 0;
            
            // If price is 0, keep it as 0 regardless of currency conversion
            if (list === 0 || isNaN(list)) {
              return {
                ...item,
                list_price: 0,
                final_price: 0,
                price_currency_id: value === 'EUR' ? 2 : 1
              };
            }
            
            // derive CZK base from old currency
            const czkList = oldCurrency === 'CZK' ? list : (list * oldRate);
            // convert to new currency for display
            const newList = value === 'CZK' ? czkList : (czkList / newRate);
            const newFinal = newList * (1 - discount / 100);
            return {
          ...item,
              list_price: parseFloat(newList.toFixed(2)),
              final_price: parseFloat(newFinal.toFixed(2)),
              price_currency_id: value === 'EUR' ? 2 : 1
            };
          })
        }));
      } catch (err) {
        console.error('Currency change failed:', err);
        // No change to currency if fetch/update fails
      }
    } else if (name === 'language_id') {
      // Update VAT percentage when language changes
      const lang = languages.find(l => String(l.language_id) === String(value));
      const vatPercent = lang && typeof lang.vat_rate !== 'undefined' ? Math.round(parseFloat(lang.vat_rate) * 100) : formData.vat;
      setFormData((prev) => ({ ...prev, [name]: value, vat: vatPercent }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = () => {
    // Get the language ID for the current proposal currency
    const currencyLanguageId = formData.currency_code === 'EUR' ? 2 : 1; // EUR = 2, CZK = 1
    
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: null,
          item_name: "",
          description: "",
          custom_description: "",
          quantity: 1,
          list_price: 0,
          discount: 0,
          final_price: 0,
          price_currency_id: currencyLanguageId, // Use proposal currency
          is_custom: false,
          metadata: {},
          item_metadata: [],
          images: [],
          pieces: [],
          tempKey: uuidv4(),
        },
      ],
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === 'list_price' || field === 'discount') {
      const item = updatedItems[index];
      const listPrice = parseFloat(item.list_price) || 0; // price in current selected currency
      const discount = parseFloat(item.discount) || 0;
      const finalPrice = listPrice * (1 - discount / 100); // compute in current currency for display
      updatedItems[index].final_price = parseFloat(finalPrice.toFixed(2));
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
    
    // Clear validation error for this item when it's changed
    if (validationErrors[index]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const handleItemBlur = (index, field, value) => {
    // Validate and correct numeric fields on blur
    if (field === 'quantity') {
      const numericValue = parseFloat(value);
      
      // If value is null, undefined, NaN, negative, or 0, set to 1
      if (isNaN(numericValue) || numericValue <= 0) {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = 1;
        setFormData((prev) => ({ ...prev, items: updatedItems }));
      }
    } else if (field === 'list_price' || field === 'discount') {
      const numericValue = parseFloat(value);
      
      // If value is null, undefined, NaN, or negative, set to 0
      if (isNaN(numericValue) || numericValue < 0) {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = 0;
        
        // Recalculate final_price if price or discount changed
        const item = updatedItems[index];
        const listPrice = parseFloat(item.list_price) || 0;
        const discount = parseFloat(item.discount) || 0;
        const finalPrice = listPrice * (1 - discount / 100);
        updatedItems[index].final_price = parseFloat(finalPrice.toFixed(2));
        
        setFormData((prev) => ({ ...prev, items: updatedItems }));
      }
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if there are no items at all
    if (formData.items.length === 0) {
      toast.error('Please add at least one item to your proposal before submitting.');
      return;
    }
    
    // Check for empty items (items that exist but are not filled)
    const emptyItems = formData.items.filter(item => 
      !item.product_id && (!item.item_name || item.item_name.trim() === '')
    );
    
    if (emptyItems.length > 0) {
      // Set validation errors for empty items
      const errors = {};
      formData.items.forEach((item, index) => {
        if (!item.product_id && (!item.item_name || item.item_name.trim() === '')) {
          errors[index] = 'This item must have either a product selected or a custom name.';
        }
      });
      setValidationErrors(errors);
      
      toast.error(`Please complete or remove ${emptyItems.length} empty item(s). Each item must have either a product selected or a custom name.`);
      return;
    }
    
    // Clear validation errors if all items are valid
    setValidationErrors({});
    
    // Validate that valid_until date is today or in the future
    const today = new Date().toISOString().split('T')[0];
    if (formData.valid_until < today) {
      toast.error('Valid Until date must be today or in the future.');
      return;
    }
    
    // Clean form data - deep clone already done at initialization
    // Filter out empty NEW items (items without proposal_item_id that also lack product_id and item_name)
    // Always keep existing items (with proposal_item_id) - let backend handle their validation
    const validItems = formData.items.filter(item => {
      // Keep existing items
      if (item.proposal_item_id) {
        return true;
      }
      // For new items, only keep if they have product_id OR non-empty item_name
      return item.product_id || (item.item_name && item.item_name.trim() !== '');
    });
    
    // Ensure we still have at least one valid item after filtering
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item to your proposal before submitting.');
      return;
    }
    
    const cleanedItems = validItems.map(item => {
      const cleanedItem = { ...item };
      
      // For edit mode, we need to keep temp images so backend can process them
      // Only filter out temp images if we're in create mode (no proposal_item_id)
      if (cleanedItem.images && !item.proposal_item_id) {
        // Create mode: remove temp images from Redux state
        cleanedItem.images = cleanedItem.images.filter(img => !img.temp_key);
      }
      // Edit mode: keep temp images so backend can process them via linkTempImagesToProposalItem
      
      return {
        ...cleanedItem,
        temp_key: item.tempKey || undefined, // Only include temp_key if it exists
        image_order: item.proposal_item_id && item.images && item.images.length > 0 
          ? item.images.filter(img => img.image_id).map(img => img.image_id)
          : undefined
      };
    });
    
    const payload = {
      ...formData,
      items: cleanedItems
    };
    
    // Debug logging for temp images
    console.log('ProposalForm handleSubmit - Original formData items:', formData.items.map(item => ({
      proposal_item_id: item.proposal_item_id,
      temp_key: item.tempKey,
      has_temp_images: item.images ? item.images.some(img => img.temp_key) : false,
      temp_image_count: item.images ? item.images.filter(img => img.temp_key).length : 0,
      total_images: item.images ? item.images.length : 0,
      has_existing_images: item.images ? item.images.some(img => img.image_id && !img.temp_key) : false
    })));
    
    console.log('ProposalForm handleSubmit - Cleaned payload items:', cleanedItems.map(item => ({
      proposal_item_id: item.proposal_item_id,
      temp_key: item.temp_key,
      has_temp_images: item.images ? item.images.some(img => img.temp_key) : false,
      temp_image_count: item.images ? item.images.filter(img => img.temp_key).length : 0,
      total_images: item.images ? item.images.length : 0,
      has_existing_images: item.images ? item.images.some(img => img.image_id && !img.temp_key) : false
    })));
    
    onSubmit(payload);
  };

  const handleNewCustomer = async (customerData) => {
    if (customerData && customerData.person_id) {
      try {
        setFormData(prev => ({
          ...prev,
          prospect_id: customerData.person_id
        }));
      } catch (error) {
        console.error('Error handling new customer:', error);
      }
    }
  };

  const handleCustomerSelect = (customer) => {
    if (customer && customer.person_id) {
      setFormData(prev => ({
        ...prev,
        prospect_id: customer.person_id
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        prospect_id: ""
      }));
    }
  };

  const handleDrop = async (index, acceptedFiles) => {
    let itemTempKey = formData.items[index].tempKey;
    
    // Only generate tempKey if we don't have one and we're uploading new images
    if (!itemTempKey && acceptedFiles.length > 0) {
      itemTempKey = uuidv4();
      // Update the item with the new tempKey
      const updatedItems = [...formData.items];
      updatedItems[index].tempKey = itemTempKey;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    }

    // Upload each file and get the temp image data
    const uploadedImages = [];
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', '');
        formData.append('temp_key', itemTempKey);

        // Use axiosInstance for automatic token renewal and consistent error handling
        const response = await axios.post('proposals/temp-upload-item-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        uploadedImages.push({
          ...response.data.image,
          temp_key: itemTempKey, // Add temp_key to the image object
          preview: URL.createObjectURL(file) // Keep preview for display
        });
      } catch (error) {
        console.error('Error uploading temp image:', error);
        toast.error('Failed to upload image');
      }
    }

    // Update form state with uploaded images
    const updatedItems = [...formData.items];
    updatedItems[index].images.push(...uploadedImages);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    
    // Debug logging for uploaded images
    console.log('ProposalForm handleDrop - Uploaded images:', uploadedImages);
    console.log('ProposalForm handleDrop - Updated item images:', updatedItems[index].images);
    console.log('ProposalForm handleDrop - Item tempKey:', itemTempKey);
  };

  const handleRemoveImage = (index, imageIndex) => {
    const updatedItems = [...formData.items];
    updatedItems[index].images.splice(imageIndex, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleReorderImages = (itemIndex, fromIndex, toIndex) => {
    const updatedItems = [...formData.items];
    const images = [...updatedItems[itemIndex].images];
    
    // Remove the dragged item
    const [draggedImage] = images.splice(fromIndex, 1);
    
    // Insert it at the new position
    images.splice(toIndex, 0, draggedImage);
    
    updatedItems[itemIndex].images = images;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    
    // Note: Image order will be saved when the form is submitted
    // No need to call backend API for every drag-and-drop operation
  };

  const handleUpdateImageDescription = async (itemIndex, imageIndex, newDescription) => {
    const image = formData.items[itemIndex].images[imageIndex];
    
    console.log('ProposalForm handleUpdateImageDescription:', {
      itemIndex,
      imageIndex,
      newDescription,
      image: {
        image_id: image.image_id,
        temp_key: image.temp_key,
        current_description: image.description
      }
    });
    
    // Update the image description in the database
    if (image.image_id) {
      try {
        // Use direct API calls for all image description updates to avoid Redux state conflicts
        let endpoint;
        
        if (image.temp_key) {
          // This is a temp image (newly uploaded)
          endpoint = `${API_BASE_URL}proposals/items/temp-images/${image.image_id}/description`;
          console.log('Updating temp image description:', endpoint);
        } else {
          // This is an existing image
          endpoint = `${API_BASE_URL}proposals/items/images/${image.image_id}/description`;
          console.log('Updating existing image description:', endpoint);
        }
        
        // Use axiosInstance for automatic token renewal and consistent error handling
        await axios.patch(endpoint.replace(API_BASE_URL, ''), {
          description: newDescription
        });
        
        console.log('Image description updated successfully');
        
        // Update local form state for all images
        const updatedItems = [...formData.items];
        const images = [...updatedItems[itemIndex].images];
        images[imageIndex] = {
          ...image,
          description: newDescription
        };
        updatedItems[itemIndex].images = images;
        setFormData((prev) => ({ ...prev, items: updatedItems }));
      } catch (error) {
        console.error('Error updating image description:', error);
        toast.error('Failed to save image description');
      }
    }
  };



  return (
    <form onSubmit={handleSubmit}>
      <ProposalHeader
        formData={formData}
        customers={customers}
        languages={languages}
        isEdit={isEdit}
        onInputChange={handleInputChange}
        onNewCustomer={handleNewCustomer}
        showNewCustomerModal={showNewCustomerModal}
        setShowNewCustomerModal={setShowNewCustomerModal}
        onCustomerSelect={handleCustomerSelect}
      />

      <ProposalItemsList
        items={formData.items}
        products={products}
        languages={languages}
        proposalCurrency={formData.currency_code}
        onItemChange={handleItemChange}
        onItemBlur={handleItemBlur}
        onDeleteItem={handleDeleteItem}
        onDrop={handleDrop}
        onRemoveImage={handleRemoveImage}
        onReorderImages={handleReorderImages}
        onUpdateImageDescription={handleUpdateImageDescription}
        proposalId={initialData.proposal_id || null}
        validationErrors={validationErrors}
      />

      <ProposalActions
        onAddItem={handleAddItem}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        loading={loading}
        isEdit={isEdit}
      />
    </form>
  );
};

export default ProposalForm;
