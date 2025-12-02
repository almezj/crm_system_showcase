<?php

namespace App\Models;

use Config\Database;

class StopItemsModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function addStopItem($routeStopId, $data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO stop_items (route_stop_id, piece_id, action, planned_quantity, comments, created_at)
            VALUES (:route_stop_id, :piece_id, :action, :planned_quantity, :comments, NOW())
        ");
        $stmt->execute([
            ':route_stop_id' => $routeStopId,
            ':piece_id' => $data['piece_id'],
            ':action' => $data['action'],
            ':planned_quantity' => $data['planned_quantity'] ?? 1,
            ':comments' => $data['comments'] ?? null
        ]);

        return ['stop_item_id' => $this->db->lastInsertId()];
    }

    public function getStopItemsByStop($routeStopId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM stop_items WHERE route_stop_id = :route_stop_id
        ");
        $stmt->execute([':route_stop_id' => $routeStopId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updateStopItem($id, $data)
    {
        $stmt = $this->db->prepare("
            UPDATE stop_items
            SET actual_quantity = :actual_quantity, scanned_at = :scanned_at, comments = :comments, updated_at = NOW()
            WHERE stop_item_id = :stop_item_id
        ");
        $stmt->execute([
            ':stop_item_id' => $id,
            ':actual_quantity' => $data['actual_quantity'] ?? 0,
            ':scanned_at' => $data['scanned_at'] ?? null,
            ':comments' => $data['comments'] ?? null
        ]);

        return ['message' => 'Stop item updated successfully'];
    }
}
