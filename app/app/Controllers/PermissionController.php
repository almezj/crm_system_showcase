<?php

namespace App\Controllers;

use App\Libraries\PermissionLibrary;
use App\Utils\JsonResponse;

class PermissionController
{
    private $permissionLibrary;

    public function __construct()
    {
        $this->permissionLibrary = new PermissionLibrary();
    }

    public function getAllPermissions()
    {
        $permissions = $this->permissionLibrary->getAllPermissions();
        JsonResponse::send($permissions);
    }

    public function getPermission($id)
    {
        $permission = $this->permissionLibrary->getPermissionById($id);
        if (!$permission) {
            JsonResponse::send(['error' => 'Permission not found'], 404);
        }
        JsonResponse::send($permission);
    }

    public function createPermission()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['area_name']) || !isset($data['description'])) {
            JsonResponse::send(['error' => 'Area name and description are required'], 400);
        }

        $result = $this->permissionLibrary->createPermission($data);
        JsonResponse::send($result, 201);
    }

    public function updatePermission($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->permissionLibrary->updatePermission($id, $data);
        JsonResponse::send($result);
    }

    public function deletePermission($id)
    {
        $this->permissionLibrary->deletePermission($id);
        JsonResponse::send(['message' => 'Permission deleted successfully'], 204);
    }
}
