<?php
namespace App\Controllers;

use App\Libraries\AddressLibrary;
use App\Utils\JsonResponse;

class AddressController {
    private $addressLibrary;

    public function __construct() {
        $this->addressLibrary = new AddressLibrary();
    }

    public function getAllAddresses() {
        $addresses = $this->addressLibrary->getAddresses();
        JsonResponse::send($addresses);
    }

    public function createAddress() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['street']) || !isset($data['city']) || !isset($data['country'])) {
            JsonResponse::send(['error' => 'Street, city, and country are required'], 400);
        }

        $result = $this->addressLibrary->addAddress($data);
        JsonResponse::send($result, 201);
    }

    public function updateAddress($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->addressLibrary->updateAddress($id, $data);
        JsonResponse::send($result);
    }

    public function deleteAddress($id) {
        $this->addressLibrary->deleteAddress($id);
        JsonResponse::send(['message' => 'Address deleted successfully'], 204);
    }
}
?>
