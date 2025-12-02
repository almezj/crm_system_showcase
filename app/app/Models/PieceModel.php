<?php

namespace App\Models;

use Config\Database;

class PieceModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create($data)
    {
        error_log('[PieceModel] create() called with data: ' . json_encode($data));
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO pieces (
                    product_id, 
                    internal_manufacturer_code, 
                    ean_code, 
                    qr_code, 
                    description, 
                    is_active, 
                    created_at
                ) VALUES (
                    :product_id, 
                    :internal_manufacturer_code, 
                    :ean_code, 
                    :qr_code, 
                    :description, 
                    :is_active, 
                    NOW()
                )
            ");

            $params = [
                ':product_id' => $data['product_id'],
                ':internal_manufacturer_code' => $data['internal_manufacturer_code'],
                ':ean_code' => $data['ean_code'] ?? null,
                ':qr_code' => $data['qr_code'] ?? null,
                ':description' => $data['description'] ?? null,
                ':is_active' => $data['is_active'] ?? 1
            ];
            
            error_log('[PieceModel] Executing with params: ' . json_encode($params));
            
            $result = $stmt->execute($params);
            error_log('[PieceModel] Execute result: ' . ($result ? 'success' : 'failed'));
            
            if ($result) {
                $lastId = $this->db->lastInsertId();
                error_log('[PieceModel] Last insert ID: ' . $lastId);
                $createdPiece = $this->get($lastId);
                error_log('[PieceModel] Created piece: ' . json_encode($createdPiece));
                return $createdPiece;
            } else {
                error_log('[PieceModel] Execute failed: ' . json_encode($stmt->errorInfo()));
                return false;
            }
        } catch (\Exception $e) {
            error_log('[PieceModel] Exception in create(): ' . $e->getMessage());
            error_log('[PieceModel] Exception trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    public function get($id)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM pieces 
            WHERE piece_id = :piece_id AND is_active = 1 AND deleted_at IS NULL
        ");
        $stmt->execute([':piece_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getByProductId($productId)
    {
        error_log('[PieceModel] getByProductId() called with productId: ' . $productId);
        $stmt = $this->db->prepare("
            SELECT p.*, 
                   GROUP_CONCAT(DISTINCT m.id) as material_ids,
                   GROUP_CONCAT(DISTINCT m.name) as material_names,
                   GROUP_CONCAT(DISTINCT m.code) as material_codes,
                   GROUP_CONCAT(DISTINCT m.color) as material_colors,
                   GROUP_CONCAT(DISTINCT m.type) as material_types,
                   GROUP_CONCAT(DISTINCT m.style) as material_styles,
                   GROUP_CONCAT(DISTINCT m.description) as material_descriptions,
                   GROUP_CONCAT(DISTINCT mi.image_path) as material_image_paths
            FROM pieces p
            LEFT JOIN material_piece mp ON p.piece_id = mp.piece_id
            LEFT JOIN material m ON mp.material_id = m.id
            LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                SELECT MIN(mi2.image_id) 
                FROM material_image mi2 
                WHERE mi2.material_id = m.id
            )
            WHERE p.product_id = :product_id AND p.is_active = 1 AND p.deleted_at IS NULL
            GROUP BY p.piece_id
            ORDER BY p.internal_manufacturer_code ASC
        ");
        $stmt->execute([':product_id' => $productId]);
        $pieces = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Process the concatenated material data
        foreach ($pieces as &$piece) {
            // Convert concatenated strings to arrays
            $piece['material_ids'] = $piece['material_ids'] ? explode(',', $piece['material_ids']) : [];
            $piece['material_names'] = $piece['material_names'] ? explode(',', $piece['material_names']) : [];
            $piece['material_codes'] = $piece['material_codes'] ? explode(',', $piece['material_codes']) : [];
            $piece['material_colors'] = $piece['material_colors'] ? explode(',', $piece['material_colors']) : [];
            $piece['material_types'] = $piece['material_types'] ? explode(',', $piece['material_types']) : [];
            $piece['material_styles'] = $piece['material_styles'] ? explode(',', $piece['material_styles']) : [];
            $piece['material_descriptions'] = $piece['material_descriptions'] ? explode(',', $piece['material_descriptions']) : [];
            $piece['material_image_paths'] = $piece['material_image_paths'] ? explode(',', $piece['material_image_paths']) : [];
            
            // Create materials array for easier frontend consumption
            $piece['materials'] = [];
            for ($i = 0; $i < count($piece['material_ids']); $i++) {
                $piece['materials'][] = [
                    'id' => $piece['material_ids'][$i],
                    'name' => $piece['material_names'][$i] ?? '',
                    'code' => $piece['material_codes'][$i] ?? '',
                    'color' => $piece['material_colors'][$i] ?? '',
                    'type' => $piece['material_types'][$i] ?? '',
                    'style' => $piece['material_styles'][$i] ?? '',
                    'description' => $piece['material_descriptions'][$i] ?? '',
                    'image_path' => $piece['material_image_paths'][$i] ?? ''
                ];
            }
            
            // Add images to each piece
            $pieceImageModel = new PieceImageModel();
            $piece['images'] = $pieceImageModel->getByPiece($piece['piece_id']);
        }
        
        error_log('[PieceModel] Retrieved pieces for product ' . $productId . ': ' . json_encode($pieces));
        return $pieces;
    }

    public function getByManufacturerCodeAndProduct($manufacturerCode, $productId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM pieces 
            WHERE internal_manufacturer_code = :manufacturer_code 
            AND product_id = :product_id 
            AND is_active = 1 
            AND deleted_at IS NULL
        ");
        $stmt->execute([
            ':manufacturer_code' => $manufacturerCode,
            ':product_id' => $productId
        ]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getAll()
    {
        error_log('[PieceModel] getAll() called');
        $stmt = $this->db->prepare("
            SELECT p.*, pr.name AS product_name, m.name AS manufacturer_name
            FROM pieces p
            LEFT JOIN products pr ON p.product_id = pr.product_id
            LEFT JOIN manufacturers m ON pr.manufacturer_id = m.manufacturer_id
            WHERE p.is_active = 1 AND p.deleted_at IS NULL
            ORDER BY p.internal_manufacturer_code ASC
        ");
        $stmt->execute();
        $pieces = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        error_log('[PieceModel] Retrieved all pieces: ' . json_encode($pieces));
        return $pieces;
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare("
            UPDATE pieces 
            SET internal_manufacturer_code = :internal_manufacturer_code,
                ean_code = :ean_code,
                qr_code = :qr_code,
                description = :description,
                updated_at = NOW()
            WHERE piece_id = :piece_id
        ");
        $stmt->execute([
            ':piece_id' => $id,
            ':internal_manufacturer_code' => $data['internal_manufacturer_code'],
            ':ean_code' => $data['ean_code'] ?? null,
            ':qr_code' => $data['qr_code'] ?? null,
            ':description' => $data['description'] ?? null
        ]);
        
        return $this->get($id);
    }

    public function addMaterial($pieceId, $materialId, $materialImageId = null)
    {
        $stmt = $this->db->prepare("
            INSERT INTO material_piece (piece_id, material_id, material_image_id)
            VALUES (:piece_id, :material_id, :material_image_id)
            ON DUPLICATE KEY UPDATE material_image_id = :material_image_id
        ");
        return $stmt->execute([
            ':piece_id' => $pieceId,
            ':material_id' => $materialId,
            ':material_image_id' => $materialImageId
        ]);
    }

    public function removeMaterial($pieceId, $materialId)
    {
        $stmt = $this->db->prepare("
            DELETE FROM material_piece 
            WHERE piece_id = :piece_id AND material_id = :material_id
        ");
        return $stmt->execute([
            ':piece_id' => $pieceId,
            ':material_id' => $materialId
        ]);
    }

    public function getPieceMaterials($pieceId)
    {
        $stmt = $this->db->prepare("
            SELECT m.*, mi.image_path
            FROM material_piece mp
            JOIN material m ON mp.material_id = m.id
            LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                SELECT MIN(mi2.image_id) 
                FROM material_image mi2 
                WHERE mi2.material_id = m.id
            )
            WHERE mp.piece_id = :piece_id AND m.deleted_at IS NULL
            ORDER BY m.name ASC
        ");
        $stmt->execute([':piece_id' => $pieceId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updatePieceMaterials($pieceId, $materialIds)
    {
        // First, remove all existing materials for this piece
        $stmt = $this->db->prepare("DELETE FROM material_piece WHERE piece_id = :piece_id");
        $stmt->execute([':piece_id' => $pieceId]);
        
        // Then add the new materials
        if (!empty($materialIds)) {
            $stmt = $this->db->prepare("
                INSERT INTO material_piece (piece_id, material_id)
                VALUES (:piece_id, :material_id)
            ");
            
            foreach ($materialIds as $materialId) {
                $stmt->execute([
                    ':piece_id' => $pieceId,
                    ':material_id' => $materialId
                ]);
            }
        }
        
        return true;
    }

    public function delete($id)
    {
        error_log('[PieceModel] delete() called with id: ' . $id);
        
        try {
            // Soft delete by setting deleted_at timestamp
            $stmt = $this->db->prepare("
                UPDATE pieces 
                SET deleted_at = NOW(), is_active = 0 
                WHERE piece_id = :piece_id
            ");
            
            $result = $stmt->execute([':piece_id' => $id]);
            error_log('[PieceModel] Delete result: ' . ($result ? 'success' : 'failed'));
            
            return $result;
        } catch (\Exception $e) {
            error_log('[PieceModel] Exception in delete(): ' . $e->getMessage());
            error_log('[PieceModel] Exception trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    public function getDb()
    {
        return $this->db;
    }

    public function getPieceMetadata($pieceId)
    {
        $stmt = $this->db->prepare("
            SELECT piece_metadata_id, key_name, value, is_mandatory, created_at
            FROM piece_metadata 
            WHERE piece_id = :piece_id
            ORDER BY created_at ASC
        ");
        $stmt->execute([':piece_id' => $pieceId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function addPieceMetadata($pieceId, $metadata)
    {
        $stmt = $this->db->prepare("
            INSERT INTO piece_metadata (piece_id, key_name, value, is_mandatory, created_at)
            VALUES (:piece_id, :key_name, :value, :is_mandatory, NOW())
        ");
        $stmt->execute([
            ':piece_id' => $pieceId,
            ':key_name' => $metadata['key_name'],
            ':value' => $metadata['value'] ?? null,
            ':is_mandatory' => isset($metadata['is_mandatory']) ? (int)$metadata['is_mandatory'] : 0
        ]);
        return $this->db->lastInsertId();
    }

    public function clearPieceMetadata($pieceId)
    {
        $stmt = $this->db->prepare("
            DELETE FROM piece_metadata 
            WHERE piece_id = :piece_id
        ");
        $stmt->execute([':piece_id' => $pieceId]);
    }
} 