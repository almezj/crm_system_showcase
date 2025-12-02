<?php

namespace App\Controllers;

use App\Models\ProposalModel;
use App\Models\MaterialModel;
use App\Utils\JsonResponse;

class ProposalItemPieceMaterialController
{
    private $proposalModel;
    private $materialModel;

    public function __construct()
    {
        $this->proposalModel = new ProposalModel();
        $this->materialModel = new MaterialModel();
    }

    public function getProposalItemPieceMaterials($proposalItemPieceId)
    {
        try {
            $materials = $this->proposalModel->getProposalItemPieceMaterials($proposalItemPieceId);
            JsonResponse::send($materials);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function addMaterialToProposalItemPiece($proposalItemPieceId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['material_id'])) {
                JsonResponse::send(['error' => 'Material ID is required'], 400);
                return;
            }

            $materialId = $data['material_id'];
            $customDescription = $data['custom_description'] ?? null;

            // Verify proposal item piece exists
            $piece = $this->proposalModel->getProposalItemPiece($proposalItemPieceId);
            if (!$piece) {
                JsonResponse::send(['error' => 'Proposal item piece not found'], 404);
                return;
            }

            // Verify material exists
            $material = $this->materialModel->get($materialId);
            if (!$material) {
                JsonResponse::send(['error' => 'Material not found'], 404);
                return;
            }

            $result = $this->proposalModel->addMaterialToProposalItemPiece(
                $proposalItemPieceId, 
                $materialId,
                $customDescription
            );
            
            if ($result) {
                $materials = $this->proposalModel->getProposalItemPieceMaterials($proposalItemPieceId);
                JsonResponse::send($materials);
            } else {
                JsonResponse::send(['error' => 'Failed to add material to proposal item piece'], 500);
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function removeMaterialFromProposalItemPiece($proposalItemPieceId, $materialId)
    {
        try {
            $result = $this->proposalModel->removeMaterialFromProposalItemPiece($proposalItemPieceId, $materialId);
            
            if ($result) {
                $materials = $this->proposalModel->getProposalItemPieceMaterials($proposalItemPieceId);
                JsonResponse::send($materials);
            } else {
                JsonResponse::send(['error' => 'Failed to remove material from proposal item piece'], 500);
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function updateProposalItemPieceMaterials($proposalItemPieceId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['material_ids']) || !is_array($data['material_ids'])) {
                JsonResponse::send(['error' => 'Material IDs array is required'], 400);
                return;
            }

            $materialIds = $data['material_ids'];

            // Verify proposal item piece exists
            $piece = $this->proposalModel->getProposalItemPiece($proposalItemPieceId);
            if (!$piece) {
                JsonResponse::send(['error' => 'Proposal item piece not found'], 404);
                return;
            }

            $result = $this->proposalModel->updateProposalItemPieceMaterials($proposalItemPieceId, $materialIds);
            
            if ($result) {
                $materials = $this->proposalModel->getProposalItemPieceMaterials($proposalItemPieceId);
                JsonResponse::send($materials);
            } else {
                JsonResponse::send(['error' => 'Failed to update materials for proposal item piece'], 500);
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function updateMaterialOrder($proposalItemPieceId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['material_orders']) || !is_array($data['material_orders'])) {
                JsonResponse::send(['error' => 'Material orders array is required'], 400);
                return;
            }

            $materialOrders = $data['material_orders'];

            // Verify proposal item piece exists
            $piece = $this->proposalModel->getProposalItemPiece($proposalItemPieceId);
            if (!$piece) {
                JsonResponse::send(['error' => 'Proposal item piece not found'], 404);
                return;
            }

            $result = $this->proposalModel->updateMaterialOrder($proposalItemPieceId, $materialOrders);
            
            if ($result) {
                $materials = $this->proposalModel->getProposalItemPieceMaterials($proposalItemPieceId);
                JsonResponse::send($materials);
            } else {
                JsonResponse::send(['error' => 'Failed to update material order'], 500);
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }
} 