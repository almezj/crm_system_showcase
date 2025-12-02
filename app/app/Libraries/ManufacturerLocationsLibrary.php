<?php

namespace App\Libraries;

use App\Models\ManufacturerLocationsModel;

class ManufacturerLocationsLibrary
{
    private $manufacturerLocationsModel;

    public function __construct()
    {
        $this->manufacturerLocationsModel = new ManufacturerLocationsModel();
    }

    public function getLocations()
    {
        return $this->manufacturerLocationsModel->getAll();
    }

    public function addLocation($data)
    {
        return $this->manufacturerLocationsModel->create($data);
    }

    public function updateLocation($id, $data)
    {
        return $this->manufacturerLocationsModel->update($id, $data);
    }

    public function deleteLocation($id)
    {
        return $this->manufacturerLocationsModel->delete($id);
    }
}
