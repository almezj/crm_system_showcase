<?php

namespace App\Models;

use Config\Database;

class ProductModel
{
    private $db;
    private $editableFields = [
        'name',
        'description',
        'base_price',
        'manufacturer_id',
        'webshop_item_id',
        'is_customizable',
        'is_active'
    ];

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll($showDeleted = false, $page = 1, $limit = 10)
    {
        // Calculate offset
        $offset = ($page - 1) * $limit;
        
        $sql = "
            SELECT p.product_id, p.name, p.description, p.base_price, p.is_customizable, p.is_active, 
                   m.name AS manufacturer_name,
                   pi.image_url AS primary_image_url,
                   GROUP_CONCAT(DISTINCT l.code ORDER BY l.code ASC SEPARATOR ', ') as language_codes
            FROM products p
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
            LEFT JOIN product_images pi ON pi.product_id = p.product_id AND pi.is_primary = 1 AND pi.is_active = 1 AND pi.deleted_at IS NULL
            LEFT JOIN product_translations pt ON pt.product_id = p.product_id AND pt.is_active = 1 AND pt.deleted_at IS NULL
            LEFT JOIN languages l ON pt.language_id = l.language_id
            WHERE 1=1
        ";

        if (!$showDeleted) {
            $sql .= " AND p.deleted_at IS NULL AND p.is_active = 1";
        }

        $sql .= " GROUP BY p.product_id, p.name, p.description, p.base_price, p.is_customizable, p.is_active, m.name, pi.image_url";
        $sql .= " ORDER BY p.created_at DESC";
        $sql .= " LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, \PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Get total count for pagination
        $countSql = "
            SELECT COUNT(DISTINCT p.product_id) as total
            FROM products p
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
            LEFT JOIN product_images pi ON pi.product_id = p.product_id AND pi.is_primary = 1 AND pi.is_active = 1 AND pi.deleted_at IS NULL
            LEFT JOIN product_translations pt ON pt.product_id = p.product_id AND pt.is_active = 1 AND pt.deleted_at IS NULL
            LEFT JOIN languages l ON pt.language_id = l.language_id
            WHERE 1=1
        ";
        
        if (!$showDeleted) {
            $countSql .= " AND p.deleted_at IS NULL AND p.is_active = 1";
        }
        
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute();
        $totalCount = $countStmt->fetch(\PDO::FETCH_ASSOC)['total'];
        
        return [
            'products' => $result,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$totalCount,
                'total_pages' => (int)ceil($totalCount / $limit)
            ]
        ];
    }

    public function get($id)
    {
        $stmt = $this->db->prepare("
            SELECT p.*, m.name AS manufacturer_name, pi.image_url AS primary_image_url,
                   l.currency_symbol, l.currency_code
            FROM products p
            LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
            LEFT JOIN product_images pi ON pi.product_id = p.product_id AND pi.is_primary = 1 AND pi.is_active = 1 AND pi.deleted_at IS NULL
            LEFT JOIN product_translations pt ON pt.product_id = p.product_id AND pt.is_active = 1 AND pt.deleted_at IS NULL
            LEFT JOIN languages l ON pt.language_id = l.language_id
            WHERE p.product_id = :product_id AND p.deleted_at is null
            LIMIT 1
        ");
        $stmt->execute([':product_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO products (name, description, base_price, manufacturer_id, is_customizable, created_at)
            VALUES (:name, :description, :base_price, :manufacturer_id, :is_customizable, NOW())
        ");
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':base_price' => !empty($data['base_price']) ? (float)$data['base_price'] : 0,
            ':manufacturer_id' => $data['manufacturer_id'],
            ':is_customizable' => isset($data['is_customizable']) ? (int)$data['is_customizable'] : 0
        ]);

        return ['product_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':product_id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $this->editableFields)) {
                $fields[] = "$key = :$key";
                // Handle base_price specifically to ensure it's a valid decimal
                if ($key === 'base_price') {
                    $params[":$key"] = !empty($value) ? (float)$value : 0;
                } else {
                    $params[":$key"] = $value;
                }
            }
        }

        if (empty($fields)) {
            return ['message' => 'No valid fields to update'];
        }

        $sql = "UPDATE products SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE product_id = :product_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Product updated successfully'];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("UPDATE products SET is_active = 0, deleted_at = NOW() WHERE product_id = :product_id");
        $stmt->execute([':product_id' => $id]);
    }

    public function getProductPieces($productId)
    {
        $stmt = $this->db->prepare("
            SELECT p.*, m.name as material_name, m.code as material_code, m.color as material_color, 
                   m.type as material_type, m.style as material_style, m.description as material_description,
                   mi.image_path as material_image_path
            FROM pieces p
            LEFT JOIN material_piece mp ON p.piece_id = mp.piece_id
            LEFT JOIN material m ON mp.material_id = m.id
            LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                SELECT MIN(mi2.image_id) 
                FROM material_image mi2 
                WHERE mi2.material_id = m.id
            )
            WHERE p.product_id = :product_id AND p.is_active = 1
            ORDER BY p.piece_id ASC
        ");
        $stmt->execute([':product_id' => $productId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getDb()
    {
        return $this->db;
    }

    public function getProductMetadata($productId)
    {
        $stmt = $this->db->prepare("
            SELECT metadata_id, key_name, value, is_mandatory, created_at, updated_at
            FROM product_metadata 
            WHERE product_id = :product_id AND is_active = 1 AND deleted_at IS NULL
            ORDER BY created_at ASC
        ");
        $stmt->execute([':product_id' => $productId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function addProductMetadata($productId, $metadata)
    {
        $stmt = $this->db->prepare("
            INSERT INTO product_metadata (product_id, key_name, value, is_mandatory, created_at)
            VALUES (:product_id, :key_name, :value, :is_mandatory, NOW())
        ");
        $stmt->execute([
            ':product_id' => $productId,
            ':key_name' => $metadata['key_name'],
            ':value' => $metadata['value'] ?? null,
            ':is_mandatory' => isset($metadata['is_mandatory']) ? (int)$metadata['is_mandatory'] : 0
        ]);
        return $this->db->lastInsertId();
    }

    public function clearProductMetadata($productId)
    {
        $stmt = $this->db->prepare("
            UPDATE product_metadata 
            SET is_active = 0, deleted_at = NOW() 
            WHERE product_id = :product_id
        ");
        $stmt->execute([':product_id' => $productId]);
    }

    public function searchProducts($searchQuery, $limit = 20)
    {
        try {
            // Check if database connection is available
            if (!$this->db) {
                \App\Utils\Logger::error("ProductModel::searchProducts - Database connection is null");
                return [];
            }

            $sql = "
                SELECT p.product_id, p.name, p.description, p.base_price, p.is_customizable, p.is_active, 
                       m.name AS manufacturer_name,
                       pi.image_url AS primary_image_url,
                       GROUP_CONCAT(DISTINCT l.code ORDER BY l.code ASC SEPARATOR ', ') as language_codes
                FROM products p
                LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
                LEFT JOIN product_images pi ON pi.product_id = p.product_id AND pi.is_primary = 1 AND pi.is_active = 1 AND pi.deleted_at IS NULL
                LEFT JOIN product_translations pt ON pt.product_id = p.product_id AND pt.is_active = 1 AND pt.deleted_at IS NULL
                LEFT JOIN languages l ON pt.language_id = l.language_id
                WHERE p.deleted_at IS NULL AND p.is_active = 1
                AND (p.name LIKE :search_query OR p.description LIKE :search_query)
                GROUP BY p.product_id, p.name, p.description, p.base_price, p.is_customizable, p.is_active, m.name, pi.image_url
                ORDER BY 
                    CASE 
                        WHEN p.name LIKE :exact_match THEN 1
                        WHEN p.name LIKE :starts_with THEN 2
                        WHEN p.name LIKE :contains THEN 3
                        ELSE 4
                    END,
                    p.name ASC
                LIMIT :limit
            ";

            $stmt = $this->db->prepare($sql);
            $searchParam = '%' . $searchQuery . '%';
            $exactMatch = $searchQuery;
            $startsWith = $searchQuery . '%';
            $contains = '%' . $searchQuery . '%';
            
            $stmt->bindValue(':search_query', $searchParam, \PDO::PARAM_STR);
            $stmt->bindValue(':exact_match', $exactMatch, \PDO::PARAM_STR);
            $stmt->bindValue(':starts_with', $startsWith, \PDO::PARAM_STR);
            $stmt->bindValue(':contains', $contains, \PDO::PARAM_STR);
            $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            \App\Utils\Logger::error("ProductModel::searchProducts - Error: " . $e->getMessage());
            return [];
        }
    }
}
