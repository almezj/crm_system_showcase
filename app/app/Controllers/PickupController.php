<?php
namespace App\Controllers;

use App\Libraries\PickupLibrary;
use App\Utils\JsonResponse;

class PickupController {
    private $pickupLibrary;

    public function __construct() {
        $this->pickupLibrary = new PickupLibrary();
    }

    public function createPickup() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['vehicle_id']) || empty($data['items'])) {
            JsonResponse::send(['error' => 'Vehicle ID and items are required'], 400);
        }

        $result = $this->pickupLibrary->createPickup($data);
        JsonResponse::send($result, 201);
    }

    public function getPickup($id) {
        $pickup = $this->pickupLibrary->getPickupById($id);
        JsonResponse::send($pickup);
    }

    public function updatePickup($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->pickupLibrary->updatePickup($id, $data);
        JsonResponse::send($result);
    }
}
?>
