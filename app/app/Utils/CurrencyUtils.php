<?php

namespace App\Utils;

use App\Models\ExchangeRateModel;

class CurrencyUtils
{
    private $exchangeRateModel;

    public function __construct()
    {
        $this->exchangeRateModel = new ExchangeRateModel();
    }

    /**
     * Convert price from input currency to CZK for storage
     * @param float $price
     * @param string $fromCurrency
     * @param float $exchangeRate
     * @return float
     */
    public function convertToCZK($price, $fromCurrency, $exchangeRate)
    {
        if ($fromCurrency === 'CZK') {
            return $price;
        }
        
        return $price * $exchangeRate;
    }

    /**
     * Convert price from CZK to display currency
     * @param float $czkPrice
     * @param string $toCurrency
     * @param float $exchangeRate
     * @return float
     */
    public function convertFromCZK($czkPrice, $toCurrency, $exchangeRate)
    {
        if ($toCurrency === 'CZK') {
            return $czkPrice;
        }
        
        return $czkPrice / $exchangeRate;
    }

    /**
     * Get currency symbol
     * @param string $currencyCode
     * @return string
     */
    public function getCurrencySymbol($currencyCode)
    {
        $symbols = [
            'CZK' => 'Kč',
            'EUR' => '€',
            'USD' => '$',
            'GBP' => '£',
            'CHF' => 'CHF',
            'PLN' => 'zł',
            'HUF' => 'Ft',
            'SEK' => 'kr',
            'NOK' => 'kr',
            'DKK' => 'kr'
        ];
        
        return $symbols[$currencyCode] ?? $currencyCode;
    }

    /**
     * Format price with currency symbol
     * @param float $price
     * @param string $currencyCode
     * @param int $decimals
     * @return string
     */
    public function formatPrice($price, $currencyCode, $decimals = 2)
    {
        $symbol = $this->getCurrencySymbol($currencyCode);
        return number_format($price, $decimals) . ' ' . $symbol;
    }

    /**
     * Get exchange rate for currency conversion
     * @param string $fromCurrency
     * @param string $toCurrency
     * @param string $date
     * @return float|null
     */
    public function getExchangeRate($fromCurrency, $toCurrency, $date = null)
    {
        if ($fromCurrency === $toCurrency) {
            return 1.0;
        }

        if ($date === null) {
            $rate = $this->exchangeRateModel->getCurrentExchangeRate($fromCurrency, $toCurrency);
        } else {
            $rate = $this->exchangeRateModel->getExchangeRateForDate($fromCurrency, $toCurrency, $date);
        }

        if ($rate && isset($rate['rate'])) {
            error_log("CurrencyUtils::getExchangeRate - Returning rate: {$rate['rate']}");
            return $rate['rate'];
        } else {
            error_log("CurrencyUtils::getExchangeRate - No rate found, returning null");
            return null;
        }
    }

    /**
     * Validate currency code
     * @param string $currencyCode
     * @return bool
     */
    public function isValidCurrency($currencyCode)
    {
        $validCurrencies = ['CZK', 'EUR', 'USD', 'GBP', 'CHF', 'PLN', 'HUF', 'SEK', 'NOK', 'DKK'];
        return in_array($currencyCode, $validCurrencies);
    }

    /**
     * Get supported currencies
     * @return array
     */
    public function getSupportedCurrencies()
    {
        return [
            'CZK' => 'Czech Koruna',
            'EUR' => 'Euro',
            'USD' => 'US Dollar',
            'GBP' => 'British Pound',
            'CHF' => 'Swiss Franc',
            'PLN' => 'Polish Złoty',
            'HUF' => 'Hungarian Forint',
            'SEK' => 'Swedish Krona',
            'NOK' => 'Norwegian Krone',
            'DKK' => 'Danish Krone'
        ];
    }

    /**
     * Round price for display (remove decimals for whole numbers)
     * @param float $price
     * @return string
     */
    public function roundForDisplay($price)
    {
        if ($price == floor($price)) {
            return number_format($price, 0);
        }
        return number_format($price, 2);
    }
}
