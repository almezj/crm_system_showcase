<?php

namespace App\Controllers;

use App\Libraries\MaterialLibrary;
use App\Utils\JsonResponse;
use App\Utils\FileUploader; // Added FileUploader import

class MaterialController
{
    private $materialLibrary;

    public function __construct()
    {
        $this->materialLibrary = new MaterialLibrary();
    }

    public function getAllMaterials()
    {
        try {
            $materials = $this->materialLibrary->getAll();
            JsonResponse::send($materials);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function createMaterial()
    {
        try {
            // Check if this is a multipart form data request
            if (isset($_POST) && !empty($_POST)) {
                // Handle FormData (for file uploads)
                $data = $_POST;
                
                // Handle file upload if present
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $file = $_FILES['image'];
                    $uploadPath = FileUploader::upload($file, 'materials');
                    $data['image_path'] = $uploadPath;
                }
            } else {
                // Handle JSON data
                $data = json_decode(file_get_contents('php://input'), true);
            }
            
            $result = $this->materialLibrary->create($data);
            JsonResponse::send($result);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function getMaterial($id)
    {
        try {
            $material = $this->materialLibrary->get($id);
            if (!$material) {
                JsonResponse::send(['error' => 'Material not found'], 404);
                return;
            }
            JsonResponse::send($material);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function updateMaterial($id)
    {
        try {
            // Handle JSON data
            $rawInput = file_get_contents('php://input');
            error_log("[MaterialController] Raw input: " . $rawInput);
            
            $data = json_decode($rawInput, true);
            error_log("[MaterialController] Decoded data: " . print_r($data, true));
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON: " . json_last_error_msg());
            }
            
            $data['id'] = $id; // Add ID to data for the model
            $result = $this->materialLibrary->update($id, $data);
            JsonResponse::send($result);
        } catch (\Exception $e) {
            error_log("[MaterialController] Error: " . $e->getMessage());
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function searchMaterials()
    {
        try {
            $query = $_GET['q'] ?? '';
            if (strlen($query) < 3) {
                JsonResponse::send([]);
                return;
            }
            
            $materials = $this->materialLibrary->searchByName($query);
            JsonResponse::send($materials);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function uploadMaterialImage()
    {
        try {
            if (!isset($_FILES['image'])) {
                JsonResponse::send(['error' => 'No image file provided'], 400);
                return;
            }

            $file = $_FILES['image'];
            $materialId = $_POST['material_id'] ?? null;
            $title = $_POST['title'] ?? null;
            $description = $_POST['description'] ?? null;

            if (!$materialId) {
                JsonResponse::send(['error' => 'Material ID is required'], 400);
                return;
            }

            // File validation is now handled by FileUploader

            // Use FileUploader for consistent upload handling
            $directory = "materials/{$materialId}";
            $filePath = FileUploader::upload($file, $directory);

            $imageId = $this->materialLibrary->addMaterialImage($materialId, $filePath, $title, $description);
            JsonResponse::send([
                'success' => true,
                'image_id' => $imageId,
                'image_path' => $filePath
            ]);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function getMaterialImages($materialId)
    {
        try {
            $images = $this->materialLibrary->getMaterialImages($materialId);
            JsonResponse::send($images);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteMaterialImage($imageId)
    {
        try {
            $result = $this->materialLibrary->deleteMaterialImage($imageId);
            JsonResponse::send(['success' => $result]);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteMaterial($id)
    {
        try {
            $result = $this->materialLibrary->delete($id);
            JsonResponse::send(['success' => $result]);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }
}