<?php

namespace App\Models;

use Config\Database;

class ProductImageModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getByProduct($productId)
    {
        $stmt = $this->db->prepare("
            SELECT product_image_id, image_url, is_primary, uploaded_at
            FROM product_images 
            WHERE product_id = :product_id AND is_active = 1 AND deleted_at IS NULL
        ");
        $stmt->execute([':product_id' => $productId]);
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        error_log("getByProduct for product $productId returned: " . json_encode($result));
        return $result;
    }

    public function create($data)
    {
        // If this image is being set as primary, first unset any existing primary images
        if (isset($data['is_primary']) && $data['is_primary']) {
            $stmt = $this->db->prepare("
                UPDATE product_images 
                SET is_primary = 0
                WHERE product_id = :product_id
            ");
            $stmt->execute([':product_id' => $data['product_id']]);
        }

        $stmt = $this->db->prepare("
            INSERT INTO product_images (product_id, image_url, is_primary, uploaded_at)
            VALUES (:product_id, :image_url, :is_primary, NOW())
        ");
        $stmt->execute([
            ':product_id' => $data['product_id'],
            ':image_url' => $data['image_url'],
            ':is_primary' => (isset($data['is_primary']) && $data['is_primary']) ? 1 : 0
        ]);

        return ['product_image_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':product_image_id' => $id];

        foreach ($data as $key => $value) {
            if ($key === 'is_primary') {
                $value = $value ? 1 : 0;
            }
            if (in_array($key, ['image_url', 'is_primary'])) {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }

        if (empty($fields)) {
            return ['message' => 'No valid fields to update'];
        }

        $sql = "UPDATE product_images SET " . implode(', ', $fields) . " WHERE product_image_id = :product_image_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Product image updated successfully'];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("UPDATE product_images SET is_active = 0, deleted_at = NOW() WHERE product_image_id = :product_image_id");
        $stmt->execute([':product_image_id' => $id]);
    }

    public function setPrimary($productId, $imageId)
    {
        // First, set all images for this product as non-primary
        $stmt = $this->db->prepare("
            UPDATE product_images 
            SET is_primary = 0
            WHERE product_id = :product_id
        ");
        $stmt->execute([':product_id' => $productId]);

        // Then set the specified image as primary
        $stmt = $this->db->prepare("
            UPDATE product_images 
            SET is_primary = 1
            WHERE product_image_id = :product_image_id
        ");
        $stmt->execute([':product_image_id' => $imageId]);

        return ['message' => 'Primary image updated successfully'];
    }

    public function unsetPrimary($productId)
    {
        error_log("Unsetting primary images for product: $productId");
        
        // Set all images for this product as non-primary
        $stmt = $this->db->prepare("
            UPDATE product_images 
            SET is_primary = 0
            WHERE product_id = :product_id
        ");
        $stmt->execute([':product_id' => $productId]);
        
        $affectedRows = $stmt->rowCount();
        error_log("Updated $affectedRows rows for product $productId");

        return ['message' => 'Primary image unset successfully'];
    }
} 