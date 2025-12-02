<?php
namespace App\Libraries;

use App\Models\VehicleModel;

class VehicleLibrary {
    private $vehicleModel;

    public function __construct() {
        $this->vehicleModel = new VehicleModel();
    }

    public function getVehicles() {
        return $this->vehicleModel->getAll();
    }

    public function addVehicle($data) {
        return $this->vehicleModel->create($data);
    }

    public function updateVehicle($id, $data) {
        return $this->vehicleModel->update($id, $data);
    }

    public function deleteVehicle($id) {
        return $this->vehicleModel->delete($id);
    }
}
?>
