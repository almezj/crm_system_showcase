<?php

namespace App\Controllers;

use App\Libraries\RouteLibrary;
use App\Utils\JsonResponse;

class RouteController
{
    private $routeLibrary;

    public function __construct()
    {
        $this->routeLibrary = new RouteLibrary();
    }

    // Create a new route with stops
    public function createRoute()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['vehicle_id'], $data['driver_id'], $data['stops']) || empty($data['stops'])) {
            JsonResponse::send(['error' => 'Vehicle ID, driver ID, and stops are required'], 400);
        }

        try {
            $result = $this->routeLibrary->createRoute($data);
            JsonResponse::send($result, 201);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 400);
        }
    }

    // Fetch route details by ID
    public function getRoute($id)
    {
        try {
            $route = $this->routeLibrary->getRouteById($id);
            JsonResponse::send($route);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 404);
        }
    }

    // Update route status or details
    public function updateRoute($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        try {
            $result = $this->routeLibrary->updateRoute($id, $data);
            JsonResponse::send($result);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 400);
        }
    }

    // Assign items to a specific stop
    public function assignItemsToStop($routeStopId)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['items']) || empty($data['items'])) {
            JsonResponse::send(['error' => 'Items are required'], 400);
        }

        try {
            $result = $this->routeLibrary->assignItemsToStop($routeStopId, $data['items']);
            JsonResponse::send($result, 201);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 400);
        }
    }
}
