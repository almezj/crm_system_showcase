<?php

namespace App\Libraries;

use App\Models\ProductTranslationModel;

class ProductTranslationLibrary
{
    private $translationModel;

    public function __construct()
    {
        $this->translationModel = new ProductTranslationModel();
    }

    public function getProductTranslations($productId)
    {
        return $this->translationModel->getTranslations($productId);
    }

    public function addTranslation($data)
    {
        \App\Utils\Logger::debug("ProductTranslationLibrary::addTranslation - Creating translation with data: " . json_encode($data));
        try {
            $result = $this->translationModel->create($data);
            \App\Utils\Logger::debug("ProductTranslationLibrary::addTranslation - Translation created successfully: " . json_encode($result));
            return $result;
        } catch (\Exception $e) {
            \App\Utils\Logger::error("ProductTranslationLibrary::addTranslation - Error creating translation: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateTranslation($id, $data)
    {
        return $this->translationModel->update($id, $data);
    }

    public function deleteTranslation($id)
    {
        return $this->translationModel->delete($id);
    }
} 