<?php

namespace App\Libraries;

use App\Models\PickupModel;

class PickupLibrary
{
    private $pickupModel;

    public function __construct()
    {
        $this->pickupModel = new PickupModel();
    }

    public function createPickup($data)
    {
        $pickupId = $this->pickupModel->createPickup($data);

        foreach ($data['items'] as $item) {
            $this->pickupModel->addPickupItem($pickupId, $item);
        }

        return ['pickup_id' => $pickupId];
    }

    public function getPickupById($id)
    {
        $pickup = $this->pickupModel->getPickup($id);
        $pickup['items'] = $this->pickupModel->getPickupItems($id);

        return $pickup;
    }

    public function updatePickup($id, $data)
    {
        return $this->pickupModel->updatePickup($id, $data);
    }
}
