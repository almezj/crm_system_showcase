<?php

namespace App\Models;

use Config\Database;

class ProposalModel
{
    private $db;
    private $proposalItemMetadataModel;
    private $proposalItemPieceMetadataModel;

    public function __construct()
    {
        $this->db = Database::getConnection();
        $this->proposalItemMetadataModel = new \App\Models\ProposalItemMetadataModel();
        $this->proposalItemPieceMetadataModel = new \App\Models\ProposalItemPieceMetadataModel();
    }

    public function getDb()
    {
        return $this->db;
    }

    public function createProposal($data)
    {
        // Try to get the current user ID if not provided
        $createdBy = $data['created_by'] ?? null;
        if ($createdBy === null) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $token = str_replace('Bearer ', '', $headers['Authorization']);
                $sessionModel = new \App\Models\SessionModel();
                $session = $sessionModel->getSessionByToken($token);
                if ($session && isset($session['user_id'])) {
                    $createdBy = $session['user_id'];
                }
            }
        }
        
        // If we still don't have a user ID, we'll need to handle this case
        // For now, we'll use a default value or throw an exception
        if ($createdBy === null) {
            error_log("Warning: No user ID available for proposal creation. This may cause issues with the created_by field.");
            // For now, we'll use a default value of 1 (assuming user ID 1 exists)
            // In production, you should handle this properly
            $createdBy = 1;
        }

        // Handle currency and exchange rate
        $currencyCode = $data['currency_code'] ?? 'CZK';
        $exchangeRateUsed = null;

        if ($currencyCode !== 'CZK') {
            $currencyUtils = new \App\Utils\CurrencyUtils();
            $exchangeRateUsed = $currencyUtils->getExchangeRate($currencyCode, 'CZK');
            
            error_log("ProposalModel::createProposal - Currency: {$currencyCode}, Exchange Rate: " . ($exchangeRateUsed ?? 'NULL'));
            
            if ($exchangeRateUsed === null) {
                throw new \Exception("Exchange rate not available for {$currencyCode} to CZK");
            }
        } else {
            $exchangeRateUsed = 1.0; // CZK to CZK rate is 1
        }
        
        // Language used for translations/text in the proposal
        $languageId = isset($data['language_id']) ? (int)$data['language_id'] : 1;

        // Snapshot VAT from language
        $vatRate = 0.21;
        try {
            $vatStmt = $this->db->prepare("SELECT vat_rate FROM languages WHERE language_id = :language_id");
            $vatStmt->execute([':language_id' => $languageId]);
            $vat = $vatStmt->fetch(\PDO::FETCH_ASSOC);
            if ($vat && isset($vat['vat_rate'])) {
                $vatRate = (float)$vat['vat_rate'];
            }
        } catch (\Exception $e) {
            // keep default
        }

        $stmt = $this->db->prepare("
            INSERT INTO proposals (prospect_id, valid_until, total_price, created_by, proposal_status_id, currency_code, exchange_rate_used, language_id, vat_rate)
            VALUES (:prospect_id, :valid_until, :total_price, :created_by, :proposal_status_id, :currency_code, :exchange_rate_used, :language_id, :vat_rate)
        ");
        $stmt->execute([
            ':prospect_id' => $data['prospect_id'],
            ':valid_until' => $data['valid_until'] ?? date('Y-m-d', strtotime('+30 days')),
            ':total_price' => $data['total_price'] ?? 0.00,
            ':created_by' => $createdBy,
            ':proposal_status_id' => 1, // Draft
            ':currency_code' => $currencyCode,
            ':exchange_rate_used' => $exchangeRateUsed,
            ':language_id' => $languageId,
            ':vat_rate' => $vatRate
        ]);

        $proposalId = $this->db->lastInsertId();
        
        // Log the initial status change
        $this->logStatusChange($proposalId, 1, $createdBy);

        return $proposalId;
    }

    public function addProposalItem($proposalId, $item)
    {
        error_log("ProposalModel::addProposalItem - Received item data: " . json_encode($item, JSON_PRETTY_PRINT));
        
        // Get proposal currency and exchange rate
        $proposal = $this->getProposal($proposalId);
        $proposalCurrency = $proposal['currency_code'] ?? 'CZK';
        $exchangeRate = $proposal['exchange_rate_used'] ?? 1.0;

        // Calculate final_price if not provided or invalid (gross prices including VAT)
        $input_list_price = isset($item['list_price']) ? floatval($item['list_price']) : 0; // Input price in proposal currency
        $discount = isset($item['discount']) ? floatval($item['discount']) : 0;
        $input_final_price = isset($item['final_price']) && floatval($item['final_price']) > 0
            ? floatval($item['final_price']) // Input final price in proposal currency
            : $input_list_price * (1 - $discount / 100);

        // Convert to CZK for storage
        $currencyUtils = new \App\Utils\CurrencyUtils();
        $list_price_czk = $currencyUtils->convertToCZK($input_list_price, $proposalCurrency, $exchangeRate);
        $final_price_czk = $currencyUtils->convertToCZK($input_final_price, $proposalCurrency, $exchangeRate);
        
        error_log("ProposalModel::addProposalItem - Converting prices: {$input_list_price} {$proposalCurrency} -> {$list_price_czk} CZK (rate: {$exchangeRate})");
        error_log("ProposalModel::addProposalItem - Converting prices: {$input_final_price} {$proposalCurrency} -> {$final_price_czk} CZK (rate: {$exchangeRate})");

        // Get language ID for proposal currency
        $proposalCurrencyLanguageId = $proposalCurrency === 'EUR' ? 2 : 1; // EUR = 2, CZK = 1
        
        $stmt = $this->db->prepare("
            INSERT INTO proposal_items (proposal_id, product_id, item_name, description, custom_description, quantity, list_price, discount, final_price, price_currency_id, input_currency_code, input_price, metadata, is_custom)
            VALUES (:proposal_id, :product_id, :item_name, :description, :custom_description, :quantity, :list_price, :discount, :final_price, :price_currency_id, :input_currency_code, :input_price, :metadata, :is_custom)
        ");
        $isCustomValue = isset($item['is_custom']) ? (int)$item['is_custom'] : 0;
        $itemIsCustom = isset($item['is_custom']) ? $item['is_custom'] : 'not set';
        error_log("ProposalModel::addProposalItem - is_custom value: " . $isCustomValue . " (from item: " . $itemIsCustom . ")");
        
        // For custom items, product_id should be NULL
        $productId = (isset($item['is_custom']) && $item['is_custom']) ? null : ($item['product_id'] ?? null);
        
        $stmt->execute([
            ':proposal_id' => $proposalId,
            ':product_id' => $productId,
            ':item_name' => $item['item_name'] ?? '',
            ':description' => $item['description'] ?? null,
            ':custom_description' => $item['custom_description'] ?? null,
            ':quantity' => $item['quantity'],
            ':list_price' => $list_price_czk, // Store in CZK
            ':discount' => $discount,
            ':final_price' => $final_price_czk, // Store in CZK
            ':price_currency_id' => $proposalCurrencyLanguageId, // Use proposal currency language ID
            ':input_currency_code' => $proposalCurrency, // Store input currency
            ':input_price' => $input_final_price, // Store input price
            ':metadata' => json_encode($item['metadata'] ?? []),
            ':is_custom' => $isCustomValue
        ]);

        $proposalItemId = $this->db->lastInsertId();
        
        // Inherit metadata from product if product_id is provided
        if (isset($item['product_id']) && $item['product_id']) {
            $this->proposalItemMetadataModel->inheritFromProduct($proposalItemId, $item['product_id']);
        }
        
        // Handle structured metadata if provided (overrides inherited metadata)
        if (isset($item['item_metadata']) && is_array($item['item_metadata']) && !empty($item['item_metadata'])) {
            $this->proposalItemMetadataModel->createMultiple($proposalItemId, $item['item_metadata']);
        }

        // Recalculate and update proposal total
        $this->recalculateProposalTotal($proposalId);
        
        return $proposalItemId;
    }

    /**
     * Recalculate and update proposal total based on all items
     */
    public function recalculateProposalTotal($proposalId)
    {
        try {
            // Get all proposal items with their quantities and final prices
            $stmt = $this->db->prepare("
                SELECT quantity, final_price 
                FROM proposal_items 
                WHERE proposal_id = :proposal_id AND deleted_at IS NULL
            ");
            $stmt->execute([':proposal_id' => $proposalId]);
            $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            $total = 0;
            foreach ($items as $item) {
                $total += $item['quantity'] * $item['final_price'];
            }
            
            // Update proposal total
            $stmt = $this->db->prepare("
                UPDATE proposals 
                SET total_price = :total_price 
                WHERE proposal_id = :proposal_id
            ");
            $stmt->execute([
                ':total_price' => $total,
                ':proposal_id' => $proposalId
            ]);
            
            error_log("ProposalModel::recalculateProposalTotal - Updated proposal {$proposalId} total to {$total} CZK");
            
        } catch (\Exception $e) {
            error_log("Error recalculating proposal total: " . $e->getMessage());
            throw $e;
        }
    }

    public function addProposalPiece($proposalItemId, $piece)
    {
        try {
            // Validate required fields
            if (empty($piece['piece_id'])) {
                throw new \Exception("Piece ID is required for piece");
            }

            // Verify the piece exists
            $stmt = $this->db->prepare("
                SELECT piece_id, internal_manufacturer_code, ean_code, qr_code, description 
                FROM pieces 
                WHERE piece_id = :piece_id AND deleted_at IS NULL
            ");
            $stmt->execute([':piece_id' => $piece['piece_id']]);
            $pieceDetails = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$pieceDetails) {
                throw new \Exception("Piece with ID {$piece['piece_id']} not found");
            }
            
            // Insert the proposal item piece (without materials - they'll be added separately)
            $stmt = $this->db->prepare("
                INSERT INTO proposal_item_pieces (
                    proposal_item_id, 
                    piece_id,
                    internal_manufacturer_code, 
                    ean_code, 
                    qr_code, 
                    custom_description, 
                    is_active, 
                    created_at, 
                    updated_at
                )
                VALUES (
                    :proposal_item_id, 
                    :piece_id,
                    :internal_manufacturer_code, 
                    :ean_code, 
                    :qr_code, 
                    :custom_description, 
                    1, 
                    NOW(), 
                    NOW()
                )
            ");
            $stmt->execute([
                ':proposal_item_id' => $proposalItemId,
                ':piece_id' => $piece['piece_id'],
                ':internal_manufacturer_code' => $pieceDetails['internal_manufacturer_code'] ?? '',
                ':ean_code' => $pieceDetails['ean_code'] ?? null,
                ':qr_code' => $pieceDetails['qr_code'] ?? null,
                ':custom_description' => $piece['description'] ?? null
            ]);
            
            $proposalItemPieceId = $this->db->lastInsertId();
            
            // Inherit metadata from piece if piece_id is provided
            if (isset($piece['piece_id']) && $piece['piece_id']) {
                $this->proposalItemPieceMetadataModel->inheritFromPiece($proposalItemPieceId, $piece['piece_id']);
            }
            
            // Add materials to the junction table
            if (isset($piece['materials']) && is_array($piece['materials']) && !empty($piece['materials'])) {
                foreach ($piece['materials'] as $index => $material) {
                    if (isset($material['material_id'])) {
                        $this->addMaterialToProposalItemPiece(
                            $proposalItemPieceId, 
                            $material['material_id'],
                            $material['custom_description'] ?? null,
                            $index
                        );
                    }
                }
            }
            
            return $proposalItemPieceId;
        } catch (\Exception $e) {
            error_log("Error in addProposalPiece: " . $e->getMessage());
            throw $e;
        }
    }

    public function getProposal($id)
    {
        try {
            error_log("ProposalModel::getProposal - Fetching proposal with ID: " . $id);
            
            $stmt = $this->db->prepare("
                SELECT p.*, ps.status_name 
                FROM proposals p
                LEFT JOIN proposal_status ps ON p.proposal_status_id = ps.proposal_status_id
                WHERE p.proposal_id = :proposal_id AND p.deleted_at IS NULL
            ");
            $stmt->execute([':proposal_id' => $id]);
            $proposal = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($proposal) {
                // Map database field names to frontend expected names
                $proposal['id'] = $proposal['proposal_id']; // Frontend expects 'id'
                error_log("ProposalModel::getProposal - Proposal found: " . json_encode($proposal));
            } else {
                error_log("ProposalModel::getProposal - Proposal not found with ID: " . $id);
            }
            
            return $proposal;
        } catch (\Exception $e) {
            error_log("ProposalModel::getProposal - Error: " . $e->getMessage());
            error_log("ProposalModel::getProposal - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function getProposalItems($proposalId)
    {
        try {
            error_log("ProposalModel::getProposalItems - Fetching items for proposal ID: " . $proposalId);
            
            $stmt = $this->db->prepare("
            SELECT 
                pi.*, 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'image_id', pii.image_id,
                        'image_url', pii.image_url,
                        'is_primary', pii.is_primary,
                        'description', pii.description,
                        'sort_order', pii.sort_order,
                        'uploaded_at', pii.uploaded_at,
                        'uploaded_by', pii.uploaded_by
                    )
                ) AS images
            FROM proposal_items pi
            LEFT JOIN proposal_item_images pii ON pi.proposal_item_id = pii.proposal_item_id AND pii.is_active = 1
            WHERE pi.proposal_id = :proposal_id AND pi.deleted_at IS NULL
            GROUP BY pi.proposal_item_id
        ");
            
            $stmt->execute([':proposal_id' => $proposalId]);
            //json decode the images for each item
            $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            error_log("ProposalModel::getProposalItems - Found " . count($items) . " items");
            
            // Debug: Log the is_custom field for each item
            foreach ($items as $index => $item) {
                $isCustomValue = isset($item['is_custom']) ? $item['is_custom'] : 'NOT SET';
                $isCustomType = isset($item['is_custom']) ? gettype($item['is_custom']) : 'null';
                error_log("ProposalModel::getProposalItems - Item {$index}: is_custom = " . $isCustomValue . " (type: " . $isCustomType . ")");
            }
        } catch (\Exception $e) {
            error_log("ProposalModel::getProposalItems - Error: " . $e->getMessage());
            error_log("ProposalModel::getProposalItems - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
        foreach ($items as &$item) {
            // Map database field names to frontend expected names
            $item['id'] = $item['proposal_item_id']; // Frontend expects 'id'
            
            $item['images'] = json_decode($item['images'], true);
            // Handle the case where there are no images (JSON_ARRAYAGG returns [null])
            if ($item['images'] === [null] || $item['images'] === null) {
                $item['images'] = [];
            } else {
                //if there is no image_id remove the item
                $item['images'] = array_filter($item['images'], function ($image) {
                    return $image && $image['image_id'] !== null;
                });
            }
        }
        return $items;
    }

    public function getProposalPieces($proposalItemId)
    {
        try {
            error_log("ProposalModel::getProposalPieces - Fetching pieces for proposal item ID: " . $proposalItemId);
            
            $stmt = $this->db->prepare("
                SELECT pip.*, p.piece_id, p.internal_manufacturer_code, p.description as piece_description
                FROM proposal_item_pieces pip
                LEFT JOIN pieces p ON pip.piece_id = p.piece_id
                WHERE pip.proposal_item_id = :proposal_item_id AND pip.is_active = 1
                ORDER BY pip.created_at ASC
            ");
            $stmt->execute([':proposal_item_id' => $proposalItemId]);
            $pieces = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            error_log("ProposalModel::getProposalPieces - Found " . count($pieces) . " pieces");
        } catch (\Exception $e) {
            error_log("ProposalModel::getProposalPieces - Error: " . $e->getMessage());
            error_log("ProposalModel::getProposalPieces - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
        
        // Format pieces for frontend
        foreach ($pieces as &$piece) {
            // Map database field names to frontend expected names
            $piece['id'] = $piece['proposal_item_piece_id']; // Frontend expects 'id'
            // piece_id is already set from the SQL query
            $piece['description'] = $piece['custom_description'] ?? $piece['piece_description'] ?? '';
            
            // Get materials from the junction table
            $piece['materials'] = $this->getProposalItemPieceMaterials($piece['proposal_item_piece_id']);
            
            // Get piece images (same as product details page)
            try {
                $pieceImageModel = new \App\Models\PieceImageModel();
                $piece['images'] = $pieceImageModel->getByPiece($piece['piece_id']);
            } catch (\Exception $e) {
                error_log("Error fetching piece images for piece ID " . $piece['piece_id'] . ": " . $e->getMessage());
                $piece['images'] = [];
            }
            
            // Remove legacy fields - only keep clean structure
            unset($piece['proposal_item_piece_id']);
            unset($piece['piece_description']);
            unset($piece['custom_description']);
            unset($piece['is_active']);
            unset($piece['created_at']);
            unset($piece['updated_at']);
        }
        
        return $pieces;
    }

    public function updateProposal($id, $data)
    {
        // Start a transaction
        $this->db->beginTransaction();

        try {
            // Get current status before updating
            $stmt = $this->db->prepare("SELECT proposal_status_id FROM proposals WHERE proposal_id = :proposal_id");
            $stmt->execute([':proposal_id' => $id]);
            $currentStatus = $stmt->fetch(\PDO::FETCH_COLUMN);
            
            // Update basic proposal fields
            $fields = [
                'valid_until = :valid_until',
                'total_price = :total_price',
                'updated_at = NOW()'
            ];
            $params = [
                ':proposal_id' => $id,
                ':valid_until' => $data['valid_until'] ?? date('Y-m-d', strtotime('+30 days')),
                ':total_price' => $data['total_price'] ?? 0.00
            ];
            if (isset($data['language_id'])) {
                $fields[] = 'language_id = :language_id';
                $params[':language_id'] = (int)$data['language_id'];
                // also snapshot vat_rate for new language
                try {
                    $vatStmt = $this->db->prepare("SELECT vat_rate FROM languages WHERE language_id = :language_id");
                    $vatStmt->execute([':language_id' => (int)$data['language_id']]);
                    $vat = $vatStmt->fetch(\PDO::FETCH_ASSOC);
                    if ($vat && isset($vat['vat_rate'])) {
                        $fields[] = 'vat_rate = :vat_rate';
                        $params[':vat_rate'] = (float)$vat['vat_rate'];
                    }
                } catch (\Exception $e) {
                    // ignore, keep existing vat_rate
                }
            }
            if (isset($data['proposal_status_id'])) {
                $fields[] = 'proposal_status_id = :proposal_status_id';
                $params[':proposal_status_id'] = $data['proposal_status_id'];
                
                // Log status change if it's different
                if ($currentStatus != $data['proposal_status_id']) {
                    // Try to get the current user if modified_by is not provided
                    $modifiedBy = $data['modified_by'] ?? null;
                    if ($modifiedBy === null) {
                        $headers = getallheaders();
                        if (isset($headers['Authorization'])) {
                            $token = str_replace('Bearer ', '', $headers['Authorization']);
                            $sessionModel = new \App\Models\SessionModel();
                            $session = $sessionModel->getSessionByToken($token);
                            if ($session && isset($session['user_id'])) {
                                $modifiedBy = $session['user_id'];
                            }
                        }
                    }
                    $this->logStatusChange($id, $data['proposal_status_id'], $modifiedBy);
                }
            }
            $sql = "UPDATE proposals SET " . implode(", ", $fields) . " WHERE proposal_id = :proposal_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // Handle items
            if (isset($data['items'])) {
                // Get existing items
                $stmt = $this->db->prepare("SELECT proposal_item_id FROM proposal_items WHERE proposal_id = :proposal_id");
                $stmt->execute([':proposal_id' => $id]);
                $existingItems = $stmt->fetchAll(\PDO::FETCH_COLUMN);

                // Get new item IDs
                $newItemIds = array_map(function($item) {
                    return $item['proposal_item_id'] ?? null;
                }, $data['items']);

                // Delete items that are no longer present
                $itemsToDelete = array_diff($existingItems, array_filter($newItemIds));
                if (!empty($itemsToDelete)) {
                    // Re-index array to ensure sequential numeric keys (required by PDO)
                    $itemsToDelete = array_values($itemsToDelete);
                    $placeholders = str_repeat('?,', count($itemsToDelete) - 1) . '?';
                    $stmt = $this->db->prepare("UPDATE proposal_items SET deleted_at = NOW() WHERE proposal_item_id IN ($placeholders)");
                    $stmt->execute($itemsToDelete);
                }

                // Update or insert items
                foreach ($data['items'] as $item) {
                    if (isset($item['proposal_item_id'])) {
                        // Update existing item - convert prices to CZK for storage
                        $proposal = $this->getProposal($id);
                        $proposalCurrency = $proposal['currency_code'] ?? 'CZK';
                        $exchangeRate = $proposal['exchange_rate_used'] ?? 1.0;
                        
                        // Convert prices from proposal currency to CZK
                        $currencyUtils = new \App\Utils\CurrencyUtils();
                        $list_price_czk = $currencyUtils->convertToCZK($item['list_price'], $proposalCurrency, $exchangeRate);
                        $final_price_czk = $currencyUtils->convertToCZK($item['final_price'], $proposalCurrency, $exchangeRate);
                        
                        error_log("ProposalModel::updateProposal - Converting prices for update: {$item['list_price']} {$proposalCurrency} -> {$list_price_czk} CZK");
                        error_log("ProposalModel::updateProposal - Converting prices for update: {$item['final_price']} {$proposalCurrency} -> {$final_price_czk} CZK");
                        
                        $stmt = $this->db->prepare("
                            UPDATE proposal_items 
                            SET product_id = :product_id,
                                item_name = :item_name,
                                description = :description,
                                custom_description = :custom_description,
                                quantity = :quantity,
                                list_price = :list_price,
                                discount = :discount,
                                final_price = :final_price,
                                price_currency_id = :price_currency_id,
                                input_currency_code = :input_currency_code,
                                input_price = :input_price,
                                metadata = :metadata,
                                is_custom = :is_custom,
                                updated_at = NOW()
                            WHERE proposal_item_id = :proposal_item_id
                        ");
                        // For custom items, product_id should be NULL
                        $productId = (isset($item['is_custom']) && $item['is_custom']) ? null : ($item['product_id'] ?? null);
                        
                        $stmt->execute([
                            ':proposal_item_id' => $item['proposal_item_id'],
                            ':product_id' => $productId,
                            ':item_name' => $item['item_name'],
                            ':description' => $item['description'],
                            ':custom_description' => $item['custom_description'] ?? null,
                            ':quantity' => $item['quantity'],
                            ':list_price' => $list_price_czk, // Store in CZK
                            ':discount' => $item['discount'],
                            ':final_price' => $final_price_czk, // Store in CZK
                            ':price_currency_id' => $item['price_currency_id'] ?? 1,
                            ':input_currency_code' => $proposalCurrency, // Store input currency
                            ':input_price' => $item['final_price'], // Store input price
                            ':metadata' => json_encode($item['metadata'] ?? []),
                            ':is_custom' => isset($item['is_custom']) ? (int)$item['is_custom'] : 0
                        ]);
                        
                        $proposalItemId = $item['proposal_item_id'];
                    } else {
                        // Insert new item
                        $proposalItemId = $this->addProposalItem($id, $item);
                    }
                    
                    // Handle pieces for this item
                    if (isset($item['pieces']) && isset($proposalItemId)) {
                        // Clear existing pieces for this item
                        $stmt = $this->db->prepare("UPDATE proposal_item_pieces SET is_active = 0 WHERE proposal_item_id = :proposal_item_id");
                        $stmt->execute([':proposal_item_id' => $proposalItemId]);
                        
                        // Add new pieces
                        foreach ($item['pieces'] as $piece) {
                            // Handle material creation with INSERT IGNORE
                            if (isset($piece['material_name']) && !empty($piece['material_name'])) {
                                $materialId = $this->createOrGetMaterial($piece);
                                $piece['material_id'] = $materialId;
                            }
                            
                            // Handle materials array from frontend (new simplified format)
                            if (isset($piece['materials']) && is_array($piece['materials']) && !empty($piece['materials'])) {
                                // Extract material IDs from the materials array
                                $materialIds = array_map(function($material) {
                                    return $material['material_id'];
                                }, $piece['materials']);
                                
                                // Set material_ids array for addProposalPiece
                                $piece['material_ids'] = $materialIds;
                                
                                // Set material_id to the first material for backward compatibility
                                if (!empty($materialIds)) {
                                    $piece['material_id'] = $materialIds[0];
                                }
                            }
                            
                            $pieceId = $this->addProposalPiece($proposalItemId, $piece);
                        }
                    }
                }
            }

            $this->db->commit();
            
            // Recalculate and update proposal total after all changes
            $this->recalculateProposalTotal($id);
            
            return ['message' => 'Proposal updated successfully'];
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function deleteProposal($id)
    {
        $stmt = $this->db->prepare("UPDATE proposals SET deleted_at = NOW() WHERE proposal_id = :proposal_id");
        $stmt->execute([':proposal_id' => $id]);
    }

    public function addItemImage($proposalItemId, $filePath, $description)
    {
        $stmt = $this->db->prepare("
            INSERT INTO proposal_item_images (proposal_item_id, image_url, description)
            VALUES (:proposal_item_id, :image_url, :description)
        ");
        $stmt->execute([
            ':proposal_item_id' => $proposalItemId,
            ':image_url' => $filePath,
            ':description' => $description
        ]);

        return ['image_id' => $this->db->lastInsertId()];
    }

    public function updateItemImageDescription($imageId, $description)
    {
        $stmt = $this->db->prepare("
            UPDATE proposal_item_images 
            SET description = :description, updated_at = NOW()
            WHERE image_id = :image_id
        ");
        $stmt->execute([
            ':image_id' => $imageId,
            ':description' => $description
        ]);

        return ['message' => 'Image description updated successfully'];
    }

    public function reorderItemImages($proposalItemId, $imageOrder)
    {
        // Start transaction
        $this->db->beginTransaction();
        
        try {
            // Update the sort_order for each image
            foreach ($imageOrder as $index => $imageId) {
                $stmt = $this->db->prepare("
                    UPDATE proposal_item_images 
                    SET sort_order = :sort_order, updated_at = NOW()
                    WHERE image_id = :image_id AND proposal_item_id = :proposal_item_id
                ");
                $stmt->execute([
                    ':image_id' => $imageId,
                    ':proposal_item_id' => $proposalItemId,
                    ':sort_order' => $index + 1
                ]);
            }
            
            $this->db->commit();
            return ['message' => 'Images reordered successfully'];
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function deleteItemImage($imageId)
    {
        $stmt = $this->db->prepare("
            UPDATE proposal_item_images 
            SET is_active = 0
            WHERE image_id = :image_id
        ");
        $stmt->execute([':image_id' => $imageId]);

        return ['message' => 'Image deleted successfully'];
    }

    public function getItemImages($proposalItemId)
    {
        $stmt = $this->db->prepare("
            SELECT image_id, image_url, description, sort_order, uploaded_at, uploaded_by
            FROM proposal_item_images 
            WHERE proposal_item_id = :proposal_item_id AND is_active = 1
            ORDER BY sort_order ASC, uploaded_at ASC
        ");
        $stmt->execute([':proposal_item_id' => $proposalItemId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getProposals($page = 1, $limit = 10)
    {
        try {
            // Calculate offset
            $offset = ($page - 1) * $limit;
            
            $stmt = $this->db->prepare("
            SELECT proposals.*, 
                CONCAT(persons.first_name, ' ', persons.last_name) AS customer_full_name
            FROM proposals
            JOIN persons ON proposals.prospect_id = persons.person_id
            WHERE proposals.deleted_at IS NULL
            ORDER BY proposals.created_at DESC
            LIMIT :limit OFFSET :offset
        ");
            $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int)$offset, \PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Get total count for pagination
            $countStmt = $this->db->prepare("
                SELECT COUNT(*) as total
                FROM proposals
                JOIN persons ON proposals.prospect_id = persons.person_id
                WHERE proposals.deleted_at IS NULL
            ");
            $countStmt->execute();
            $totalCount = $countStmt->fetch(\PDO::FETCH_ASSOC)['total'];
            
            // Log the result for debugging
            error_log("ProposalModel::getProposals - Query executed successfully, returned " . count($result) . " proposals (page $page, limit $limit, total $totalCount)");
            
            return [
                'proposals' => $result,
                'pagination' => [
                    'current_page' => (int)$page,
                    'per_page' => (int)$limit,
                    'total' => (int)$totalCount,
                    'total_pages' => (int)ceil($totalCount / $limit)
                ]
            ];
        } catch (\PDOException $e) {
            error_log("ProposalModel::getProposals - Database error: " . $e->getMessage());
            error_log("ProposalModel::getProposals - Stack trace: " . $e->getTraceAsString());
            throw $e;
        } catch (\Exception $e) {
            error_log("ProposalModel::getProposals - General error: " . $e->getMessage());
            error_log("ProposalModel::getProposals - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function addTempItemImage($tempKey, $filePath, $description)
    {
        $stmt = $this->db->prepare("
        INSERT INTO temp_proposal_item_images (temp_key, image_url, description)
        VALUES (:temp_key, :image_url, :description)
    ");
        $stmt->execute([
            ':temp_key' => $tempKey,
            ':image_url' => $filePath,
            ':description' => $description
        ]);

        return [
            'image_id' => $this->db->lastInsertId(),
            'image_url' => $filePath,
            'description' => $description
        ];
    }

    public function getTempImagesByKey($tempKey)
    {
        $stmt = $this->db->prepare("
        SELECT * FROM temp_proposal_item_images WHERE temp_key = :temp_key
    ");
        $stmt->execute([':temp_key' => $tempKey]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function deleteTempImagesByKey($tempKey)
    {
        $stmt = $this->db->prepare("
        DELETE FROM temp_proposal_item_images WHERE temp_key = :temp_key
    ");
        $stmt->execute([':temp_key' => $tempKey]);
    }

    public function updateTempItemImageDescription($tempImageId, $description)
    {
        $stmt = $this->db->prepare("
            UPDATE temp_proposal_item_images 
            SET description = :description
            WHERE image_id = :image_id
        ");
        $stmt->execute([
            ':image_id' => $tempImageId,
            ':description' => $description
        ]);

        return ['message' => 'Temp image description updated successfully'];
    }

    public function updateProposalStatus($proposalId, $statusId, $changedBy = null)
    {
        // Get current status before updating
        $stmt = $this->db->prepare("SELECT proposal_status_id FROM proposals WHERE proposal_id = :proposal_id");
        $stmt->execute([':proposal_id' => $proposalId]);
        $currentStatus = $stmt->fetch(\PDO::FETCH_COLUMN);
        
        // Only log if status is actually changing
        if ($currentStatus != $statusId) {
            // Log the status change
            $this->logStatusChange($proposalId, $statusId, $changedBy);
        }
        
        // Update the proposal status
        $stmt = $this->db->prepare("UPDATE proposals SET proposal_status_id = :status_id, updated_at = NOW() WHERE proposal_id = :proposal_id");
        $stmt->execute([
            ':status_id' => $statusId,
            ':proposal_id' => $proposalId
        ]);
        return $stmt->rowCount();
    }

    public function logStatusChange($proposalId, $statusId, $changedBy = null)
    {
        // If changed_by is null, try to get the current user from the session
        if ($changedBy === null) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $token = str_replace('Bearer ', '', $headers['Authorization']);
                $sessionModel = new \App\Models\SessionModel();
                $session = $sessionModel->getSessionByToken($token);
                if ($session && isset($session['user_id'])) {
                    $changedBy = $session['user_id'];
                }
            }
        }
        
        // If we still don't have a user ID, use a default value or skip the log
        if ($changedBy === null) {
            error_log("Warning: No user ID available for proposal status change log. Proposal ID: $proposalId, Status ID: $statusId");
            return; // Skip logging if no user ID is available
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO proposal_status_history (proposal_id, status_id, changed_at, changed_by)
            VALUES (:proposal_id, :status_id, NOW(), :changed_by)
        ");
        $stmt->execute([
            ':proposal_id' => $proposalId,
            ':status_id' => $statusId,
            ':changed_by' => $changedBy
        ]);
    }

    public function getStatusHistory($proposalId)
    {
        $stmt = $this->db->prepare("
            SELECT psh.*, ps.status_name, 
                   CONCAT(u.first_name, ' ', u.last_name) as changed_by_name
            FROM proposal_status_history psh
            LEFT JOIN proposal_status ps ON psh.status_id = ps.proposal_status_id
            LEFT JOIN users u ON psh.changed_by = u.user_id
            WHERE psh.proposal_id = :proposal_id
            ORDER BY psh.changed_at ASC
        ");
        $stmt->execute([':proposal_id' => $proposalId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getProposalIdFromItemId($proposalItemId)
    {
        $stmt = $this->db->prepare("SELECT proposal_id FROM proposal_items WHERE proposal_item_id = :proposal_item_id");
        $stmt->execute([':proposal_item_id' => $proposalItemId]);
        $result = $stmt->fetch(\PDO::FETCH_COLUMN);
        
        if (!$result) {
            throw new \Exception("Proposal item not found: $proposalItemId");
        }
        
        return $result;
    }

    public function createPdfSnapshot($proposalId, $templateType, $pdfFilePath, $proposalData, $generatedBy = null)
    {
        // If generated_by is null, try to get the current user from the session
        if ($generatedBy === null) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $token = str_replace('Bearer ', '', $headers['Authorization']);
                $sessionModel = new \App\Models\SessionModel();
                $session = $sessionModel->getSessionByToken($token);
                if ($session && isset($session['user_id'])) {
                    $generatedBy = $session['user_id'];
                }
            }
        }
        
        // Default to user ID 1 if no user found
        if ($generatedBy === null) {
            $generatedBy = 1;
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO proposal_pdf_snapshots 
            (proposal_id, template_type, pdf_file_path, proposal_data_snapshot, generated_by, generated_at) 
            VALUES (:proposal_id, :template_type, :pdf_file_path, :proposal_data_snapshot, :generated_by, NOW())
        ");
        
        $stmt->execute([
            ':proposal_id' => $proposalId,
            ':template_type' => $templateType,
            ':pdf_file_path' => $pdfFilePath,
            ':proposal_data_snapshot' => json_encode($proposalData),
            ':generated_by' => $generatedBy
        ]);
        
        return $this->db->lastInsertId();
    }

    public function getPdfSnapshots($proposalId)
    {
        $stmt = $this->db->prepare("
            SELECT 
                ps.*,
                CONCAT(u.first_name, ' ', u.last_name) as generated_by_name
            FROM proposal_pdf_snapshots ps
            LEFT JOIN users u ON ps.generated_by = u.user_id
            WHERE ps.proposal_id = :proposal_id
            ORDER BY ps.generated_at ASC
        ");
        $stmt->execute([':proposal_id' => $proposalId]);
        $snapshots = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Add version numbers - oldest gets v1, newest gets highest version number
        foreach ($snapshots as $index => &$snapshot) {
            $snapshot['version_number'] = $index + 1;
        }
        
        return $snapshots;
    }

    public function getPdfSnapshot($snapshotId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM proposal_pdf_snapshots 
            WHERE snapshot_id = :snapshot_id
        ");
        $stmt->execute([':snapshot_id' => $snapshotId]);
        $snapshot = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($snapshot) {
            // Calculate version number for this snapshot
            $versionStmt = $this->db->prepare("
                SELECT COUNT(*) 
                FROM proposal_pdf_snapshots 
                WHERE proposal_id = :proposal_id 
                AND generated_at <= :generated_at
            ");
            $versionStmt->execute([
                ':proposal_id' => $snapshot['proposal_id'],
                ':generated_at' => $snapshot['generated_at']
            ]);
            $snapshot['version_number'] = (int) $versionStmt->fetchColumn();
        }
        
        return $snapshot;
    }

    public function getNextVersionNumber($proposalId)
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) 
            FROM proposal_pdf_snapshots 
            WHERE proposal_id = :proposal_id
        ");
        $stmt->execute([':proposal_id' => $proposalId]);
        return (int) $stmt->fetchColumn() + 1;
    }

    // New methods for proposal item piece materials
    public function getProposalItemPiece($proposalItemPieceId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM proposal_item_pieces 
            WHERE proposal_item_piece_id = :proposal_item_piece_id AND is_active = 1
        ");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getProposalItemPieceMaterials($proposalItemPieceId)
    {
        try {
            error_log("ProposalModel::getProposalItemPieceMaterials - Fetching materials for piece ID: " . $proposalItemPieceId);
            
            $stmt = $this->db->prepare("
                SELECT 
                    m.id as material_id,
                    m.name,
                    m.code,
                    m.color,
                    m.type,
                    m.style,
                    m.description,
                    pipm.custom_description,
                    pipm.sort_order,
                    mi.image_path as material_image_path
                FROM proposal_item_piece_materials pipm
                JOIN material m ON pipm.material_id = m.id
                LEFT JOIN material_image mi ON m.id = mi.material_id AND mi.image_id = (
                    SELECT MIN(mi2.image_id) 
                    FROM material_image mi2 
                    WHERE mi2.material_id = m.id
                )
                WHERE pipm.proposal_item_piece_id = :proposal_item_piece_id
                ORDER BY pipm.sort_order ASC, pipm.created_at ASC
            ");
            $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
            $materials = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            error_log("ProposalModel::getProposalItemPieceMaterials - Found " . count($materials) . " materials");
            
            // Debug: Log material data structure
            foreach ($materials as $index => $material) {
                error_log("Material $index: " . json_encode($material));
            }
            
            return $materials;
        } catch (\Exception $e) {
            error_log("ProposalModel::getProposalItemPieceMaterials - Error: " . $e->getMessage());
            error_log("ProposalModel::getProposalItemPieceMaterials - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    public function addMaterialToProposalItemPiece($proposalItemPieceId, $materialId, $customDescription = null, $sortOrder = null)
    {
        // If no sort order provided, get the next available one
        if ($sortOrder === null) {
            $sortOrder = $this->getNextMaterialSortOrder($proposalItemPieceId);
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO proposal_item_piece_materials (proposal_item_piece_id, material_id, custom_description, sort_order)
            VALUES (:proposal_item_piece_id, :material_id, :custom_description, :sort_order)
            ON DUPLICATE KEY UPDATE 
                custom_description = VALUES(custom_description),
                sort_order = VALUES(sort_order),
                updated_at = NOW()
        ");
        return $stmt->execute([
            ':proposal_item_piece_id' => $proposalItemPieceId,
            ':material_id' => $materialId,
            ':custom_description' => $customDescription,
            ':sort_order' => $sortOrder
        ]);
    }

    private function getNextMaterialSortOrder($proposalItemPieceId)
    {
        $stmt = $this->db->prepare("
            SELECT COALESCE(MAX(sort_order), -1) + 1 as next_sort_order
            FROM proposal_item_piece_materials
            WHERE proposal_item_piece_id = :proposal_item_piece_id
        ");
        $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result['next_sort_order'];
    }

    public function removeMaterialFromProposalItemPiece($proposalItemPieceId, $materialId)
    {
        $stmt = $this->db->prepare("
            DELETE FROM proposal_item_piece_materials 
            WHERE proposal_item_piece_id = :proposal_item_piece_id AND material_id = :material_id
        ");
        return $stmt->execute([
            ':proposal_item_piece_id' => $proposalItemPieceId,
            ':material_id' => $materialId
        ]);
    }

    public function updateProposalItemPieceMaterials($proposalItemPieceId, $materialIds)
    {
        try {
            $this->db->beginTransaction();
            
            // Remove all existing materials for this piece
            $stmt = $this->db->prepare("
                DELETE FROM proposal_item_piece_materials 
                WHERE proposal_item_piece_id = :proposal_item_piece_id
            ");
            $stmt->execute([':proposal_item_piece_id' => $proposalItemPieceId]);
            
            // Add new materials
            if (!empty($materialIds)) {
                $stmt = $this->db->prepare("
                    INSERT INTO proposal_item_piece_materials (proposal_item_piece_id, material_id, sort_order)
                    VALUES (:proposal_item_piece_id, :material_id, :sort_order)
                ");
                
                foreach ($materialIds as $index => $materialId) {
                    $stmt->execute([
                        ':proposal_item_piece_id' => $proposalItemPieceId,
                        ':material_id' => $materialId,
                        ':sort_order' => $index
                    ]);
                }
            }
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function updateMaterialOrder($proposalItemPieceId, $materialOrders)
    {
        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("
                UPDATE proposal_item_piece_materials 
                SET sort_order = :sort_order, updated_at = NOW()
                WHERE proposal_item_piece_id = :proposal_item_piece_id AND material_id = :material_id
            ");
            
            foreach ($materialOrders as $order) {
                $stmt->execute([
                    ':proposal_item_piece_id' => $proposalItemPieceId,
                    ':material_id' => $order['material_id'],
                    ':sort_order' => $order['sort_order']
                ]);
            }
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function createOrGetMaterial($piece)
    {
        // If material_id is already set, return it
        if (isset($piece['material_id']) && $piece['material_id']) {
            return $piece['material_id'];
        }

        // Try to find existing material by name
        $materialModel = new \App\Models\MaterialModel();
        $existingMaterial = $materialModel->getByName($piece['material_name']);
        
        if ($existingMaterial) {
            return $existingMaterial['id'];
        }

        // Create new material with INSERT IGNORE logic
        $materialData = [
            'name' => $piece['material_name'],
            'code' => $piece['material_code'] ?? '',
            'color' => $piece['material_color'] ?? '',
            'type' => $piece['material_type'] ?? '',
            'style' => $piece['material_style'] ?? '',
            'description' => $piece['material_description'] ?? ''
        ];

        return $materialModel->createOrGet($materialData);
    }

    public function getProposalItemMetadata($proposalItemId)
    {
        try {
            error_log("ProposalModel::getProposalItemMetadata - Fetching metadata for proposal item ID: " . $proposalItemId);
            
            $stmt = $this->db->prepare("
                SELECT 
                    proposal_item_metadata_id,
                    proposal_item_id,
                    key_name,
                    value,
                    created_at
                FROM proposal_item_metadata
                WHERE proposal_item_id = :proposal_item_id
                ORDER BY created_at ASC
            ");
            
            $stmt->execute([':proposal_item_id' => $proposalItemId]);
            $metadata = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            error_log("ProposalModel::getProposalItemMetadata - Found " . count($metadata) . " metadata entries");
            
            return $metadata;
        } catch (\Exception $e) {
            error_log("ProposalModel::getProposalItemMetadata - Error: " . $e->getMessage());
            error_log("ProposalModel::getProposalItemMetadata - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Update proposal currency
     * @param int $proposalId
     * @param string $currencyCode
     * @param float|null $exchangeRateUsed
     * @param string $exchangeRateDate
     * @return bool
     */
    public function updateProposalCurrency($proposalId, $currencyCode, $exchangeRateUsed = null)
    {
        try {
            $stmt = $this->db->prepare("
                UPDATE proposals 
                SET currency_code = :currency_code,
                    exchange_rate_used = :exchange_rate_used,
                    updated_at = NOW()
                WHERE proposal_id = :proposal_id
            ");
            
            $result = $stmt->execute([
                ':proposal_id' => $proposalId,
                ':currency_code' => $currencyCode,
                ':exchange_rate_used' => $exchangeRateUsed
            ]);
            
            error_log("ProposalModel::updateProposalCurrency - Updated proposal {$proposalId} currency to {$currencyCode}");
            
            return $result;
        } catch (\Exception $e) {
            error_log("ProposalModel::updateProposalCurrency - Error: " . $e->getMessage());
            throw $e;
        }
    }
}
