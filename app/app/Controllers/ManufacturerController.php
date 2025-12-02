<?php

namespace App\Controllers;

use App\Libraries\ManufacturerLibrary;
use App\Utils\JsonResponse;

class ManufacturerController
{
    private $manufacturerLibrary;

    public function __construct()
    {
        $this->manufacturerLibrary = new ManufacturerLibrary();
    }

    public function getAllManufacturers()
    {
        $manufacturers = $this->manufacturerLibrary->getManufacturers();
        JsonResponse::send($manufacturers);
    }

    public function getManufacturer($id)
    {
        $manufacturer = $this->manufacturerLibrary->getManufacturer($id);

        if (empty($manufacturer)) {
            JsonResponse::send(['error' => 'Manufacturer not found'], 404);
        }

        JsonResponse::send($manufacturer);
    }

    public function createManufacturer()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['contact_person'])) {
            JsonResponse::send(['error' => 'Name and contact person are required'], 400);
        }

        $result = $this->manufacturerLibrary->addManufacturer($data);
        JsonResponse::send($result, 201);
    }

    public function updateManufacturer($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->manufacturerLibrary->updateManufacturer($id, $data);
        JsonResponse::send($result);
    }

    public function deleteManufacturer($id)
    {
        $this->manufacturerLibrary->deleteManufacturer($id);
        JsonResponse::send(['message' => 'Manufacturer deleted successfully'], 204);
    }
}
