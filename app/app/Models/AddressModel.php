<?php

namespace App\Models;

use Config\Database;

class AddressModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("
            SELECT a.address_id, a.address_type_id, at.type_name as address_type_name,
                   a.street, a.floor, a.city, a.state_province, a.postal_code, 
                   a.country, a.latitude, a.longitude, a.is_active
            FROM addresses a
            LEFT JOIN address_type at ON a.address_type_id = at.address_type_id
            WHERE a.is_active = 1
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO addresses 
            (address_type_id,
            street, 
            floor,
            city, 
            state_province, 
            postal_code, country, 
            latitude, 
            longitude, 
            created_at,
            person_id
            )
            VALUES (:address_type_id, :street, :floor, :city, :state_province, :postal_code, :country, :latitude, :longitude, NOW(),
            NULLIF(:person_id, 0)
            )
        ");
        $stmt->execute([
            ':address_type_id' => $data['address_type_id'],
            ':street' => $data['street'],
            ':floor' => $data['floor'] ?? null,
            ':city' => $data['city'],
            ':state_province' => $data['state_province'] ?? null,
            ':postal_code' => $data['postal_code'] ?? null,
            ':country' => $data['country'],
            ':latitude' => $data['latitude'] ?? null,
            ':longitude' => $data['longitude'] ?? null,
            ':person_id' => $data['person_id'] ?? 0
        ]);

        return ['address_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':address_id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }

        $sql = "UPDATE addresses SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE address_id = :address_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Address updated successfully'];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("UPDATE addresses SET is_active = 0 WHERE address_id = :address_id");
        $stmt->execute([':address_id' => $id]);
    }
}
