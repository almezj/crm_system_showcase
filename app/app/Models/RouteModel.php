<?php

namespace App\Models;

use Config\Database;

class RouteModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // Create a new route
    public function createRoute($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO routes (vehicle_id, driver_id, planned_date, status, created_at)
            VALUES (:vehicle_id, :driver_id, :planned_date, :status, NOW())
        ");
        $stmt->execute([
            ':vehicle_id' => $data['vehicle_id'],
            ':driver_id' => $data['driver_id'],
            ':planned_date' => $data['planned_date'] ?? date('Y-m-d'),
            ':status' => 'Planned'
        ]);

        return $this->db->lastInsertId();
    }

    // Add a stop to a route
    public function addRouteStop($routeId, $stop)
    {
        $stmt = $this->db->prepare("
            INSERT INTO route_stops (route_id, sequence_number, stop_type, location_id, planned_time, description, created_at)
            VALUES (:route_id, :sequence_number, :stop_type, :location_id, :planned_time, :description, NOW())
        ");
        $stmt->execute([
            ':route_id' => $routeId,
            ':sequence_number' => $stop['sequence_number'],
            ':stop_type' => $stop['stop_type'],
            ':location_id' => $stop['location_id'],
            ':planned_time' => $stop['planned_time'],
            ':description' => $stop['description'] ?? null
        ]);
    }

    // Fetch route details
    public function getRoute($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM routes WHERE route_id = :route_id");
        $stmt->execute([':route_id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    // Fetch all stops for a route
    public function getRouteStops($routeId)
    {
        $stmt = $this->db->prepare("SELECT * FROM route_stops WHERE route_id = :route_id ORDER BY sequence_number");
        $stmt->execute([':route_id' => $routeId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // Update route details (e.g., status)
    public function updateRoute($id, $data)
    {
        $stmt = $this->db->prepare("
            UPDATE routes SET status = :status, updated_at = NOW()
            WHERE route_id = :route_id
        ");
        $stmt->execute([
            ':route_id' => $id,
            ':status' => $data['status'] ?? 'In Progress'
        ]);

        return ['message' => 'Route updated successfully'];
    }

    // Add an item to a stop
    public function addStopItem($routeStopId, $item)
    {
        $stmt = $this->db->prepare("
            INSERT INTO stop_items (route_stop_id, piece_id, action, planned_quantity, comments, created_at)
            VALUES (:route_stop_id, :piece_id, :action, :planned_quantity, :comments, NOW())
        ");
        $stmt->execute([
            ':route_stop_id' => $routeStopId,
            ':piece_id' => $item['piece_id'],
            ':action' => $item['action'],
            ':planned_quantity' => $item['planned_quantity'],
            ':comments' => $item['comments'] ?? null
        ]);
    }

    // Fetch items for a specific stop
    public function getStopItems($routeStopId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM stop_items WHERE route_stop_id = :route_stop_id
        ");
        $stmt->execute([':route_stop_id' => $routeStopId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // Check driver availability
    public function isDriverAvailable($driverId, $plannedDate)
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM routes 
            WHERE driver_id = :driver_id AND planned_date = :planned_date AND status IN ('Planned', 'In Progress')
        ");
        $stmt->execute([
            ':driver_id' => $driverId,
            ':planned_date' => $plannedDate
        ]);

        return $stmt->fetch(\PDO::FETCH_ASSOC)['count'] == 0;
    }

    // Check vehicle capacity sufficiency
    public function isVehicleCapacitySufficient($vehicleId, $totalPlannedQuantity)
    {
        $stmt = $this->db->prepare("
            SELECT capacity FROM vehicles WHERE vehicle_id = :vehicle_id
        ");
        $stmt->execute([':vehicle_id' => $vehicleId]);
        $vehicle = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$vehicle) {
            throw new \Exception("Vehicle not found.");
        }

        return $totalPlannedQuantity <= $vehicle['capacity'];
    }
}
