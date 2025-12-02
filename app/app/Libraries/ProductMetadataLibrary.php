<?php
namespace App\Libraries;

use App\Models\ProductMetadataModel;

class ProductMetadataLibrary {
    private $productMetadataModel;

    public function __construct() {
        $this->productMetadataModel = new ProductMetadataModel();
    }

    public function getMetadataByProduct($productId) {
        return $this->productMetadataModel->getByProduct($productId);
    }

    public function addMetadata($data) {
        return $this->productMetadataModel->create($data);
    }

    public function updateMetadata($id, $data) {
        return $this->productMetadataModel->update($id, $data);
    }

    public function deleteMetadata($id) {
        return $this->productMetadataModel->delete($id);
    }
}
?>
