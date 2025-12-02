<?php

namespace App\Models;

use Config\Database;

class ProposalItemPieceImageModel {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getByProposalItemPiece($proposalItemPieceId) {
        $stmt = $this->db->prepare("
            SELECT * FROM proposal_item_piece_images 
            WHERE proposal_item_piece_id = :proposal_item_piece_id 
            ORDER BY sort_order ASC, created_at ASC
        ");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function add($proposalItemPieceId, $imageUrl, $description = null, $isPrimary = false) {
        // If this is the first image, make it primary
        if ($isPrimary) {
            $this->clearPrimary($proposalItemPieceId);
        }

        $stmt = $this->db->prepare("
            INSERT INTO proposal_item_piece_images (proposal_item_piece_id, image_url, description, is_primary, sort_order, created_at)
            VALUES (:proposal_item_piece_id, :image_url, :description, :is_primary, :sort_order, NOW())
        ");
        
        $stmt->execute([
            ':proposal_item_piece_id' => $proposalItemPieceId,
            ':image_url' => $imageUrl,
            ':description' => $description,
            ':is_primary' => $isPrimary ? 1 : 0,
            ':sort_order' => $this->getNextSortOrder($proposalItemPieceId)
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
                // Clear other primary images for this proposal item piece
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
            UPDATE proposal_item_piece_images 
            SET " . implode(', ', $fields) . "
            WHERE piece_image_id = :image_id
        ");
        
        return $stmt->execute($params);
    }

    public function delete($imageId) {
        $stmt = $this->db->prepare("DELETE FROM proposal_item_piece_images WHERE piece_image_id = :image_id");
        return $stmt->execute([':image_id' => $imageId]);
    }

    public function reorder($proposalItemPieceId, $imageOrder) {
        $this->db->beginTransaction();
        
        try {
            foreach ($imageOrder as $index => $imageId) {
                $stmt = $this->db->prepare("
                    UPDATE proposal_item_piece_images 
                    SET sort_order = :sort_order 
                    WHERE piece_image_id = :image_id AND proposal_item_piece_id = :proposal_item_piece_id
                ");
                $stmt->execute([
                    ':sort_order' => $index,
                    ':image_id' => $imageId,
                    ':proposal_item_piece_id' => $proposalItemPieceId
                ]);
            }
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getPrimary($proposalItemPieceId) {
        $stmt = $this->db->prepare("
            SELECT * FROM proposal_item_piece_images 
            WHERE proposal_item_piece_id = :proposal_item_piece_id AND is_primary = 1
            LIMIT 1
        ");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    private function clearPrimary($proposalItemPieceId) {
        $stmt = $this->db->prepare("
            UPDATE proposal_item_piece_images 
            SET is_primary = 0 
            WHERE proposal_item_piece_id = :proposal_item_piece_id
        ");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
    }

    private function clearPrimaryByImageId($imageId) {
        // Get the proposal_item_piece_id for this image
        $stmt = $this->db->prepare("SELECT proposal_item_piece_id FROM proposal_item_piece_images WHERE piece_image_id = :image_id");
        $stmt->execute([':image_id' => $imageId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($result) {
            $this->clearPrimary($result['proposal_item_piece_id']);
        }
    }

    private function getNextSortOrder($proposalItemPieceId) {
        $stmt = $this->db->prepare("
            SELECT MAX(sort_order) as max_order 
            FROM proposal_item_piece_images 
            WHERE proposal_item_piece_id = :proposal_item_piece_id
        ");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        return ($result['max_order'] ?? -1) + 1;
    }
} 