<?php

namespace App\Libraries;

use App\Models\PersonModel;
use App\Utils\Logger;

class ZendeskLibrary
{
    private $personModel;
    private $zendeskSubdomain;
    private $zendeskApiToken;
    private $zendeskEmail;

    public function __construct()
    {
        $this->personModel = new PersonModel();
        
        // Load Zendesk API credentials from config.ini
        $config = parse_ini_file(__DIR__ . '/../../config.ini', true);
        $zendeskConfig = $config['zendesk'] ?? [];
        
        $this->zendeskSubdomain = $zendeskConfig['subdomain'] ?? '';
        $this->zendeskApiToken = $zendeskConfig['api_token'] ?? '';
        $this->zendeskEmail = $zendeskConfig['email'] ?? '';
        
        // Validate required configuration
        if (empty($this->zendeskSubdomain) || empty($this->zendeskApiToken) || empty($this->zendeskEmail)) {
            throw new \Exception("Zendesk API credentials not properly configured in config.ini");
        }
    }

    public function createCustomerFromZendesk($data)
    {
        // Validate required fields
        if (empty($data['customer_fname']) || empty($data['customer_lname'])) {
            throw new \Exception("First name and last name are required", 400);
        }

        // Check if customer already exists by email
        if (!empty($data['customer_email'])) {
            $existingCustomer = $this->personModel->getByEmail($data['customer_email']);
            if ($existingCustomer) {
                return [
                    'status' => 'customer_exists',
                    'message' => 'Customer already exists',
                    'person_id' => $existingCustomer['person_id'],
                    'customer' => $existingCustomer
                ];
            }
        }

        // Prepare customer data
        $customerData = [
            'first_name' => $data['customer_fname'],
            'last_name' => $data['customer_lname'],
            'email' => $data['customer_email'] ?? null,
            'phone' => $data['customer_phone'] ?? null,
            'person_type_id' => 2 // Customer type
        ];

        // Create the customer
        $result = $this->personModel->create($customerData);
        
        // Get the created customer details
        $customer = $this->personModel->get($result['person_id']);

        return [
            'status' => 'customer_created',
            'message' => 'Customer created successfully',
            'person_id' => $result['person_id'],
            'customer' => $customer
        ];
    }

    /**
     * Fetch user details from Zendesk API using user ID
     */
    public function getUserDetailsFromZendesk($userId)
    {
        try {
            $url = "https://{$this->zendeskSubdomain}.zendesk.com/api/v2/users/{$userId}.json";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Basic ' . base64_encode($this->zendeskEmail . '/token:' . $this->zendeskApiToken)
            ]);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                throw new \Exception("cURL Error: " . $error);
            }
            
            if ($httpCode !== 200) {
                throw new \Exception("Zendesk API Error: HTTP {$httpCode} - {$response}");
            }
            
            $data = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("JSON Decode Error: " . json_last_error_msg());
            }
            
            if (!isset($data['user'])) {
                throw new \Exception("Invalid API response: user data not found");
            }
            
            return $data['user'];
            
        } catch (\Exception $e) {
            // Log error to separate log file
            $this->logZendeskApiError("getUserDetailsFromZendesk", $userId, $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle user creation from Zendesk webhook
     * This method processes the user.created webhook and creates the user in our database
     */
    public function handleUserCreatedWebhook($webhookData)
    {
        try {
            // Extract user ID from webhook payload
            if (!isset($webhookData['detail']['id'])) {
                throw new \Exception("User ID not found in webhook payload");
            }
            
            $userId = $webhookData['detail']['id'];
            
            // Fetch full user details from Zendesk API
            $userDetails = $this->getUserDetailsFromZendesk($userId);
            
            // Check if user already exists by email
            if (!empty($userDetails['email'])) {
                $existingCustomer = $this->personModel->getByEmail($userDetails['email']);
                if ($existingCustomer) {
                    return [
                        'status' => 'customer_exists',
                        'message' => 'Customer already exists',
                        'person_id' => $existingCustomer['person_id'],
                        'customer' => $existingCustomer,
                        'zendesk_user_id' => $userId
                    ];
                }
            }
            
            // Parse name from Zendesk user details
            $parsedName = $this->parseUserName($userDetails['name'] ?? '');
            
            // Prepare customer data from Zendesk user details
            $customerData = [
                'first_name' => $parsedName['first_name'],
                'last_name' => $parsedName['last_name'],
                'email' => $userDetails['email'] ?? null,
                'phone' => $userDetails['phone'] ?? null,
                'person_type_id' => 2 // Customer type
            ];
            
            // Validate required fields
            if (empty($customerData['first_name'])) {
                throw new \Exception("User name is required but not provided");
            }
            
            // Create the customer
            $result = $this->personModel->create($customerData);
            
            // Get the created customer details
            $customer = $this->personModel->get($result['person_id']);
            
            return [
                'status' => 'customer_created',
                'message' => 'Customer created successfully from Zendesk user',
                'person_id' => $result['person_id'],
                'customer' => $customer,
                'zendesk_user_id' => $userId
            ];
            
        } catch (\Exception $e) {
            // Log error to separate log file
            $this->logZendeskApiError("handleUserCreatedWebhook", $webhookData, $e->getMessage());
            throw $e;
        }
    }

    /**
     * Parse user name from Zendesk API response
     * Zendesk returns a single "name" field containing both first and last name
     */
    private function parseUserName($fullName)
    {
        $fullName = trim($fullName);
        
        // If name is empty, return empty values
        if (empty($fullName)) {
            return [
                'first_name' => '',
                'last_name' => ''
            ];
        }
        
        // Split name by spaces, limit to 2 parts (first name and last name)
        $nameParts = explode(' ', $fullName, 2);
        
        $firstName = trim($nameParts[0]);
        $lastName = isset($nameParts[1]) ? trim($nameParts[1]) : '';
        
        return [
            'first_name' => $firstName,
            'last_name' => $lastName
        ];
    }

    /**
     * Log Zendesk API errors to a separate log file
     */
    private function logZendeskApiError($method, $data, $errorMessage)
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'method' => $method,
            'data' => $data,
            'error' => $errorMessage
        ];
        
        $logFile = __DIR__ . '/../../logs/zendesk_api_errors.log';
        $logLine = json_encode($logEntry) . "\n";
        
        file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
}
