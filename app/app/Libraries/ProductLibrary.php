<?php

namespace App\Libraries;

use App\Models\ProductModel;

class ProductLibrary
{
    private $productModel;
    private $productTranslationLibrary;

    public function __construct()
    {
        $this->productModel = new ProductModel();
        $this->productTranslationLibrary = new ProductTranslationLibrary();
    }

    public function getProducts($showDeleted = false, $page = 1, $limit = 10)
    {
        $result = $this->productModel->getAll($showDeleted, $page, $limit);
        
        // Ensure we have the expected structure
        if (!isset($result['products']) || !is_array($result['products'])) {
            return [
                'products' => [],
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $limit,
                    'total' => 0,
                    'total_pages' => 0
                ]
            ];
        }
        
        // Add translations to each product
        foreach ($result['products'] as &$product) {
            $product['translations'] = $this->productTranslationLibrary->getProductTranslations($product['product_id']);
        }
        
        return $result;
    }

    public function getProduct($id)
    {
        return $this->productModel->get($id);
    }

    public function addProduct($data)
    {
        \App\Utils\Logger::debug("ProductLibrary::addProduct - Creating product with data: " . json_encode($data));
        try {
            $result = $this->productModel->create($data);
            \App\Utils\Logger::debug("ProductLibrary::addProduct - Product created successfully: " . json_encode($result));
            return $result;
        } catch (\Exception $e) {
            \App\Utils\Logger::error("ProductLibrary::addProduct - Error creating product: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateProduct($id, $data)
    {
        return $this->productModel->update($id, $data);
    }

    public function deleteProduct($id)
    {
        return $this->productModel->delete($id);
    }

    public function searchProducts($searchQuery, $limit = 20)
    {
        $products = $this->productModel->searchProducts($searchQuery, $limit);
        
        // For search results, we don't need translations to keep it fast and simple
        // Translations are only needed when viewing individual products
        return $products;
    }
}
