<?php

namespace App\Models;

use Config\Database;

class DeliveryModel
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

    public function createDelivery($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO deliveries (vehicle_id, driver_id, planned_date, status, created_at)
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

    public function addDeliveryItem($deliveryId, $item)
    {
        $stmt = $this->db->prepare("
            INSERT INTO delivery_items (delivery_id, piece_id, planned_quantity, actual_quantity, created_at)
            VALUES (:delivery_id, :piece_id, :planned_quantity, :actual_quantity, NOW())
        ");
        $stmt->execute([
            ':delivery_id' => $deliveryId,
            ':piece_id' => $item['piece_id'],
            ':planned_quantity' => $item['planned_quantity'],
            ':actual_quantity' => $item['actual_quantity'] ?? 0
        ]);
    }

    public function getDelivery($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM deliveries WHERE delivery_id = :delivery_id");
        $stmt->execute([':delivery_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getDeliveryItems($deliveryId)
    {
        $stmt = $this->db->prepare("SELECT * FROM delivery_items WHERE delivery_id = :delivery_id");
        $stmt->execute([':delivery_id' => $deliveryId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updateDelivery($id, $data)
    {
        $stmt = $this->db->prepare("
            UPDATE deliveries SET status = :status, updated_at = NOW()
            WHERE delivery_id = :delivery_id
        ");
        $stmt->execute([
            ':delivery_id' => $id,
            ':status' => $data['status'] ?? 'In Progress'
        ]);

        return ['message' => 'Delivery updated successfully'];
    }
}
