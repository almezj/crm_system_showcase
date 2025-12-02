<?php

namespace App\Controllers;

use App\Libraries\DeliveryLibrary;
use App\Utils\JsonResponse;

class DeliveryController
{
    private $deliveryLibrary;

    public function __construct()
    {
        $this->deliveryLibrary = new DeliveryLibrary();
    }

    public function createDelivery()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['vehicle_id']) || empty($data['items'])) {
            JsonResponse::send(['error' => 'Vehicle ID and items are required'], 400);
        }

        $result = $this->deliveryLibrary->createDelivery($data);
        JsonResponse::send($result, 201);
    }

    public function getDelivery($id)
    {
        $delivery = $this->deliveryLibrary->getDeliveryById($id);
        JsonResponse::send($delivery);
    }

    public function updateDelivery($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->deliveryLibrary->updateDelivery($id, $data);
        JsonResponse::send($result);
    }
}
