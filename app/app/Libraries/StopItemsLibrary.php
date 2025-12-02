<?php

namespace App\Libraries;

use App\Models\StopItemsModel;

class StopItemsLibrary
{
    private $stopItemsModel;

    public function __construct()
    {
        $this->stopItemsModel = new StopItemsModel();
    }

    public function addStopItem($routeStopId, $data)
    {
        return $this->stopItemsModel->addStopItem($routeStopId, $data);
    }

    public function getStopItemsByStop($routeStopId)
    {
        return $this->stopItemsModel->getStopItemsByStop($routeStopId);
    }

    public function updateStopItem($id, $data)
    {
        return $this->stopItemsModel->updateStopItem($id, $data);
    }
}
