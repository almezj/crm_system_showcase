<?php

namespace App\Libraries;

use App\Models\PermissionModel;

class PermissionLibrary
{
    private $permissionModel;

    public function __construct()
    {
        $this->permissionModel = new PermissionModel();
    }

    public function getAllPermissions()
    {
        return $this->permissionModel->getAll();
    }

    public function getPermissionById($id)
    {
        return $this->permissionModel->getById($id);
    }

    public function createPermission($data)
    {
        return $this->permissionModel->create($data);
    }

    public function updatePermission($id, $data)
    {
        return $this->permissionModel->update($id, $data);
    }

    public function deletePermission($id)
    {
        return $this->permissionModel->delete($id);
    }
}
