<?php
namespace App\Libraries;

use App\Models\AddressModel;

class AddressLibrary {
    private $addressModel;

    public function __construct() {
        $this->addressModel = new AddressModel();
    }

    public function getAddresses() {
        return $this->addressModel->getAll();
    }

    public function addAddress($data) {
        return $this->addressModel->create($data);
    }

    public function updateAddress($id, $data) {
        return $this->addressModel->update($id, $data);
    }

    public function deleteAddress($id) {
        return $this->addressModel->delete($id);
    }
}
?>
