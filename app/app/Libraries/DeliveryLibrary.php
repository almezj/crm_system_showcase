<?php

namespace App\Libraries;

use App\Models\DeliveryModel;

class DeliveryLibrary
{
    private $deliveryModel;

    public function __construct()
    {
        $this->deliveryModel = new DeliveryModel();
    }

    public function createDelivery($data)
    {
        $deliveryId = $this->deliveryModel->createDelivery($data);

        foreach ($data['items'] as $item) {
            $this->deliveryModel->addDeliveryItem($deliveryId, $item);
        }

        return ['delivery_id' => $deliveryId];
    }

    public function getDeliveryById($id)
    {
        $delivery = $this->deliveryModel->getDelivery($id);
        $delivery['items'] = $this->deliveryModel->getDeliveryItems($id);

        return $delivery;
    }

    public function updateDelivery($id, $data)
    {
        return $this->deliveryModel->updateDelivery($id, $data);
    }
}
