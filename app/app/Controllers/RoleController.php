<?php

namespace App\Controllers;

use App\Libraries\RoleLibrary;
use App\Utils\JsonResponse;

class RoleController
{
    private $roleLibrary;

    public function __construct()
    {
        $this->roleLibrary = new RoleLibrary();
        error_log('RoleController created');
    }

    public function getAllRoles()
    {
        $roles = $this->roleLibrary->getRoles();
        JsonResponse::send($roles);
    }

    public function getRole($id)
    {
        $role = $this->roleLibrary->getRoleById($id);
        if (!$role) {
            JsonResponse::send(['error' => 'Role not found'], 404);
        }
        JsonResponse::send($role);
    }

    public function createRole()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['role_name']) || !isset($data['rights'])) {
            JsonResponse::send(['error' => 'Role name and permissions are required'], 400);
        }

        $result = $this->roleLibrary->addRole(
            $data['role_name'],
            $data['description'],
            $data['rights']
        );
        JsonResponse::send($result, 201);
    }

    public function updateRole($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['rights'])) {
            JsonResponse::send(['error' => 'Permissions are required'], 400);
        }

        $result = $this->roleLibrary->updateRole($id, $data['role_name'], $data['description']);
        if (!$result) {
            JsonResponse::send(['error' => 'Role not found'], 404);
        } else {
            $result = $this->roleLibrary->updateRolePermissions($id, $data['rights']);
            JsonResponse::send($result);
        }
    }
}
