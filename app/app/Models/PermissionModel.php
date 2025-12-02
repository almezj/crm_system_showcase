<?php

namespace App\Models;

use Config\Database;

class PermissionModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM rights");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM rights WHERE right_id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO rights (area_name, description, created_at)
            VALUES (:area_name, :description, NOW())
        ");
        $stmt->execute([
            ':area_name' => $data['area_name'],
            ':description' => $data['description'],
        ]);

        return ['right_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }

        $sql = "UPDATE rights SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE right_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Permission updated successfully'];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM rights WHERE right_id = :id");
        $stmt->execute([':id' => $id]);
    }
}
