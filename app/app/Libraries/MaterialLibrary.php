<?php

namespace App\Libraries;

use App\Models\MaterialModel;

class MaterialLibrary
{
    private $materialModel;

    public function __construct()
    {
        $this->materialModel = new MaterialModel();
    }

    public function getAll()
    {
        return $this->materialModel->getAll();
    }

    public function get($id)
    {
        return $this->materialModel->get($id);
    }

    public function create($data)
    {
        return $this->materialModel->create($data);
    }

    public function update($id, $data)
    {
        return $this->materialModel->update($id, $data);
    }

    public function searchByName($query)
    {
        return $this->materialModel->searchByName($query);
    }

    public function addMaterialImage($materialId, $imagePath, $title = null, $description = null)
    {
        return $this->materialModel->addMaterialImage($materialId, $imagePath, $title, $description);
    }

    public function getMaterialImages($materialId)
    {
        return $this->materialModel->getMaterialImages($materialId);
    }

    public function deleteMaterialImage($imageId)
    {
        return $this->materialModel->deleteMaterialImage($imageId);
    }

    public function delete($id)
    {
        return $this->materialModel->delete($id);
    }
}