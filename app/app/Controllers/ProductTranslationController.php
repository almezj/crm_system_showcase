<?php

namespace App\Controllers;

use App\Libraries\ProductTranslationLibrary;
use App\Utils\JsonResponse;

class ProductTranslationController
{
    private $productTranslationLibrary;

    public function __construct()
    {
        $this->productTranslationLibrary = new ProductTranslationLibrary();
    }

    public function getProductTranslations($productId)
    {
        $translations = $this->productTranslationLibrary->getProductTranslations($productId);
        JsonResponse::send($translations);
    }

    public function createTranslation()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['product_id']) || !isset($data['language_id']) || !isset($data['name'])) {
            JsonResponse::send(['error' => 'Product ID, language ID, and name are required'], 400);
        }

        $result = $this->productTranslationLibrary->addTranslation($data);
        JsonResponse::send($result, 201);
    }

    public function updateTranslation($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->productTranslationLibrary->updateTranslation($id, $data);
        JsonResponse::send($result);
    }

    public function deleteTranslation($id)
    {
        $this->productTranslationLibrary->deleteTranslation($id);
        JsonResponse::send(['message' => 'Translation deleted successfully'], 204);
    }
} 