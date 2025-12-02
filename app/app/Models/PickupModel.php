<?php

namespace App\Models;

use Config\Database;

class PickupModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function createPickup($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO pickups (vehicle_id, driver_id, planned_date, status, created_at)
            VALUES (:vehicle_id, :driver_id, :planned_date, :status, NOW())
        ");
        $stmt->execute([
            ':vehicle_id' => $data['vehicle_id'],
            ':driver_id' => $data['driver_id'] ?? null,
            ':planned_date' => $data['planned_date'] ?? date('Y-m-d'),
            ':status' => 'Planned'
        ]);

        return $this->db->lastInsertId();
    }

    public function addPickupItem($pickupId, $item)
    {
        $stmt = $this->db->prepare("
            INSERT INTO pickup_items (pickup_id, piece_id, planned_quantity, actual_quantity, created_at)
            VALUES (:pickup_id, :piece_id, :planned_quantity, :actual_quantity, NOW())
        ");
        $stmt->execute([
            ':pickup_id' => $pickupId,
            ':piece_id' => $item['piece_id'],
            ':planned_quantity' => $item['planned_quantity'],
            ':actual_quantity' => $item['actual_quantity'] ?? 0
        ]);
    }

    public function getPickup($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM pickups WHERE pickup_id = :pickup_id");
        $stmt->execute([':pickup_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getPickupItems($pickupId)
    {
        $stmt = $this->db->prepare("SELECT * FROM pickup_items WHERE pickup_id = :pickup_id");
        $stmt->execute([':pickup_id' => $pickupId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updatePickup($id, $data)
    {
        $stmt = $this->db->prepare("
            UPDATE pickups SET status = :status, updated_at = NOW()
            WHERE pickup_id = :pickup_id
        ");
        $stmt->execute([
            ':pickup_id' => $id,
            ':status' => $data['status'] ?? 'In Progress'
        ]);

        return ['message' => 'Pickup updated successfully'];
    }
}
