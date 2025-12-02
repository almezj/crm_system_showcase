<?php
namespace App\Controllers;

use App\Libraries\ProductMetadataLibrary;
use App\Utils\JsonResponse;

class ProductMetadataController {
    private $productMetadataLibrary;

    public function __construct() {
        $this->productMetadataLibrary = new ProductMetadataLibrary();
    }

    public function getAllMetadata($productId) {
        $productModel = new \App\Models\ProductModel();
        $metadata = $productModel->getProductMetadata($productId);
        JsonResponse::send($metadata);
        return;
    }

    public function createMetadata() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['product_id']) || !isset($data['key_name'])) {
            JsonResponse::send(['error' => 'Product ID and key name are required'], 400);
            return;
        }

        $productModel = new \App\Models\ProductModel();
        $result = $productModel->addProductMetadata($data['product_id'], $data);
        JsonResponse::send(['metadata_id' => $result], 201);
        return;
    }

    public function updateMetadata($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
            return;
        }

        $result = $this->productMetadataLibrary->updateMetadata($id, $data);
        JsonResponse::send($result);
        return;
    }

    public function deleteMetadata($id) {
        $this->productMetadataLibrary->deleteMetadata($id);
        JsonResponse::send(['message' => 'Metadata deleted successfully'], 204);
        return;
    }
}
?>
