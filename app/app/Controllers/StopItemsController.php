<?php

namespace App\Controllers;

use App\Libraries\StopItemsLibrary;
use App\Utils\JsonResponse;

class StopItemsController
{
    private $stopItemsLibrary;

    public function __construct()
    {
        $this->stopItemsLibrary = new StopItemsLibrary();
    }

    public function addStopItem($routeStopId)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['piece_id']) || !isset($data['action'])) {
            JsonResponse::send(['error' => 'Piece ID and action type are required'], 400);
        }

        $result = $this->stopItemsLibrary->addStopItem($routeStopId, $data);
        JsonResponse::send($result, 201);
    }

    public function getStopItems($routeStopId)
    {
        $items = $this->stopItemsLibrary->getStopItemsByStop($routeStopId);
        JsonResponse::send($items);
    }

    public function updateStopItem($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->stopItemsLibrary->updateStopItem($id, $data);
        JsonResponse::send($result);
    }
}
