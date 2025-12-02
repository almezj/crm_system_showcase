<?php

namespace App\Controllers;

require_once __DIR__ . '/../Models/PieceImageModel.php';
require_once __DIR__ . '/../Utils/FileUploader.php';
require_once __DIR__ . '/../Utils/JsonResponse.php';

class PieceImageController {
    private $pieceImageModel;
    private $fileUploader;

    public function __construct() {
        $this->pieceImageModel = new \App\Models\PieceImageModel();
        $this->fileUploader = new \App\Utils\FileUploader();
    }

    public function getByPiece($pieceId) {
        try {
            $images = $this->pieceImageModel->getByPiece($pieceId);
            \App\Utils\JsonResponse::send($images);
        } catch (\Exception $e) {
            \App\Utils\JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function upload() {
        try {
            if (!isset($_POST['piece_id']) || !isset($_FILES['image'])) {
                throw new \Exception('Missing required parameters');
            }

            $pieceId = $_POST['piece_id'];
            $description = $_POST['description'] ?? null;
            $isPrimary = isset($_POST['is_primary']) && $_POST['is_primary'] === 'true';
            $proposalItemPieceId = $_POST['proposal_item_piece_id'] ?? null;
            $proposalId = $_POST['proposal_id'] ?? null;
            $proposalItemId = $_POST['proposal_item_id'] ?? null;

            // Check if this is a proposal-specific image
            if ($proposalItemPieceId && $proposalId && $proposalItemId) {
                // This is a proposal-specific image - use proposal directory structure
                $directory = 'uploads/proposals/' . $proposalId . '/' . $proposalItemId . '/' . $pieceId;
                $filePath = $this->fileUploader->upload($_FILES['image'], $directory);
                
                $proposalImageModel = new \App\Models\ProposalItemPieceImageModel();
                $imageId = $proposalImageModel->add($proposalItemPieceId, $filePath, $description, $isPrimary);
                
                $result = [
                    'piece_image_id' => $imageId,
                    'image_url' => $filePath,
                    'description' => $description,
                    'is_primary' => $isPrimary,
                    'is_proposal_specific' => true
                ];
            } else {
                // This is a general piece image - use piece directory structure
                $directory = 'uploads/pieces/' . $pieceId;
                $filePath = $this->fileUploader->upload($_FILES['image'], $directory);
                
                $imageId = $this->pieceImageModel->add($pieceId, $filePath, $description, $isPrimary);
                
                $result = [
                    'piece_image_id' => $imageId,
                    'image_url' => $filePath,
                    'description' => $description,
                    'is_primary' => $isPrimary,
                    'is_proposal_specific' => false
                ];
            }

            \App\Utils\JsonResponse::send($result);
        } catch (\Exception $e) {
            \App\Utils\JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function update($imageId) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                throw new \Exception('Invalid JSON data');
            }

            $result = $this->pieceImageModel->update($imageId, $data);
            
            if ($result) {
                \App\Utils\JsonResponse::send(['message' => 'Image updated successfully']);
            } else {
                \App\Utils\JsonResponse::send(['error' => 'Failed to update image'], 400);
            }
        } catch (\Exception $e) {
            \App\Utils\JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function delete($imageId) {
        try {
            $result = $this->pieceImageModel->delete($imageId);
            
            if ($result) {
                \App\Utils\JsonResponse::send(['message' => 'Image deleted successfully']);
            } else {
                \App\Utils\JsonResponse::send(['error' => 'Failed to delete image'], 400);
            }
        } catch (\Exception $e) {
            \App\Utils\JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function reorder($pieceId) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['image_order']) || !is_array($data['image_order'])) {
                throw new \Exception('Invalid image order data');
            }

            $result = $this->pieceImageModel->reorder($pieceId, $data['image_order']);
            
            if ($result) {
                \App\Utils\JsonResponse::send(['message' => 'Images reordered successfully']);
            } else {
                \App\Utils\JsonResponse::send(['error' => 'Failed to reorder images'], 400);
            }
        } catch (\Exception $e) {
            \App\Utils\JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    public function setPrimary($imageId) {
        try {
            $result = $this->pieceImageModel->update($imageId, ['is_primary' => true]);
            
            if ($result) {
                \App\Utils\JsonResponse::send(['message' => 'Primary image set successfully']);
            } else {
                \App\Utils\JsonResponse::send(['error' => 'Failed to set primary image'], 400);
            }
        } catch (\Exception $e) {
            \App\Utils\JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }
} 