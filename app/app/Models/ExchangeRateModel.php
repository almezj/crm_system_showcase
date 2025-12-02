<?php

namespace App\Models;

use Config\Database;

class ExchangeRateModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Get exchange rate between two currencies
     * @param string $fromCurrency
     * @param string $toCurrency
     * @return array|null
     */
    public function getExchangeRate($fromCurrency, $toCurrency)
    {
        $stmt = $this->db->prepare("
            SELECT rate, updated_at
            FROM exchange_rates 
            WHERE from_currency_code = :from_currency AND to_currency_code = :to_currency
        ");
        $stmt->execute([
            ':from_currency' => $fromCurrency,
            ':to_currency' => $toCurrency
        ]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Get all exchange rates
     * @return array
     */
    public function getAllExchangeRates()
    {
        $stmt = $this->db->prepare("
            SELECT from_currency_code, to_currency_code, rate, updated_at
            FROM exchange_rates 
            ORDER BY from_currency_code, to_currency_code
        ");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Convert amount from one currency to another
     * @param float $amount
     * @param string $fromCurrency
     * @param string $toCurrency
     * @return float
     * @throws \Exception
     */
    public function convertCurrency($amount, $fromCurrency, $toCurrency)
    {
        error_log("ExchangeRateModel::convertCurrency - Converting {$amount} from {$fromCurrency} to {$toCurrency}");
        
        // If same currency, return original amount
        if ($fromCurrency === $toCurrency) {
            error_log("ExchangeRateModel::convertCurrency - Same currency, returning original amount");
            return $amount;
        }

        $exchangeRate = $this->getExchangeRate($fromCurrency, $toCurrency);
        error_log("ExchangeRateModel::convertCurrency - Exchange rate found: " . ($exchangeRate ? 'YES' : 'NO'));
        if ($exchangeRate) {
            error_log("ExchangeRateModel::convertCurrency - Rate: " . $exchangeRate['rate']);
        }
        
        if (!$exchangeRate) {
            error_log("ExchangeRateModel::convertCurrency - No exchange rate found for {$fromCurrency} to {$toCurrency}");
            throw new \Exception("Exchange rate not available for {$fromCurrency} to {$toCurrency}");
        }

        $convertedAmount = $amount * $exchangeRate['rate'];
        error_log("ExchangeRateModel::convertCurrency - Converted amount: {$convertedAmount}");
        return $convertedAmount;
    }

    /**
     * Update exchange rate
     * @param string $fromCurrency
     * @param string $toCurrency
     * @param float $rate
     * @param string $effectiveDate
     * @return bool
     */
    public function updateExchangeRate($fromCurrency, $toCurrency, $rate, $effectiveDate = null)
    {
        $stmt = $this->db->prepare("
            INSERT INTO exchange_rates (from_currency_code, to_currency_code, rate, updated_at)
            VALUES (:from_currency, :to_currency, :rate, NOW())
            ON DUPLICATE KEY UPDATE 
                rate = VALUES(rate),
                updated_at = NOW()
        ");
        return $stmt->execute([
            ':from_currency' => $fromCurrency,
            ':to_currency' => $toCurrency,
            ':rate' => $rate
        ]);
    }

    /**
     * Get exchange rate for a specific date
     * @param string $fromCurrency
     * @param string $toCurrency
     * @param string $date
     * @return array|null
     */
    public function getExchangeRateForDate($fromCurrency, $toCurrency, $date)
    {
        error_log("ExchangeRateModel::getExchangeRateForDate - Querying rate from {$fromCurrency} to {$toCurrency} for date {$date}");
        
        // Since there's no effective_date column, just get the most recent rate
        $stmt = $this->db->prepare("
            SELECT rate, updated_at
            FROM exchange_rates 
            WHERE from_currency_code = :from_currency 
            AND to_currency_code = :to_currency
            ORDER BY updated_at DESC
            LIMIT 1
        ");
        $stmt->execute([
            ':from_currency' => $fromCurrency,
            ':to_currency' => $toCurrency
        ]);
        
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        error_log("ExchangeRateModel::getExchangeRateForDate - Query result: " . json_encode($result));
        
        return $result;
    }

    /**
     * Get current exchange rate (most recent)
     * @param string $fromCurrency
     * @param string $toCurrency
     * @return array|null
     */
    public function getCurrentExchangeRate($fromCurrency, $toCurrency)
    {
        return $this->getExchangeRateForDate($fromCurrency, $toCurrency, date('Y-m-d'));
    }
}
