<?php
namespace App\Models;

use Config\Database;

class ProposalItemPieceMetadataModel {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getByProposalItemPiece($proposalItemPieceId) {
        $stmt = $this->db->prepare("
            SELECT proposal_item_piece_metadata_id, proposal_item_piece_id, key_name, value, is_mandatory, created_at 
            FROM proposal_item_piece_metadata 
            WHERE proposal_item_piece_id = :proposal_item_piece_id
            ORDER BY created_at ASC
        ");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO proposal_item_piece_metadata (proposal_item_piece_id, key_name, value, is_mandatory, created_at)
            VALUES (:proposal_item_piece_id, :key_name, :value, :is_mandatory, NOW())
        ");
        $stmt->execute([
            ':proposal_item_piece_id' => $data['proposal_item_piece_id'],
            ':key_name' => $data['key_name'],
            ':value' => $data['value'] ?? null,
            ':is_mandatory' => $data['is_mandatory'] ?? false
        ]);

        return ['proposal_item_piece_metadata_id' => $this->db->lastInsertId()];
    }

    public function createMultiple($proposalItemPieceId, $metadataArray) {
        $results = [];
        foreach ($metadataArray as $metadata) {
            $metadata['proposal_item_piece_id'] = $proposalItemPieceId;
            $results[] = $this->create($metadata);
        }
        return $results;
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':proposal_item_piece_metadata_id' => $id];

        foreach ($data as $key => $value) {
            if ($key !== 'proposal_item_piece_metadata_id') {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }

        $sql = "UPDATE proposal_item_piece_metadata SET " . implode(', ', $fields) . " WHERE proposal_item_piece_metadata_id = :proposal_item_piece_metadata_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Metadata updated successfully'];
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM proposal_item_piece_metadata WHERE proposal_item_piece_metadata_id = :proposal_item_piece_metadata_id");
        $stmt->execute([':proposal_item_piece_metadata_id' => $id]);
        
        return ['message' => 'Metadata deleted successfully'];
    }

    public function deleteByProposalItemPiece($proposalItemPieceId) {
        $stmt = $this->db->prepare("DELETE FROM proposal_item_piece_metadata WHERE proposal_item_piece_id = :proposal_item_piece_id");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
        
        return ['message' => 'All metadata deleted successfully'];
    }

    public function inheritFromPiece($proposalItemPieceId, $pieceId) {
        // Get piece metadata
        $pieceModel = new \App\Models\PieceModel();
        $pieceMetadata = $pieceModel->getPieceMetadata($pieceId);
        
        // Copy each metadata item to proposal item piece
        foreach ($pieceMetadata as $metadata) {
            $this->create([
                'proposal_item_piece_id' => $proposalItemPieceId,
                'key_name' => $metadata['key_name'],
                'value' => $metadata['value'], // Copy default value
                'is_mandatory' => $metadata['is_mandatory']
            ]);
        }
        
        return count($pieceMetadata);
    }
}
?> 