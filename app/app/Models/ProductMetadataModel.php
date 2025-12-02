<?php
namespace App\Models;

use Config\Database;

class ProductMetadataModel {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getByProduct($productId) {
        $stmt = $this->db->prepare("
            SELECT metadata_id, key_name, value, is_mandatory, is_active 
            FROM product_metadata 
            WHERE product_id = :product_id AND is_active = 1
        ");
        $stmt->execute([':product_id' => $productId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO product_metadata (product_id, key_name, value, is_mandatory, created_at)
            VALUES (:product_id, :key_name, :value, :is_mandatory, NOW())
        ");
        $stmt->execute([
            ':product_id' => $data['product_id'],
            ':key_name' => $data['key_name'],
            ':value' => $data['value'] ?? null,
            ':is_mandatory' => $data['is_mandatory'] ?? false
        ]);

        return ['metadata_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':metadata_id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }

        $sql = "UPDATE product_metadata SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE metadata_id = :metadata_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Metadata updated successfully'];
    }

    public function delete($id) {
        $stmt = $this->db->prepare("UPDATE product_metadata SET is_active = 0 WHERE metadata_id = :metadata_id");
        $stmt->execute([':metadata_id' => $id]);
    }
}
?>
