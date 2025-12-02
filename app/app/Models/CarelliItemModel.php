<?php

namespace App\Models;

use Config\Database;

class CarelliItemModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getStoreConnection();
    }

    public function searchItems($query, $limit = 50)
    {
        $stmt = $this->db->prepare("
            SELECT 
                i.item_id,
                i.title,
                i.code,
                i.description,
                i.text,
                i.price,
                i.price_initial,
                i.published,
                i.language_id,
                c.title as category_name,
                sc.title as subcategory_name
            FROM item i
            LEFT JOIN category c ON i.category_id = c.category_id
            LEFT JOIN subcategory sc ON i.subcategory_id = sc.subcategory_id
            WHERE i.published = 1 
            AND (i.title LIKE :query OR i.code LIKE :query OR i.description LIKE :query)
            ORDER BY i.rank DESC, i.title ASC
            LIMIT :limit
        ");
        
        $searchQuery = "%{$query}%";
        $stmt->bindParam(':query', $searchQuery, \PDO::PARAM_STR);
        $stmt->bindParam(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getItem($itemId)
    {
        $stmt = $this->db->prepare("
            SELECT 
                i.item_id,
                i.title,
                i.code,
                i.description,
                i.text,
                i.price,
                i.price_initial,
                i.published,
                i.language_id,
                i.ean,
                i.keywords,
                i.merchant,
                i.url,
                c.title as category_name,
                sc.title as subcategory_name,
                GROUP_CONCAT(DISTINCT img.title) as image_titles
            FROM item i
            LEFT JOIN category c ON i.category_id = c.category_id
            LEFT JOIN subcategory sc ON i.subcategory_id = sc.subcategory_id
            LEFT JOIN item_img img ON i.item_id = img.gallery_id
            WHERE i.item_id = :item_id AND i.published = 1
            GROUP BY i.item_id
        ");
        
        $stmt->execute([':item_id' => $itemId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getItemsByCategory($categoryId, $limit = 100)
    {
        $stmt = $this->db->prepare("
            SELECT 
                i.item_id,
                i.title,
                i.code,
                i.description,
                i.price,
                i.price_initial,
                i.published,
                i.language_id
            FROM item i
            WHERE i.category_id = :category_id AND i.published = 1
            ORDER BY i.rank DESC, i.title ASC
            LIMIT :limit
        ");
        
        $stmt->bindParam(':category_id', $categoryId, \PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getCategories()
    {
        $stmt = $this->db->prepare("
            SELECT 
                c.category_id,
                c.title,
                c.description,
                COUNT(i.item_id) as item_count
            FROM category c
            LEFT JOIN item i ON c.category_id = i.category_id AND i.published = 1
            WHERE c.rank > 0
            GROUP BY c.category_id
            ORDER BY c.rank ASC, c.title ASC
        ");
        
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getSubcategories($categoryId)
    {
        $stmt = $this->db->prepare("
            SELECT 
                sc.subcategory_id,
                sc.title,
                sc.description,
                COUNT(i.item_id) as item_count
            FROM subcategory sc
            LEFT JOIN item i ON sc.subcategory_id = i.subcategory_id AND i.published = 1
            WHERE sc.category_id = :category_id
            GROUP BY sc.subcategory_id
            ORDER BY sc.rank ASC, sc.title ASC
        ");
        
        $stmt->execute([':category_id' => $categoryId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function validateItemExists($itemId)
    {
        $stmt = $this->db->prepare("
            SELECT item_id, title, code, language_id 
            FROM item 
            WHERE item_id = :item_id AND published = 1
        ");
        
        $stmt->execute([':item_id' => $itemId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
