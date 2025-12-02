<?php

namespace App\Middlewares;

use App\Utils\CustomException;

class ZendeskAuthMiddleware
{
    private $zendeskToken;

    public function __construct()
    {
        // Load Zendesk webhook token from config.ini
        $config = parse_ini_file(__DIR__ . '/../../config.ini', true);
        $zendeskConfig = $config['zendesk'] ?? [];
        
        $this->zendeskToken = $zendeskConfig['webhook_token'] ?? getenv('ZENDESK_WEBHOOK_TOKEN') ?: 'zendesk_webhook_token_2025';
    }

    public function validateZendeskRequest($headers, $body = null)
    {
        // Normalize headers to lowercase for case-insensitive checking
        $normalizedHeaders = array_change_key_case($headers, CASE_LOWER);
        
        // Check for Zendesk webhook signature (most secure method)
        if (isset($normalizedHeaders['x-zendesk-webhook-signature']) && isset($normalizedHeaders['x-zendesk-webhook-signature-timestamp'])) {
            // Verify that Zendesk headers are present AND check for our custom API key
            if (isset($normalizedHeaders['x-zendesk-webhook-id']) && isset($normalizedHeaders['x-zendesk-account-id'])) {
                // Now check for our custom API key
                if (isset($normalizedHeaders['apikey'])) {
                    $apiKey = $normalizedHeaders['apikey'];
                    
                    if ($apiKey === $this->zendeskToken) {
                        return true;
                    } else {
                        throw new CustomException("Invalid API key", 401);
                    }
                } else {
                    throw new CustomException("API key required", 401);
                }
            }
        }
        
        // Fallback: Check for custom header (Zendesk-friendly name)
        if (isset($normalizedHeaders['x-webhook-token'])) {
            $token = $normalizedHeaders['x-webhook-token'];
            
            if ($token === $this->zendeskToken) {
                return true;
            }
        } 
        // Fallback: Check for Bearer token in Authorization header
        elseif (isset($normalizedHeaders['authorization'])) {
            $authHeader = $normalizedHeaders['authorization'];
            
            if (strpos($authHeader, 'bearer ') === 0) {
                $token = substr($authHeader, 7); // Remove 'Bearer ' prefix
            } else {
                $token = $authHeader; // Fallback for non-Bearer format
            }
            
            if ($token === $this->zendeskToken) {
                return true;
            }
        }
        
        throw new CustomException("Zendesk webhook authentication failed", 401);
    }
}
