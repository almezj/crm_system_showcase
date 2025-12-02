<?php

namespace App\Models;

use Config\Database;

class LanguageModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->prepare("
            SELECT language_id, code, name, currency_code, currency_symbol, vat_rate, is_active
            FROM languages 
            WHERE is_active = 1
            ORDER BY name ASC
        ");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function get($id)
    {
        $stmt = $this->db->prepare("
            SELECT language_id, code, name, currency_code, currency_symbol, vat_rate, is_active
            FROM languages 
            WHERE language_id = :language_id AND is_active = 1
        ");
        $stmt->execute([':language_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getByCode($code)
    {
        $stmt = $this->db->prepare("
            SELECT language_id, code, name, currency_code, currency_symbol, vat_rate, is_active
            FROM languages 
            WHERE code = :code AND is_active = 1
        ");
        $stmt->execute([':code' => $code]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
} 