/**
 * Utility functions for persisting PDF generation options in localStorage.
 * Supports per-proposal, per-template storage to maintain separate settings
 * for different proposals and different PDF templates.
 */

/**
 * Get the localStorage key for a specific proposal and template
 * @param {string|number} proposalId - The proposal ID
 * @param {string} templateType - The PDF template type (e.g., 'product_summary', 'clean_proposal')
 * @returns {string} The localStorage key
 */
const getStorageKey = (proposalId, templateType) => {
  return `pdfOptions_${proposalId}_${templateType}`;
};

/**
 * Save PDF options to localStorage for a specific proposal and template
 * @param {string|number} proposalId - The proposal ID
 * @param {string} templateType - The PDF template type
 * @param {object} options - The PDF options to save
 */
export const savePdfOptions = (proposalId, templateType, options) => {
  try {
    const key = getStorageKey(proposalId, templateType);
    const serializedOptions = JSON.stringify(options);
    localStorage.setItem(key, serializedOptions);
    console.log(`Saved PDF options for proposal ${proposalId}, template ${templateType}:`, options);
  } catch (error) {
    console.error('Failed to save PDF options to localStorage:', error);
  }
};

/**
 * Load PDF options from localStorage for a specific proposal and template
 * @param {string|number} proposalId - The proposal ID
 * @param {string} templateType - The PDF template type
 * @param {object} defaultOptions - Default options to return if none are saved
 * @returns {object} The saved options or default options
 */
export const loadPdfOptions = (proposalId, templateType, defaultOptions = {}) => {
  try {
    const key = getStorageKey(proposalId, templateType);
    const saved = localStorage.getItem(key);
    
    if (saved) {
      const parsedOptions = JSON.parse(saved);
      console.log(`Loaded PDF options for proposal ${proposalId}, template ${templateType}:`, parsedOptions);
      return parsedOptions;
    }
    
    console.log(`No saved PDF options found for proposal ${proposalId}, template ${templateType}, using defaults`);
    return defaultOptions;
  } catch (error) {
    console.error('Failed to load PDF options from localStorage:', error);
    return defaultOptions;
  }
};

/**
 * Clear PDF options from localStorage for a specific proposal and template
 * @param {string|number} proposalId - The proposal ID
 * @param {string} templateType - The PDF template type
 */
export const clearPdfOptions = (proposalId, templateType) => {
  try {
    const key = getStorageKey(proposalId, templateType);
    localStorage.removeItem(key);
    console.log(`Cleared PDF options for proposal ${proposalId}, template ${templateType}`);
  } catch (error) {
    console.error('Failed to clear PDF options from localStorage:', error);
  }
};

/**
 * Clear all PDF options for a specific proposal (all templates)
 * @param {string|number} proposalId - The proposal ID
 */
export const clearAllPdfOptionsForProposal = (proposalId) => {
  try {
    const keysToRemove = [];
    
    // Find all keys that start with our prefix for this proposal
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`pdfOptions_${proposalId}_`)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared all PDF options for proposal ${proposalId}`);
  } catch (error) {
    console.error('Failed to clear all PDF options for proposal:', error);
  }
};

/**
 * Get all saved PDF options for a specific proposal
 * @param {string|number} proposalId - The proposal ID
 * @returns {object} Object with template types as keys and options as values
 */
export const getAllPdfOptionsForProposal = (proposalId) => {
  try {
    const allOptions = {};
    
    // Find all keys that start with our prefix for this proposal
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`pdfOptions_${proposalId}_`)) {
        const templateType = key.replace(`pdfOptions_${proposalId}_`, '');
        const saved = localStorage.getItem(key);
        if (saved) {
          allOptions[templateType] = JSON.parse(saved);
        }
      }
    }
    
    console.log(`All PDF options for proposal ${proposalId}:`, allOptions);
    return allOptions;
  } catch (error) {
    console.error('Failed to get all PDF options for proposal:', error);
    return {};
  }
};
