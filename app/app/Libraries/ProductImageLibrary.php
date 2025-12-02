<?php

namespace App\Libraries;

use App\Models\ProductImageModel;
use App\Utils\FileUploader;

class ProductImageLibrary
{
    private $productImageModel;

    public function __construct()
    {
        $this->productImageModel = new ProductImageModel();
    }

    public function getProductImages($productId)
    {
        return $this->productImageModel->getByProduct($productId);
    }

    public function addProductImage($data)
    {
        // Handle file upload if file is provided
        if (isset($data['file'])) {
            $productId = isset($data['product_id']) ? $data['product_id'] : null;
            $directory = $productId ? "products/{$productId}" : 'products/temp';
            $filePath = FileUploader::upload($data['file'], $directory);
            $data['image_url'] = $filePath;
        }

        return $this->productImageModel->create($data);
    }

    public function updateProductImage($id, $data)
    {
        // Handle file upload if file is provided
        if (isset($data['file'])) {
            $filePath = FileUploader::upload($data['file'], 'products');
            $data['image_url'] = $filePath;
        }

        return $this->productImageModel->update($id, $data);
    }

    public function deleteProductImage($id)
    {
        return $this->productImageModel->delete($id);
    }

    public function setPrimaryImage($productId, $imageId)
    {
        return $this->productImageModel->setPrimary($productId, $imageId);
    }

    public function unsetPrimaryImage($productId)
    {
        return $this->productImageModel->unsetPrimary($productId);
    }
} 