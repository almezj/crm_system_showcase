<?php

namespace App\Controllers;

use App\Libraries\OrderLibrary;
use App\Utils\JsonResponse;

class OrderController
{
    private $orderLibrary;

    public function __construct()
    {
        $this->orderLibrary = new OrderLibrary();
    }

    public function createOrder()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['customer_id']) || empty($data['items'])) {
            JsonResponse::send(['error' => 'Customer ID and items are required'], 400);
        }

        $result = $this->orderLibrary->createOrder($data);
        JsonResponse::send($result, 201);
    }

    public function convertProposalToOrder($proposalId)
    {
        $result = $this->orderLibrary->convertProposalToOrder($proposalId);
        JsonResponse::send($result, 201);
    }

    public function getOrder($id)
    {
        $order = $this->orderLibrary->getOrderById($id);
        JsonResponse::send($order);
    }

    public function getAllOrders()
    {
        $orders = $this->orderLibrary->getOrders();
        JsonResponse::send($orders);
    }

    public function updateOrder($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->orderLibrary->updateOrder($id, $data);
        JsonResponse::send($result);
    }

    public function deleteOrder($id)
    {
        $this->orderLibrary->deleteOrder($id);
        JsonResponse::send(['message' => 'Order deleted successfully'], 204);
    }
}
