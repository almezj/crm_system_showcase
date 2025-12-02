<?php

namespace App\Controllers;

use App\Models\PieceModel;
use App\Models\MaterialModel;
use App\Utils\JsonResponse;

class PieceMaterialController
{
    private $pieceModel;
    private $materialModel;

    public function __construct()
    {
        $this->pieceModel = new PieceModel();
        $this->materialModel = new MaterialModel();
    }

    public function getPieceMaterials($pieceId)
    {
        try {
            $materials = $this->pieceModel->getPieceMaterials($pieceId);
            JsonResponse::send($materials);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function addMaterialToPiece($pieceId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['material_id'])) {
                JsonResponse::send(['error' => 'Material ID is required'], 400);
                return;
            }

            $materialId = $data['material_id'];
            $materialImageId = $data['material_image_id'] ?? null;

            // Verify piece exists
            $piece = $this->pieceModel->get($pieceId);
            if (!$piece) {
                JsonResponse::send(['error' => 'Piece not found'], 404);
                return;
            }

            // Verify material exists
            $material = $this->materialModel->get($materialId);
            if (!$material) {
                JsonResponse::send(['error' => 'Material not found'], 404);
                return;
            }

            $result = $this->pieceModel->addMaterial($pieceId, $materialId, $materialImageId);
            
            if ($result) {
                $materials = $this->pieceModel->getPieceMaterials($pieceId);
                JsonResponse::send($materials);
            } else {
                JsonResponse::send(['error' => 'Failed to add material to piece'], 500);
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function removeMaterialFromPiece($pieceId, $materialId)
    {
        try {
            // Verify piece exists
            $piece = $this->pieceModel->get($pieceId);
            if (!$piece) {
                JsonResponse::send(['error' => 'Piece not found'], 404);
                return;
            }

            $result = $this->pieceModel->removeMaterial($pieceId, $materialId);
            
            if ($result) {
                $materials = $this->pieceModel->getPieceMaterials($pieceId);
                JsonResponse::send($materials);
            } else {
                JsonResponse::send(['error' => 'Failed to remove material from piece'], 500);
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function updatePieceMaterials($pieceId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['material_ids']) || !is_array($data['material_ids'])) {
                JsonResponse::send(['error' => 'Material IDs array is required'], 400);
                return;
            }

            // Verify piece exists
            $piece = $this->pieceModel->get($pieceId);
            if (!$piece) {
                JsonResponse::send(['error' => 'Piece not found'], 404);
                return;
            }

            // Verify all materials exist
            foreach ($data['material_ids'] as $materialId) {
                $material = $this->materialModel->get($materialId);
                if (!$material) {
                    JsonResponse::send(['error' => "Material with ID $materialId not found"], 404);
                    return;
                }
            }

            $result = $this->pieceModel->updatePieceMaterials($pieceId, $data['material_ids']);
            
            if ($result) {
                $materials = $this->pieceModel->getPieceMaterials($pieceId);
                JsonResponse::send($materials);
            } else {
                JsonResponse::send(['error' => 'Failed to update piece materials'], 500);
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }
} 