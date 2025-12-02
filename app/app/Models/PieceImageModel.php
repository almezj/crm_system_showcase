<?php

namespace App\Models;

use Config\Database;

class PieceImageModel {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getByPiece($pieceId) {
        $stmt = $this->db->prepare("
            SELECT * FROM piece_images 
            WHERE piece_id = :piece_id 
            ORDER BY sort_order ASC, created_at ASC
        ");
        $stmt->execute([':piece_id' => $pieceId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function add($pieceId, $imageUrl, $description = null, $isPrimary = false) {
        // If this is the first image, make it primary
        if ($isPrimary) {
            $this->clearPrimary($pieceId);
        }

        $stmt = $this->db->prepare("
            INSERT INTO piece_images (piece_id, image_url, description, is_primary, sort_order, created_at)
            VALUES (:piece_id, :image_url, :description, :is_primary, :sort_order, NOW())
        ");
        
        $stmt->execute([
            ':piece_id' => $pieceId,
            ':image_url' => $imageUrl,
            ':description' => $description,
            ':is_primary' => $isPrimary ? 1 : 0,
            ':sort_order' => $this->getNextSortOrder($pieceId)
        ]);
        
        return $this->db->lastInsertId();
    }

    public function update($imageId, $data) {
        $fields = [];
        $params = [':image_id' => $imageId];
        
        if (isset($data['description'])) {
            $fields[] = 'description = :description';
            $params[':description'] = $data['description'];
        }
        
        if (isset($data['is_primary'])) {
            if ($data['is_primary']) {
                // Clear other primary images for this piece
                $this->clearPrimaryByImageId($imageId);
            }
            $fields[] = 'is_primary = :is_primary';
            $params[':is_primary'] = $data['is_primary'] ? 1 : 0;
        }
        
        if (isset($data['sort_order'])) {
            $fields[] = 'sort_order = :sort_order';
            $params[':sort_order'] = $data['sort_order'];
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $stmt = $this->db->prepare("
            UPDATE piece_images 
            SET " . implode(', ', $fields) . "
            WHERE piece_image_id = :image_id
        ");
        
        return $stmt->execute($params);
    }

    public function delete($imageId) {
        $stmt = $this->db->prepare("DELETE FROM piece_images WHERE piece_image_id = :image_id");
        return $stmt->execute([':image_id' => $imageId]);
    }

    public function reorder($pieceId, $imageOrder) {
        $this->db->beginTransaction();
        
        try {
            foreach ($imageOrder as $index => $imageId) {
                $stmt = $this->db->prepare("
                    UPDATE piece_images 
                    SET sort_order = :sort_order 
                    WHERE piece_image_id = :image_id AND piece_id = :piece_id
                ");
                $stmt->execute([
                    ':sort_order' => $index,
                    ':image_id' => $imageId,
                    ':piece_id' => $pieceId
                ]);
            }
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getPrimary($pieceId) {
        $stmt = $this->db->prepare("
            SELECT * FROM piece_images 
            WHERE piece_id = :piece_id AND is_primary = 1
            LIMIT 1
        ");
        $stmt->execute([':piece_id' => $pieceId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    private function clearPrimary($pieceId) {
        $stmt = $this->db->prepare("
            UPDATE piece_images 
            SET is_primary = 0 
            WHERE piece_id = :piece_id
        ");
        $stmt->execute([':piece_id' => $pieceId]);
    }

    private function clearPrimaryByImageId($imageId) {
        // Get the piece_id for this image
        $stmt = $this->db->prepare("SELECT piece_id FROM piece_images WHERE piece_image_id = :image_id");
        $stmt->execute([':image_id' => $imageId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($result) {
            $this->clearPrimary($result['piece_id']);
        }
    }

    private function getNextSortOrder($pieceId) {
        $stmt = $this->db->prepare("
            SELECT MAX(sort_order) as max_order 
            FROM piece_images 
            WHERE piece_id = :piece_id
        ");
        $stmt->execute([':piece_id' => $pieceId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        return ($result['max_order'] ?? -1) + 1;
    }
} 