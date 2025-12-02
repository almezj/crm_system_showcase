<?php

namespace App\Models;

use Config\Database;

class UserModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("SELECT 
        users.user_id, users.email, users.first_name, users.last_name, GROUP_CONCAT(roles.role_name) as roles 
        FROM users 
        LEFT JOIN user_role ON users.user_id = user_role.user_id 
        LEFT JOIN roles ON user_role.role_id = roles.role_id 
        WHERE users.is_active = 1 GROUP BY users.user_id");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO users (email, password_hash, salt, first_name, last_name, phone_number, created_at)
            VALUES (:email, :password_hash, :salt, :first_name, :last_name, :phone_number, NOW())
        ");
        $stmt->execute([
            ':email' => $data['email'],
            ':password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            ':salt' => bin2hex(random_bytes(16)),
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':phone_number' => $data['phone_number']
        ]);

        return ['user_id' => $this->db->lastInsertId()];
    }

    public function terminateAllSessions($userId)
    {
        $stmt = $this->db->prepare("
            UPDATE sessions SET is_active = 0 WHERE user_id = :user_id
        ");
        $stmt->execute([':user_id' => $userId]);
    }

    public function get($id)
    {
        $stmt = $this->db->prepare("SELECT 
            users.user_id, users.email, users.first_name, users.last_name, users.phone_number, users.is_active,
            user_role.role_id
            FROM users 
            LEFT JOIN user_role ON users.user_id = user_role.user_id 
            WHERE users.user_id = :user_id AND users.is_active = 1");
        $stmt->execute([':user_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function update($id, $data)
    {

        $stmt = $this->db->prepare("
            UPDATE users
            SET email = :email, first_name = :first_name, 
            last_name = :last_name, 
            phone_number = :phone_number
            WHERE user_id = :user_id
        ");

        $stmt->execute([
            ':email' => $data['email'],
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':phone_number' => $data['phone_number'],
            ':user_id' => $id
        ]);

        return ['user_id' => $id];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("UPDATE 
        users SET is_active = 0, deleted_at = NOW()
        WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $id]);

        return ['user_id' => $id];
    }
}
