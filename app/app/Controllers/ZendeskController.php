<?php

namespace App\Controllers;

use App\Libraries\ZendeskLibrary;
use App\Middlewares\ZendeskAuthMiddleware;
use App\Utils\JsonResponse;
use App\Utils\Logger;

class ZendeskController
{
    private $zendeskLibrary;
    private $zendeskAuthMiddleware;

    public function __construct()
    {
        $this->zendeskLibrary = new ZendeskLibrary();
        $this->zendeskAuthMiddleware = new ZendeskAuthMiddleware();
    }

    public function createCustomer()
    {
        try {
            // Validate Zendesk authentication
            $headers = getallheaders();
            $this->zendeskAuthMiddleware->validateZendeskRequest($headers);

            // Get request data
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data)) {
                JsonResponse::send(['error' => 'No data provided'], 400);
                return;
            }

            // Create customer from Zendesk data
            $result = $this->zendeskLibrary->createCustomerFromZendesk($data);

            // Return appropriate response based on result
            if ($result['status'] === 'customer_created') {
                JsonResponse::send($result, 201);
                return;
            } else {
                JsonResponse::send($result, 200);
                return;
            }

        } catch (\Exception $e) {
            Logger::error("ZendeskController::createCustomer - Error: " . $e->getMessage());
            JsonResponse::send(['error' => $e->getMessage()], $e->getCode() ?: 500);
            return;
        }
    }

    /**
     * Handle user.created webhook from Zendesk
     * This endpoint is called when a user is manually created in Zendesk Support
     */
    public function handleUserCreated()
    {
        try {
            // Validate Zendesk authentication
            $headers = getallheaders();
            $this->zendeskAuthMiddleware->validateZendeskRequest($headers);

            // Get request data
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data)) {
                JsonResponse::send(['error' => 'No webhook data provided'], 400);
                return;
            }

            // Validate webhook payload structure
            if (!isset($data['type']) || $data['type'] !== 'zen:event-type:user.created') {
                JsonResponse::send(['error' => 'Invalid webhook type'], 400);
                return;
            }

            if (!isset($data['detail']['id'])) {
                JsonResponse::send(['error' => 'User ID not found in webhook payload'], 400);
                return;
            }

            // Handle user creation from webhook
            $result = $this->zendeskLibrary->handleUserCreatedWebhook($data);

            // Return appropriate response based on result
            if ($result['status'] === 'customer_created') {
                JsonResponse::send($result, 201);
                return;
            } else {
                JsonResponse::send($result, 200);
                return;
            }

        } catch (\Exception $e) {
            Logger::error("ZendeskController::handleUserCreated - Error: " . $e->getMessage());
            JsonResponse::send(['error' => $e->getMessage()], $e->getCode() ?: 500);
            return;
        }
    }
}
