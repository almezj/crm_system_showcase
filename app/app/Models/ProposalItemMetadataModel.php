<?php
namespace App\Models;

use Config\Database;

class ProposalItemMetadataModel {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getByProposalItem($proposalItemId) {
        $stmt = $this->db->prepare("
            SELECT proposal_item_metadata_id, proposal_item_id, key_name, value, created_at 
            FROM proposal_item_metadata 
            WHERE proposal_item_id = :proposal_item_id
            ORDER BY created_at ASC
        ");
        $stmt->execute([':proposal_item_id' => $proposalItemId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO proposal_item_metadata (proposal_item_id, key_name, value, created_at)
            VALUES (:proposal_item_id, :key_name, :value, NOW())
        ");
        $stmt->execute([
            ':proposal_item_id' => $data['proposal_item_id'],
            ':key_name' => $data['key_name'],
            ':value' => $data['value'] ?? null
        ]);

        return ['proposal_item_metadata_id' => $this->db->lastInsertId()];
    }

    public function createMultiple($proposalItemId, $metadataArray) {
        $results = [];
        foreach ($metadataArray as $metadata) {
            $metadata['proposal_item_id'] = $proposalItemId;
            $results[] = $this->create($metadata);
        }
        return $results;
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':proposal_item_metadata_id' => $id];

        foreach ($data as $key => $value) {
            if ($key !== 'proposal_item_metadata_id') {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }

        $sql = "UPDATE proposal_item_metadata SET " . implode(', ', $fields) . " WHERE proposal_item_metadata_id = :proposal_item_metadata_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Metadata updated successfully'];
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM proposal_item_metadata WHERE proposal_item_metadata_id = :proposal_item_metadata_id");
        $stmt->execute([':proposal_item_metadata_id' => $id]);
        
        return ['message' => 'Metadata deleted successfully'];
    }

    public function deleteByProposalItem($proposalItemId) {
        $stmt = $this->db->prepare("DELETE FROM proposal_item_metadata WHERE proposal_item_id = :proposal_item_id");
        $stmt->execute([':proposal_item_id' => $proposalItemId]);
        
        return ['message' => 'All metadata deleted successfully'];
    }



    public function inheritFromProduct($proposalItemId, $productId) {
        // Get product metadata
        $productModel = new \App\Models\ProductModel();
        $productMetadata = $productModel->getProductMetadata($productId);
        
        // Copy each metadata item to proposal item
        foreach ($productMetadata as $metadata) {
            $this->create([
                'proposal_item_id' => $proposalItemId,
                'key_name' => $metadata['key_name'],
                'value' => $metadata['value'] // Copy default value
            ]);
        }
        
        return count($productMetadata);
    }
}
?>