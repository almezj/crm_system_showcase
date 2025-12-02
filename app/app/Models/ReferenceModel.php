<?php
namespace App\Models;

use Config\Database;

class ReferenceModel {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAll($table) {
        $stmt = $this->db->prepare("SELECT * FROM $table");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
?>
