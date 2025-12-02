<?php

namespace App\Models;

use Config\Database;

class FinancialDocumentModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getDb()
    {
        return $this->db;
    }
} 