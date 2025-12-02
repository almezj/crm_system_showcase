<?php

namespace App\Models;

use Config\Database;

class ProductTranslationModel
{
    private $db;
    private $editableFields = [
        'product_id',
        'web_id',
        'language_id',
        'name',
        'description',
        'base_price',
        'is_active'
    ];

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getTranslations($productId)
    {
        $stmt = $this->db->prepare("
            SELECT pt.*, l.name as language_name, l.code as language_code, l.currency_code, l.currency_symbol
            FROM product_translations pt
            LEFT JOIN languages l ON pt.language_id = l.language_id
            WHERE pt.product_id = :product_id AND pt.is_active = 1 AND pt.deleted_at IS NULL
        ");
        $stmt->execute([':product_id' => $productId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        \App\Utils\Logger::debug("ProductTranslationModel::create - Creating translation with data: " . json_encode($data));
        
        $stmt = $this->db->prepare("
            INSERT INTO product_translations (product_id, web_id, language_id, name, description, base_price, is_active, created_at)
            VALUES (:product_id, :web_id, :language_id, :name, :description, :base_price, 1, NOW())
        ");
        
        $params = [
            ':product_id' => $data['product_id'],
            ':web_id' => $data['web_id'] ?? 0,
            ':language_id' => $data['language_id'],
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':base_price' => $data['base_price'] ?? 0
        ];
        
        \App\Utils\Logger::debug("ProductTranslationModel::create - Executing with params: " . json_encode($params));
        
        try {
            $stmt->execute($params);
            $result = ['translation_id' => $this->db->lastInsertId()];
            \App\Utils\Logger::debug("ProductTranslationModel::create - Translation created successfully: " . json_encode($result));
            return $result;
        } catch (\Exception $e) {
            \App\Utils\Logger::error("ProductTranslationModel::create - Error creating translation: " . $e->getMessage());
            throw $e;
        }
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':translation_id' => $id];
        foreach ($data as $key => $value) {
            if (in_array($key, $this->editableFields)) {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }
        if (empty($fields)) {
            return ['message' => 'No valid fields to update'];
        }
        $sql = "UPDATE product_translations SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE translation_id = :translation_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return ['message' => 'Translation updated successfully'];
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("
            UPDATE product_translations
            SET deleted_at = NOW(), is_active = 0
            WHERE translation_id = :translation_id
        ");
        $stmt->execute([':translation_id' => $id]);
    }
} 