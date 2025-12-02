<?php
namespace App\Controllers;

use App\Libraries\ManufacturerLocationsLibrary;
use App\Utils\JsonResponse;

class ManufacturerLocationsController {
    private $manufacturerLocationsLibrary;

    public function __construct() {
        $this->manufacturerLocationsLibrary = new ManufacturerLocationsLibrary();
    }

    public function getAllLocations() {
        $locations = $this->manufacturerLocationsLibrary->getLocations();
        JsonResponse::send($locations);
    }

    public function createLocation() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['manufacturer_id']) || !isset($data['address_id']) || !isset($data['name'])) {
            JsonResponse::send(['error' => 'Manufacturer ID, address ID, and name are required'], 400);
        }

        $result = $this->manufacturerLocationsLibrary->addLocation($data);
        JsonResponse::send($result, 201);
    }

    public function updateLocation($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->manufacturerLocationsLibrary->updateLocation($id, $data);
        JsonResponse::send($result);
    }

    public function deleteLocation($id) {
        $this->manufacturerLocationsLibrary->deleteLocation($id);
        JsonResponse::send(['message' => 'Location deleted successfully'], 204);
    }
}
?>
