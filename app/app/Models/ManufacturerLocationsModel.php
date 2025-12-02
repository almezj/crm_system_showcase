<?php

namespace App\Models;

use Config\Database;

class ManufacturerLocationsModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("
            SELECT ml.location_id, ml.name, ml.capacity, m.name AS manufacturer_name, 
                   a.street, a.city, a.state_province, a.country
            FROM manufacturer_locations ml
            JOIN manufacturers m ON ml.manufacturer_id = m.manufacturer_id
            JOIN addresses a ON ml.address_id = a.address_id
            WHERE ml.is_active = 1
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO manufacturer_locations (manufacturer_id, address_id, name, capacity, created_at)
            VALUES (:manufacturer_id, :address_id, :name, :capacity, NOW())
        ");
        $stmt->execute([
            ':manufacturer_id' => $data['manufacturer_id'],
            ':address_id' => $data['address_id'],
            ':name' => $data['name'],
            ':capacity' => $data['capacity'] ?? null
        ]);

        return ['location_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':location_id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }

        $sql = "UPDATE manufacturer_locations SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE location_id = :location_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Location updated successfully'];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("UPDATE manufacturer_locations SET is_active = 0 WHERE location_id = :location_id");
        $stmt->execute([':location_id' => $id]);
    }
}
