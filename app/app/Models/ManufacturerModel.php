<?php

namespace App\Models;

use Config\Database;

class ManufacturerModel
{
    private $db;
    private $editableFields = [
        'name',
        'contact_person',
        'contact_email',
        'contact_phone',
        'default_lead_time',
        'is_active'
    ];

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("
            SELECT m.manufacturer_id, m.name, m.contact_person, m.contact_email, m.contact_phone, 
                   m.default_lead_time, m.is_active
            FROM manufacturers m
            WHERE m.deleted_at is null
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function get($id)
    {
        $stmt = $this->db->prepare("
            SELECT m.*
            FROM manufacturers m
            WHERE m.manufacturer_id = :manufacturer_id AND m.deleted_at is null
        ");
        $stmt->execute([':manufacturer_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO manufacturers (name, contact_person, contact_email, contact_phone, default_lead_time, created_at)
            VALUES (:name, :contact_person, :contact_email, :contact_phone, :default_lead_time, NOW())
        ");
        $stmt->execute([
            ':name' => $data['name'],
            ':contact_person' => $data['contact_person'],
            ':contact_email' => $data['contact_email'] ?? null,
            ':contact_phone' => $data['contact_phone'] ?? null,
            ':default_lead_time' => $data['default_lead_time'] ?? null
        ]);

        return ['manufacturer_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':manufacturer_id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $this->editableFields)) {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }

        if (empty($fields)) {
            return ['message' => 'No valid fields to update'];
        }

        $sql = "UPDATE manufacturers SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE manufacturer_id = :manufacturer_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Manufacturer updated successfully'];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("
            UPDATE manufacturers 
            SET deleted_at = NOW(),
                is_active = 0 
            WHERE manufacturer_id = :manufacturer_id
        ");
        $stmt->execute([':manufacturer_id' => $id]);
    }
}
