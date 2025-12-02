<?php

namespace App\Models;

use Config\Database;

class PersonModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("
            SELECT 
                p.person_id, 
                p.first_name, 
                p.last_name, 
                p.email, 
                p.phone, 
                pt.type_name AS person_type, 
                p.is_active,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'address_id', a.address_id,
                        'person_id', a.person_id,
                        'address_type_id', a.address_type_id,
                        'address_type_name', at.type_name,
                        'street', a.street,
                        'city', a.city,
                        'state_province', a.state_province,
                        'postal_code', a.postal_code,
                        'country', a.country
                    )
                ) as addresses
            FROM persons p
            JOIN person_type pt ON p.person_type_id = pt.person_type_id
            LEFT JOIN addresses a ON a.person_id = p.person_id
            LEFT JOIN address_type at ON a.address_type_id = at.address_type_id
            WHERE p.is_active = 1
            GROUP BY p.person_id
        ");
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Process addresses for each person
        foreach ($results as &$person) {
            $person['addresses'] = json_decode($person['addresses'], true);
            // Remove null addresses
            $person['addresses'] = array_filter($person['addresses'], function($address) {
                return $address['address_id'] !== null;
            });
        }
        
        return $results;
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO persons (first_name, last_name, email, phone, person_type_id, created_at)
            VALUES (:first_name, :last_name, :email, :phone, :person_type_id, NOW())
        ");
        $stmt->execute([
            ':first_name' => $data['first_name'],
            ':last_name' => $data['last_name'],
            ':email' => $data['email'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':person_type_id' => $data['person_type_id']
        ]);

        return ['person_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':person_id' => $id];

        // Map fields we want to update from persons table
        $allowedFields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'person_type_id',
            'is_active'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (!empty($fields)) {
            $sql = "UPDATE persons SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE person_id = :person_id";
            error_log("SQL: " . $sql);
            error_log("Params: " . print_r($params, true));
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }

        return ['message' => 'Person updated successfully'];
    }

    public function updateAddress($personId, $addressData)
    {
        // Map address fields to correct DB columns
        $mappedData = [
            'address_type_id' => $addressData['address_type_id'] ?? null,
            'street' => $addressData['street'] ?? '',
            'city' => $addressData['city'] ?? '',
            'state_province' => $addressData['state'] ?? '', // Fix the state field name
            'postal_code' => $addressData['postal_code'] ?? '',
            'country' => $addressData['country'] ?? ''
        ];

        // First check if address exists
        $stmt = $this->db->prepare("SELECT address_id FROM addresses WHERE person_id = :person_id LIMIT 1");
        $stmt->execute([':person_id' => $personId]);
        $existingAddress = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($existingAddress) {
            // Update existing address
            $fields = [];
            $params = [':address_id' => $existingAddress['address_id']];

            foreach ($mappedData as $key => $value) {
                if ($value !== null) {  // Only include non-null values
                    $fields[] = "$key = :$key";
                    $params[":$key"] = $value;
                }
            }

            if (empty($fields)) {
                throw new \Exception('No valid fields to update');
            }

            $sql = "UPDATE addresses SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE address_id = :address_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        } else {
            // Insert new address
            $mappedData['person_id'] = $personId;
            $fields = array_keys($mappedData);
            $values = array_map(function ($field) {
                return ":$field";
            }, $fields);

            $sql = "INSERT INTO addresses (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $values) . ")";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(array_combine($values, array_values($mappedData)));
        }
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("UPDATE persons SET is_active = 0 WHERE person_id = :person_id");
        $stmt->execute([':person_id' => $id]);
    }

    public function get($id)
    {
        $stmt = $this->db->prepare("
        SELECT 
            p.person_id, 
            p.first_name, 
            p.last_name, 
            p.email, 
            p.phone,
            p.person_type_id,
            pt.type_name AS person_type, 
            p.is_active,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'address_id', a.address_id,
                    'person_id', a.person_id,
                    'address_type_id', a.address_type_id,
                    'address_type_name', at.type_name,
                    'street', a.street,
                    'city', a.city,
                    'state_province', a.state_province,
                    'postal_code', a.postal_code,
                    'country', a.country
                )
            ) as addresses
        FROM persons p
        JOIN person_type pt ON p.person_type_id = pt.person_type_id
        LEFT JOIN addresses a ON a.person_id = p.person_id
        LEFT JOIN address_type at ON a.address_type_id = at.address_type_id
        WHERE p.person_id = :person_id
        GROUP BY p.person_id
    ");
        $stmt->execute([':person_id' => $id]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($result) {
            $result['addresses'] = json_decode($result['addresses'], true);
            //throw away the address address_id if it is null
            foreach ($result['addresses'] as $key => $address) {
                if (is_null($address['address_id'])) {
                    unset($result['addresses'][$key]);
                }
            }
        }

        return $result;
    }

    public function getByEmail($email)
    {
        $stmt = $this->db->prepare("
            SELECT 
                p.person_id, 
                p.first_name, 
                p.last_name, 
                p.email, 
                p.phone,
                p.person_type_id,
                pt.type_name AS person_type, 
                p.is_active
            FROM persons p
            JOIN person_type pt ON p.person_type_id = pt.person_type_id
            WHERE p.email = :email AND p.is_active = 1
        ");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getPersonAddresses($personId)
    {
        $stmt = $this->db->prepare("
            SELECT a.address_id, a.address_type_id, at.type_name as address_type_name,
                   a.street, a.city, a.state_province, a.postal_code, 
                   a.country, a.latitude, a.longitude, a.is_active
            FROM addresses a
            LEFT JOIN address_type at ON a.address_type_id = at.address_type_id
            WHERE a.person_id = :person_id AND a.is_active = 1
        ");
        $stmt->execute([':person_id' => $personId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updateAddresses($personId, $addresses)
    {
        foreach ($addresses as $addressData) {
            $mappedData = [
                'address_type_id' => $addressData['address_type_id'] ?? null,
                'street' => $addressData['street'] ?? '',
                'floor' => $addressData['floor'] ?? '',
                'city' => $addressData['city'] ?? '',
                'state_province' => $addressData['state'] ?? '',
                'postal_code' => $addressData['postal_code'] ?? '',
                'country' => $addressData['country'] ?? '',
                'person_id' => $personId
            ];

            if (!empty($addressData['address_id'])) {
                // Update by address_id
                $fields = [];
                $params = [':address_id' => $addressData['address_id']];
                foreach ($mappedData as $key => $value) {
                    $fields[] = "$key = :$key";
                    $params[":$key"] = $value;
                }
                $sql = "UPDATE addresses SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE address_id = :address_id";
                $stmt2 = $this->db->prepare($sql);
                $stmt2->execute($params);
            } else {
                // Insert new address
                $fields = array_keys($mappedData);
                $values = array_map(function ($field) { return ":$field"; }, $fields);
                $sql = "INSERT INTO addresses (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $values) . ")";
                $stmt2 = $this->db->prepare($sql);
                $stmt2->execute(array_combine($values, array_values($mappedData)));
            }
        }
    }

}
