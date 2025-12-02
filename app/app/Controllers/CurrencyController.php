<?php

namespace App\Controllers;

use App\Utils\JsonResponse;
use App\Utils\CurrencyUtils;

class CurrencyController
{
    public function getExchangeRate()
    {
        $currency = $_GET['currency'] ?? null;
        if (!$currency) {
            JsonResponse::send(['error' => 'currency query param is required'], 400);
            return;
        }

        try {
            $utils = new CurrencyUtils();
            $rate = $utils->getExchangeRate($currency, 'CZK');
            if ($rate === null) {
                JsonResponse::send(['error' => "Exchange rate not available for {$currency} to CZK"], 404);
                return;
            }
            JsonResponse::send(['currency_code' => $currency, 'base' => 'CZK', 'exchange_rate' => $rate]);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }
}


