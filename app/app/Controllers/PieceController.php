<?php

namespace App\Controllers;

use App\Models\PieceModel;
use App\Utils\JsonResponse;
use App\Utils\ErrorResponse;

class PieceController
{
    private $pieceModel;

    public function __construct()
    {
        $this->pieceModel = new PieceModel();
    }

    public function createPiece()
    {
        try {
            error_log('[PieceController] create() method called');
            error_log('[PieceController] Request method: ' . $_SERVER['REQUEST_METHOD']);
            error_log('[PieceController] Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
            
            $input = json_decode(file_get_contents('php://input'), true);
            error_log('[PieceController] Input data: ' . json_encode($input));
            
            // Validate required fields
            $validationErrors = [];
            if (empty($input['internal_manufacturer_code'])) {
                $validationErrors['internal_manufacturer_code'] = 'Internal manufacturer code is required';
            }
            if (empty($input['product_id'])) {
                $validationErrors['product_id'] = 'Product ID is required';
            }
            
            if (!empty($validationErrors)) {
                error_log('[PieceController] Validation failed - missing required fields');
                ErrorResponse::validationError($validationErrors, 'Please provide all required fields');
                return;
            }

            // Check if piece with same manufacturer code already exists for this product
            $existingPiece = $this->pieceModel->getByManufacturerCodeAndProduct(
                $input['internal_manufacturer_code'],
                $input['product_id']
            );

            if ($existingPiece) {
                ErrorResponse::conflict('A piece with this manufacturer code already exists for this product');
                return;
            }

            // Create the piece
            $pieceData = [
                'product_id' => $input['product_id'],
                'internal_manufacturer_code' => $input['internal_manufacturer_code'],
                'ean_code' => $input['ean_code'] ?? null,
                'qr_code' => $input['qr_code'] ?? null,
                'description' => $input['description'] ?? null,
                'is_active' => $input['is_active'] ?? 1
            ];

            $piece = $this->pieceModel->create($pieceData);
            
            if ($piece) {
                error_log('[PieceController] Successfully created piece: ' . json_encode($piece));
                JsonResponse::send($piece, 201);
                return;
            } else {
                error_log('[PieceController] Failed to create piece - piece is false/null');
                ErrorResponse::serverError('Failed to create piece. Please try again.');
                return;
            }

        } catch (\Exception $e) {
            error_log('[PieceController] Exception in create(): ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            ErrorResponse::serverError('Failed to create piece. Please try again.', $e->getMessage());
            return;
        }
    }

    public function getAllPieces()
    {
        try {
            error_log('[PieceController] getAllPieces() called');
            $pieces = $this->pieceModel->getAll();
            error_log('[PieceController] Retrieved all pieces: ' . json_encode($pieces));
            JsonResponse::send($pieces);
            return;
        } catch (\Exception $e) {
            error_log('[PieceController] Error retrieving all pieces: ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            ErrorResponse::serverError('Failed to retrieve pieces. Please try again.', $e->getMessage());
            return;
        }
    }

    public function getPiece($id)
    {
        try {
            error_log('[PieceController] getPiece() called with id: ' . $id);
            $piece = $this->pieceModel->get($id);
            if (!$piece) {
                ErrorResponse::notFound('Piece', $id);
                return;
            }
            error_log('[PieceController] Retrieved piece: ' . json_encode($piece));
            JsonResponse::send($piece);
            return;
        } catch (\Exception $e) {
            error_log('[PieceController] Error retrieving piece: ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            ErrorResponse::serverError('Failed to retrieve piece. Please try again.', $e->getMessage());
            return;
        }
    }

    public function updatePiece($id)
    {
        try {
            error_log('[PieceController] updatePiece() called with id: ' . $id);
            $input = json_decode(file_get_contents('php://input'), true);
            error_log('[PieceController] Update input data: ' . json_encode($input));
            
            $result = $this->pieceModel->update($id, $input);
            if ($result) {
                error_log('[PieceController] Successfully updated piece: ' . json_encode($result));
                JsonResponse::send($result);
                return;
            } else {
                error_log('[PieceController] Failed to update piece');
                JsonResponse::send(['error' => 'Failed to update piece'], 500);
                return;
            }
        } catch (\Exception $e) {
            error_log('[PieceController] Exception in updatePiece(): ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            JsonResponse::send(['error' => 'Internal server error: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function deletePiece($id)
    {
        try {
            error_log('[PieceController] deletePiece() called with id: ' . $id);
            $result = $this->pieceModel->delete($id);
            if ($result) {
                error_log('[PieceController] Successfully deleted piece');
                JsonResponse::send(['message' => 'Piece deleted successfully']);
                return;
            } else {
                error_log('[PieceController] Failed to delete piece');
                JsonResponse::send(['error' => 'Failed to delete piece'], 500);
                return;
            }
        } catch (\Exception $e) {
            error_log('[PieceController] Exception in deletePiece(): ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            JsonResponse::send(['error' => 'Internal server error: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getProductPieces($productId)
    {
        try {
            error_log('[PieceController] getProductPieces() called with productId: ' . $productId);
            $pieces = $this->pieceModel->getByProductId($productId);
            error_log('[PieceController] Retrieved pieces: ' . json_encode($pieces));
            JsonResponse::send($pieces);
            return;
        } catch (\Exception $e) {
            error_log('[PieceController] Error retrieving product pieces: ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            JsonResponse::send(['error' => 'Internal server error'], 500);
            return;
        }
    }

    public function getPieceMetadata($id)
    {
        try {
            error_log('[PieceController] getPieceMetadata() called with id: ' . $id);
            $metadata = $this->pieceModel->getPieceMetadata($id);
            error_log('[PieceController] Retrieved piece metadata: ' . json_encode($metadata));
            JsonResponse::send($metadata);
            return;
        } catch (\Exception $e) {
            error_log('[PieceController] Error retrieving piece metadata: ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            JsonResponse::send(['error' => 'Internal server error'], 500);
            return;
        }
    }

    public function updatePieceMetadata($id)
    {
        try {
            error_log('[PieceController] updatePieceMetadata() called with id: ' . $id);
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!is_array($data)) {
                JsonResponse::send(['error' => 'Invalid data format. Expected array of metadata items.'], 400);
                return;
            }

            error_log('[PieceController] Update metadata input data: ' . json_encode($data));
            
            // Clear existing metadata
            $this->pieceModel->clearPieceMetadata($id);
            
            // Add new metadata
            $addedCount = 0;
            foreach ($data as $metadata) {
                if (isset($metadata['key_name'])) {
                    $this->pieceModel->addPieceMetadata($id, $metadata);
                    $addedCount++;
                }
            }
            
            error_log('[PieceController] Successfully updated piece metadata. Added ' . $addedCount . ' items.');
            JsonResponse::send([
                'message' => "Piece metadata updated successfully. Added $addedCount metadata items.",
                'added_count' => $addedCount
            ]);
            return;
        } catch (\Exception $e) {
            error_log('[PieceController] Exception in updatePieceMetadata(): ' . $e->getMessage());
            error_log('[PieceController] Exception trace: ' . $e->getTraceAsString());
            JsonResponse::send(['error' => 'Internal server error: ' . $e->getMessage()], 500);
            return;
        }
    }
} 