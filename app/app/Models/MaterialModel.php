<?php

namespace App\Models;

use Config\Database;

class MaterialModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("
            SELECT m.id, m.name, m.code, m.color, m.type, m.style, m.description, 
                   m.created_at, m.updated_at,
                   mi.image_path
            FROM material m
            LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                SELECT MIN(mi2.image_id) 
                FROM material_image mi2 
                WHERE mi2.material_id = m.id
            )
            WHERE m.deleted_at IS NULL
            ORDER BY m.name ASC
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function get($id)
    {
        $stmt = $this->db->prepare("
            SELECT m.id, m.name, m.code, m.color, m.type, m.style, m.description, 
                   m.created_at, m.updated_at,
                   mi.image_path
            FROM material m
            LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                SELECT MIN(mi2.image_id) 
                FROM material_image mi2 
                WHERE mi2.material_id = m.id
            )
            WHERE m.id = :id AND m.deleted_at IS NULL
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO material (name, code, color, type, style, description, created_at, updated_at)
            VALUES (:name, :code, :color, :type, :style, :description, NOW(), NOW())
        ");
        $stmt->execute([
            ':name' => $data['name'],
            ':code' => $data['code'] ?? '',
            ':color' => $data['color'] ?? '',
            ':type' => $data['type'] ?? '',
            ':style' => $data['style'] ?? '',
            ':description' => $data['description'] ?? ''
        ]);

        $materialId = $this->db->lastInsertId();
        return $this->get($materialId);
    }

    public function update($id, $data)
    {
        // Validate required fields
        if (!isset($data['name']) || empty($data['name'])) {
            throw new \Exception("Material name is required");
        }
        
        $stmt = $this->db->prepare("
            UPDATE material 
            SET name = :name, code = :code, color = :color, type = :type, style = :style, 
                description = :description, updated_at = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':code' => $data['code'] ?? '',
            ':color' => $data['color'] ?? '',
            ':type' => $data['type'] ?? '',
            ':style' => $data['style'] ?? '',
            ':description' => $data['description'] ?? ''
        ]);

        return $this->get($id);
    }

    public function searchByName($query)
    {
        $stmt = $this->db->prepare("
            SELECT m.id, m.name, m.code, m.color, m.type, m.style, m.description, 
                   m.created_at, m.updated_at,
                   mi.image_path
            FROM material m
            LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                SELECT MIN(mi2.image_id) 
                FROM material_image mi2 
                WHERE mi2.material_id = m.id
            )
            WHERE m.deleted_at IS NULL
            AND m.name LIKE :query
            ORDER BY m.name ASC
            LIMIT 50
        ");
        $stmt->execute([':query' => '%' . $query . '%']);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getByName($name)
    {
        $stmt = $this->db->prepare("
            SELECT m.id, m.name, m.code, m.color, m.type, m.style, m.description, 
                   m.created_at, m.updated_at,
                   mi.image_path
            FROM material m
            LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                SELECT MIN(mi2.image_id) 
                FROM material_image mi2 
                WHERE mi2.material_id = m.id
            )
            WHERE m.name = :name AND m.deleted_at IS NULL
        ");
        $stmt->execute([':name' => $name]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function createOrGet($data)
    {
        try {
            // First try to find existing material with same name
            $existing = $this->getByName($data['name']);
            if ($existing) {
                error_log("MaterialModel: Found existing material with name '{$data['name']}', ID: {$existing['id']}");
                return $existing['id'];
            }

            // Create new material
            $stmt = $this->db->prepare("
                INSERT INTO material (name, code, color, type, style, description, created_at, updated_at)
                VALUES (:name, :code, :color, :type, :style, :description, NOW(), NOW())
            ");
            $stmt->execute([
                ':name' => $data['name'],
                ':code' => $data['code'] ?? '',
                ':color' => $data['color'] ?? '',
                ':type' => $data['type'] ?? '',
                ':style' => $data['style'] ?? '',
                ':description' => $data['description'] ?? ''
            ]);

            $materialId = $this->db->lastInsertId();
            error_log("MaterialModel: Created new material with name '{$data['name']}', ID: $materialId");
            return $materialId;
        } catch (\Exception $e) {
            error_log("MaterialModel::createOrGet error: " . $e->getMessage());
            error_log("MaterialModel::createOrGet data: " . json_encode($data, JSON_PRETTY_PRINT));
            throw $e;
        }
    }

    public function addMaterialImage($materialId, $imagePath, $title = null, $description = null)
    {
        $stmt = $this->db->prepare("
            INSERT INTO material_image (material_id, title, description, image_path, uploaded_at)
            VALUES (:material_id, :title, :description, :image_path, NOW())
        ");
        $stmt->execute([
            ':material_id' => $materialId,
            ':title' => $title,
            ':description' => $description,
            ':image_path' => $imagePath
        ]);
        return $this->db->lastInsertId();
    }

    public function getMaterialImages($materialId)
    {
        $stmt = $this->db->prepare("
            SELECT image_id, material_id, title, description, image_path, uploaded_at
            FROM material_image
            WHERE material_id = :material_id
            ORDER BY uploaded_at ASC
        ");
        $stmt->execute([':material_id' => $materialId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function deleteMaterialImage($imageId)
    {
        $stmt = $this->db->prepare("
            DELETE FROM material_image
            WHERE image_id = :image_id
        ");
        return $stmt->execute([':image_id' => $imageId]);
    }

    public function delete($id)
    {
        // Soft delete by setting deleted_at timestamp
        $stmt = $this->db->prepare("
            UPDATE material 
            SET deleted_at = NOW()
            WHERE id = :id
        ");
        return $stmt->execute([':id' => $id]);
    }
}