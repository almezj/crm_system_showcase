<?php

namespace App\Libraries;

use App\Models\CarelliItemModel;

class CarelliItemLibrary
{
    private $carelliItemModel;

    public function __construct()
    {
        $this->carelliItemModel = new CarelliItemModel();
    }

    public function searchItems($query, $limit = 50)
    {
        if (empty(trim($query))) {
            return [];
        }

        return $this->carelliItemModel->searchItems($query, $limit);
    }

    public function getItem($itemId)
    {
        if (!$itemId || !is_numeric($itemId)) {
            return null;
        }

        return $this->carelliItemModel->getItem($itemId);
    }

    public function getCategories()
    {
        return $this->carelliItemModel->getCategories();
    }

    public function getSubcategories($categoryId)
    {
        if (!$categoryId || !is_numeric($categoryId)) {
            return [];
        }

        return $this->carelliItemModel->getSubcategories($categoryId);
    }

    public function getItemsByCategory($categoryId, $limit = 100)
    {
        if (!$categoryId || !is_numeric($categoryId)) {
            return [];
        }

        return $this->carelliItemModel->getItemsByCategory($categoryId, $limit);
    }

    public function validateItemExists($itemId)
    {
        if (!$itemId || !is_numeric($itemId)) {
            return false;
        }

        $item = $this->carelliItemModel->validateItemExists($itemId);
        return $item !== false;
    }

    public function getItemForProduct($itemId)
    {
        $item = $this->getItem($itemId);
        
        if (!$item) {
            return null;
        }

        // Format item data for product creation
        return [
            'carelli_item_id' => $item['item_id'],
            'name' => $item['title'],
            'description' => $item['description'] ?? $item['text'] ?? '',
            'base_price' => $item['price'] ?? $item['price_initial'] ?? 0,
            'code' => $item['code'],
            'ean' => $item['ean'],
            'keywords' => $item['keywords'],
            'category_name' => $item['category_name'],
            'subcategory_name' => $item['subcategory_name']
        ];
    }

    public function getItemForTranslation($itemId)
    {
        $item = $this->getItem($itemId);
        
        if (!$item) {
            return null;
        }

        // Format item data for product translation
        return [
            'web_id' => $item['item_id'],
            'name' => $item['title'],
            'description' => $item['text'] ?? $item['description'] ?? '',
            'base_price' => $item['price'] ?? $item['price_initial'] ?? 0,
            'language_id' => $item['language_id']
        ];
    }
} 
