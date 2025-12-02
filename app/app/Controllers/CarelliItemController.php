<?php

namespace App\Controllers;

use App\Libraries\CarelliItemLibrary;
use App\Utils\JsonResponse;

class CarelliItemController
{
    private $carelliItemLibrary;

    public function __construct()
    {
        $this->carelliItemLibrary = new CarelliItemLibrary();
    }

    public function searchItems()
    {
        $query = $_GET['q'] ?? '';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

        if (empty($query)) {
            JsonResponse::send(['items' => []], 200);
            return;
        }

        try {
            $items = $this->carelliItemLibrary->searchItems($query, $limit);
            JsonResponse::send(['items' => $items], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to search items: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getItem($itemId)
    {
        if (!$itemId || !is_numeric($itemId)) {
            JsonResponse::send(['error' => 'Invalid item ID'], 400);
            return;
        }

        try {
            $item = $this->carelliItemLibrary->getItem($itemId);
            
            if (!$item) {
                JsonResponse::send(['error' => 'Item not found'], 404);
                return;
            }

            JsonResponse::send(['item' => $item], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to get item: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getCategories()
    {
        try {
            $categories = $this->carelliItemLibrary->getCategories();
            JsonResponse::send(['categories' => $categories], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to get categories: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getSubcategories($categoryId)
    {
        if (!$categoryId || !is_numeric($categoryId)) {
            JsonResponse::send(['error' => 'Invalid category ID'], 400);
            return;
        }

        try {
            $subcategories = $this->carelliItemLibrary->getSubcategories($categoryId);
            JsonResponse::send(['subcategories' => $subcategories], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to get subcategories: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getItemsByCategory($categoryId)
    {
        if (!$categoryId || !is_numeric($categoryId)) {
            JsonResponse::send(['error' => 'Invalid category ID'], 400);
            return;
        }

        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

        try {
            $items = $this->carelliItemLibrary->getItemsByCategory($categoryId, $limit);
            JsonResponse::send(['items' => $items], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to get items by category: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function validateItem($itemId)
    {
        if (!$itemId || !is_numeric($itemId)) {
            JsonResponse::send(['error' => 'Invalid item ID'], 400);
            return;
        }

        try {
            $exists = $this->carelliItemLibrary->validateItemExists($itemId);
            JsonResponse::send(['valid' => $exists], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to validate item: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getItemForProduct($itemId)
    {
        if (!$itemId || !is_numeric($itemId)) {
            JsonResponse::send(['error' => 'Invalid item ID'], 400);
            return;
        }

        try {
            $itemData = $this->carelliItemLibrary->getItemForProduct($itemId);
            
            if (!$itemData) {
                JsonResponse::send(['error' => 'Item not found or not available for product creation'], 404);
                return;
            }

            JsonResponse::send(['item_data' => $itemData], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to get item data: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getItemForTranslation($itemId)
    {
        if (!$itemId || !is_numeric($itemId)) {
            JsonResponse::send(['error' => 'Invalid item ID'], 400);
            return;
        }

        try {
            $itemData = $this->carelliItemLibrary->getItemForTranslation($itemId);
            
            if (!$itemData) {
                JsonResponse::send(['error' => 'Item not found or not available for translation'], 404);
                return;
            }

            JsonResponse::send(['item_data' => $itemData], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Failed to get item data: ' . $e->getMessage()], 500);
            return;
        }
    }
} 
