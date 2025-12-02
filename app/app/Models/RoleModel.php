<?php

namespace App\Models;

use Config\Database;

class RoleModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAllRolesWithPermissions()
    {
        $stmt = $this->db->query("
            SELECT roles.role_id,
                roles.role_name, 
                roles.description, 
                rights.right_id,
                rights.area_name, 
                role_right.permission_type
            FROM roles
            LEFT JOIN role_right ON roles.role_id = role_right.role_id
            LEFT JOIN rights ON role_right.right_id = rights.right_id
            WHERE roles.is_active = 1
        ");
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $roles = [];
        foreach ($rows as $row) {
            if (!isset($roles[$row['role_id']])) {
                $roles[$row['role_id']] = [
                    'role_id' => $row['role_id'],
                    'role_name' => $row['role_name'],
                    'description' => $row['description'],
                    'rights' => []
                ];
            }
            $roles[$row['role_id']]['rights'][] = [
                'area_name' => $row['area_name'],
                'permission_type' => $row['permission_type']
            ];
        }

        return array_values($roles);
    }

    public function createRole($roleName, $description)
    {
        $stmt = $this->db->prepare("INSERT INTO roles 
        (role_name,description, created_at) VALUES (:role_name, 
        :description,
        NOW())");
        $stmt->execute([
            ':role_name' => $roleName,
            ':description' => $description
        ]);
        return $this->db->lastInsertId();
    }

    public function updateRole($roleId, $roleName, $description)
    {
        error_log("Updating role $roleId");
        $stmt = $this->db->prepare("UPDATE roles 
        SET role_name = :role_name,
            description = :description,
         updated_at = NOW() 
        WHERE role_id = :role_id");
        return $stmt->execute([
            ':role_id' => $roleId,
            ':role_name' => $roleName,
            ':description' => $description
        ]);
    }

    public function assignPermissionToRole($roleId, $permission)
    {
        $stmt = $this->db->prepare("
            INSERT INTO role_right (role_id, right_id, permission_type, created_at)
            SELECT :role_id, :right_id, :permission_type, NOW()
            FROM rights
            WHERE right_id = :right_id
            
        ");
        $stmt->execute([
            ':role_id' => $roleId,
            ':right_id' => $permission['right_id'],
            ':permission_type' => $permission['permission_type']
        ]);
    }

    public function removeAllPermissionsFromRole($roleId)
    {
        $stmt = $this->db->prepare("DELETE FROM role_right WHERE role_id = :role_id");
        $stmt->execute([':role_id' => $roleId]);
    }
}
