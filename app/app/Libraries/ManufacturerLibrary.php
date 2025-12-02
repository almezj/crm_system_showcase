<?php

namespace App\Libraries;

use App\Models\ManufacturerModel;

class ManufacturerLibrary
{
    private $manufacturerModel;

    public function __construct()
    {
        $this->manufacturerModel = new ManufacturerModel();
    }

    public function getManufacturers()
    {
        return $this->manufacturerModel->getAll();
    }

    public function getManufacturer($id)
    {
        return $this->manufacturerModel->get($id);
    }

    public function addManufacturer($data)
    {
        return $this->manufacturerModel->create($data);
    }

    public function updateManufacturer($id, $data)
    {
        return $this->manufacturerModel->update($id, $data);
    }

    public function deleteManufacturer($id)
    {
        return $this->manufacturerModel->delete($id);
    }
}
