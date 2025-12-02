<?php

namespace App\Controllers;

use App\Libraries\ProductImageLibrary;
use App\Utils\JsonResponse;

class ProductImageController
{
    private $productImageLibrary;

    public function __construct()
    {
        $this->productImageLibrary = new ProductImageLibrary();
    }

    public function getProductImages($productId)
    {
        try {
            error_log("Fetching images for product: $productId");
            $images = $this->productImageLibrary->getProductImages($productId);
            // Always return an array, even if empty
            if (!is_array($images)) {
                $images = [];
            }
            error_log("Returning images data: " . json_encode($images));
            JsonResponse::send($images, 200);
        } catch (\Exception $e) {
            // Log the error for debugging
            error_log("Error fetching product images: " . $e->getMessage());
            JsonResponse::send(['error' => 'Failed to fetch product images'], 500);
        }
    }

    public function uploadProductImage($productId)
    {
        $file = $_FILES['image'] ?? null;
        $description = $_POST['description'] ?? '';
        $isPrimary = isset($_POST['is_primary']) ? filter_var($_POST['is_primary'], FILTER_VALIDATE_BOOLEAN) : false;

        if (!$file) {
            JsonResponse::send(['error' => 'No file uploaded'], 400);
        }

        try {
            $data = [
                'product_id' => $productId,
                'file' => $file,
                'description' => $description,
                'is_primary' => $isPrimary
            ];

            $result = $this->productImageLibrary->addProductImage($data);
            JsonResponse::send($result, 201);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function updateProductImage($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->productImageLibrary->updateProductImage($id, $data);
        JsonResponse::send($result);
    }

    public function deleteProductImage($id)
    {
        $this->productImageLibrary->deleteProductImage($id);
        JsonResponse::send(['message' => 'Product image deleted successfully'], 204);
    }

    public function setPrimaryImage($productId, $imageId)
    {
        try {
            $result = $this->productImageLibrary->setPrimaryImage($productId, $imageId);
            JsonResponse::send($result);
        } catch (\Exception $e) {
            error_log("Error setting primary image: " . $e->getMessage());
            JsonResponse::send(['error' => 'Failed to set primary image', 'details' => $e->getMessage()], 500);
        }
    }

    public function unsetPrimaryImage($productId)
    {
        try {
            error_log("Unsetting primary image for product: $productId");
            $result = $this->productImageLibrary->unsetPrimaryImage($productId);
            error_log("Primary image unset result: " . json_encode($result));
            JsonResponse::send($result);
        } catch (\Exception $e) {
            error_log("Error unsetting primary image: " . $e->getMessage());
            JsonResponse::send(['error' => 'Failed to unset primary image', 'details' => $e->getMessage()], 500);
        }
    }
} 