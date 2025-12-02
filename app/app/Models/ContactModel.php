<?php
namespace App\Models;

use Config\Database;

class ContactModel {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAll() {
        $stmt = $this->db->query("
            SELECT c.contact_detail_id, c.person_id, c.type, c.detail, p.first_name, p.last_name, c.is_active
            FROM contact_details c
            JOIN persons p ON c.person_id = p.person_id
            WHERE c.is_active = 1
        ");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->db->prepare("
            INSERT INTO contact_details (person_id, type, detail, created_at)
            VALUES (:person_id, :type, :detail, NOW())
        ");
        $stmt->execute([
            ':person_id' => $data['person_id'],
            ':type' => $data['type'],
            ':detail' => $data['detail']
        ]);

        return ['contact_detail_id' => $this->db->lastInsertId()];
    }

    public function update($id, $data) {
        $fields = [];
        $params = [':contact_detail_id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }

        $sql = "UPDATE contact_details SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE contact_detail_id = :contact_detail_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return ['message' => 'Contact updated successfully'];
    }

    public function delete($id) {
        $stmt = $this->db->prepare("UPDATE contact_details SET is_active = 0 WHERE contact_detail_id = :contact_detail_id");
        $stmt->execute([':contact_detail_id' => $id]);
    }
}
?>
