// Currency utility functions - (Placeholder for now, need to finalize requirements for the currency handling with the guys)
export const getCurrencySymbol = (currencyCode) => {
  const currencyMap = {
    'CZK': 'Kč',
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CHF': 'CHF',
    'PLN': 'zł',
    'HUF': 'Ft',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr'
  };
  
  return currencyMap[currencyCode] || currencyCode;
};

export const formatPrice = (price, currencyCode = 'CZK') => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${parseFloat(price).toFixed(2)} ${symbol}`;
};

export const formatPriceWithSymbol = (price, currencyCode = 'CZK') => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${parseFloat(price).toFixed(2)}`;
};

// Convert CZK price to display currency for frontend display
export const convertAndFormatPrice = (czkPrice, targetCurrency, exchangeRate) => {
  console.log('convertAndFormatPrice:', { czkPrice, targetCurrency, exchangeRate });
  
  if (targetCurrency === 'CZK' || !exchangeRate) {
    return formatPrice(czkPrice, 'CZK');
  }
  
  // Convert from CZK to target currency
  const convertedPrice = czkPrice / exchangeRate;
  console.log('Converted price:', convertedPrice);
  return formatPrice(convertedPrice, targetCurrency);
};
