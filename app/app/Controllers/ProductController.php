<?php

namespace App\Controllers;

use App\Libraries\ProductLibrary;
use App\Libraries\ProductTranslationLibrary;
use App\Utils\JsonResponse;

class ProductController
{
    private $productLibrary;
    private $productTranslationLibrary;

    public function __construct()
    {
        $this->productLibrary = new ProductLibrary();
        $this->productTranslationLibrary = new ProductTranslationLibrary();
    }

    public function getAllProducts()
    {
        // Check if this is a search request
        if (isset($_GET['search']) && !empty(trim($_GET['search']))) {
            $searchQuery = trim($_GET['search']);
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
            $limit = max(1, min(100, $limit)); // Limit between 1 and 100
            
            $products = $this->productLibrary->searchProducts($searchQuery, $limit);
            
            JsonResponse::send([
                'products' => $products,
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $limit,
                    'total' => count($products),
                    'total_pages' => 1
                ]
            ]);
            return;
        }
        
        $showDeleted = isset($_GET['showDeleted']) ? filter_var($_GET['showDeleted'], FILTER_VALIDATE_BOOLEAN) : false;
        
        // Get pagination parameters from query string
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        
        // Validate parameters
        $page = max(1, $page);
        $limit = max(1, min(100, $limit)); // Limit between 1 and 100
        
        $result = $this->productLibrary->getProducts($showDeleted, $page, $limit);
        
        // Ensure we always return the expected structure
        if (!isset($result['products']) || !is_array($result['products'])) {
            $result = [
                'products' => [],
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $limit,
                    'total' => 0,
                    'total_pages' => 0
                ]
            ];
        }
        
        JsonResponse::send($result);
        return;
    }

    public function getProduct($id)
    {
        $product = $this->productLibrary->getProduct($id);

        if (empty($product)) {
            JsonResponse::send(['error' => 'Product not found'], 404);
            return;
        }

        // Get translations for this product
        $translations = $this->productTranslationLibrary->getProductTranslations($id);
        $product['translations'] = $translations;

        // Get pieces for this product
        $productModel = new \App\Models\ProductModel();
        $pieces = $productModel->getProductPieces($id);
        $product['pieces'] = $pieces;

        JsonResponse::send($product);
        return;
    }

    public function createProduct()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Debug logging
        \App\Utils\Logger::debug("ProductController::createProduct - Received data: " . json_encode($data));

        if (!isset($data['name']) || !isset($data['base_price']) || !isset($data['manufacturer_id'])) {
            JsonResponse::send(['error' => 'Name, base price, and manufacturer ID are required'], 400);
            return;
        }

        // Extract translations from the data
        $translations = $data['translations'] ?? [];
        unset($data['translations']);

        // Create the base product
        $result = $this->productLibrary->addProduct($data);
        $productId = $result['product_id'];

        // Create translations if provided
        if (!empty($translations)) {
            foreach ($translations as $translation) {
                $translation['product_id'] = $productId;
                $this->productTranslationLibrary->addTranslation($translation);
            }
        }
        
        // Set ETag header
        header('ETag: ' . $productId);
        
        JsonResponse::send($result, 201);
        return;
    }

    public function updateProduct($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
            return;
        }

        // Extract translations from the data
        $translations = $data['translations'] ?? [];
        unset($data['translations']);

        // Update the base product
        $result = $this->productLibrary->updateProduct($id, $data);

        // Update translations if provided
        if (!empty($translations)) {
            foreach ($translations as $translation) {
                if (isset($translation['translation_id'])) {
                    // Update existing translation
                    $this->productTranslationLibrary->updateTranslation($translation['translation_id'], $translation);
                } else {
                    // Create new translation
                    $translation['product_id'] = $id;
                    $this->productTranslationLibrary->addTranslation($translation);
                }
            }
        }

        JsonResponse::send($result);
        return;
    }

    public function deleteProduct($id)
    {
        $this->productLibrary->deleteProduct($id);
        JsonResponse::send(['message' => 'Product deleted successfully'], 204);
        return;
    }

    public function getProductMetadata($id)
    {
        $productModel = new \App\Models\ProductModel();
        $metadata = $productModel->getProductMetadata($id);
        JsonResponse::send($metadata);
        return;
    }

    public function updateProductMetadata($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!is_array($data)) {
            JsonResponse::send(['error' => 'Invalid data format. Expected array of metadata items.'], 400);
            return;
        }

        $productModel = new \App\Models\ProductModel();
        
        // Clear existing metadata
        $productModel->clearProductMetadata($id);
        
        // Add new metadata
        $addedCount = 0;
        foreach ($data as $metadata) {
            if (isset($metadata['key_name'])) {
                $productModel->addProductMetadata($id, $metadata);
                $addedCount++;
            }
        }
        
        JsonResponse::send([
            'message' => "Product metadata updated successfully. Added $addedCount metadata items.",
            'added_count' => $addedCount
        ]);
        return;
    }
}
