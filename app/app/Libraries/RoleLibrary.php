<?php

namespace App\Libraries;

use App\Models\RoleModel;

class RoleLibrary
{
    private $roleModel;

    public function __construct()
    {
        $this->roleModel = new RoleModel();
    }

    public function getRoles()
    {
        return $this->roleModel->getAllRolesWithPermissions();
    }

    public function getRoleById($roleId)
    {
        $roles = $this->roleModel->getAllRolesWithPermissions();
        foreach ($roles as $role) {
            if ($role['role_id'] == $roleId) {
                return $role;
            }
        }
        return null;
    }

    public function addRole($roleName, $description, $permissions)
    {
        $roleId = $this->roleModel->createRole($roleName, $description);
        foreach ($permissions as $permission) {
            $this->roleModel->assignPermissionToRole($roleId, $permission);
        }
        return ['role_id' => $roleId];
    }

    public function updateRole($roleId, $roleName, $description)
    {
        return $this->roleModel->updateRole($roleId, $roleName, $description);
    }

    public function updateRolePermissions($roleId, $permissions)
    {
        $this->roleModel->removeAllPermissionsFromRole($roleId);
        foreach ($permissions as $permission) {
            $this->roleModel->assignPermissionToRole($roleId, $permission);
        }
        return ['message' => 'Permissions updated successfully'];
    }
}
