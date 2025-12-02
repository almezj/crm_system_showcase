<?php

namespace App\Libraries;

use App\Models\RouteModel;

class RouteLibrary
{
    private $routeModel;

    public function __construct()
    {
        $this->routeModel = new RouteModel();
    }

    // Create a new route and add stops
    public function createRoute($data)
    {
        $this->validateDriverAvailability($data['driver_id'], $data['planned_date']);
        $this->validateVehicleCapacity($data['vehicle_id'], $data['stops']);

        $routeId = $this->routeModel->createRoute($data);

        foreach ($data['stops'] as $stop) {
            $this->routeModel->addRouteStop($routeId, $stop);
        }

        return ['route_id' => $routeId];
    }

    // Fetch route details, including stops
    public function getRouteById($id)
    {
        $route = $this->routeModel->getRoute($id);
        $route['stops'] = $this->routeModel->getRouteStops($id);

        foreach ($route['stops'] as &$stop) {
            $stop['items'] = $this->routeModel->getStopItems($stop['route_stop_id']);
        }

        return $route;
    }

    // Update route details
    public function updateRoute($id, $data)
    {
        if (isset($data['status']) && $data['status'] === 'Completed') {
            $this->validateRouteCompletion($id);
        }
        return $this->routeModel->updateRoute($id, $data);
    }

    // Assign items to a specific stop
    public function assignItemsToStop($routeStopId, $items)
    {
        foreach ($items as $item) {
            $this->routeModel->addStopItem($routeStopId, $item);
        }
        return ['message' => 'Items assigned successfully'];
    }

    // Validate driver availability
    private function validateDriverAvailability($driverId, $plannedDate)
    {
        if (!$this->routeModel->isDriverAvailable($driverId, $plannedDate)) {
            throw new \Exception("Driver is not available on the planned date.");
        }
    }

    // Validate vehicle capacity
    private function validateVehicleCapacity($vehicleId, $stops)
    {
        // Example logic to check vehicle capacity
        $totalPlannedQuantity = 0;
        foreach ($stops as $stop) {
            if (isset($stop['items'])) {
                foreach ($stop['items'] as $item) {
                    $totalPlannedQuantity += $item['planned_quantity'];
                }
            }
        }

        if (!$this->routeModel->isVehicleCapacitySufficient($vehicleId, $totalPlannedQuantity)) {
            throw new \Exception("Vehicle capacity is insufficient for the planned route.");
        }
    }

    // Validate if route can be marked as completed
    private function validateRouteCompletion($routeId)
    {
        $stops = $this->routeModel->getRouteStops($routeId);
        foreach ($stops as $stop) {
            $items = $this->routeModel->getStopItems($stop['route_stop_id']);
            foreach ($items as $item) {
                if ($item['actual_quantity'] < $item['planned_quantity']) {
                    throw new \Exception("Cannot mark route as completed. Some items have not been fully processed.");
                }
            }
        }
    }
}
