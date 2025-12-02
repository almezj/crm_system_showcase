<?php

namespace App\Libraries;

use App\Models\ProposalModel;
use App\Models\PersonModel;
use App\Models\ProductMetadataModel;
use App\Utils\FileUploader;

// Remove the require statement that might be causing issues
// require __DIR__ . '/../Utils/vendor/autoload.php';

class ProposalLibrary
{
    private $proposalModel;
    private $personModel;
    private $productMetadataModel;

    public function __construct()
    {
        $this->proposalModel = new ProposalModel();
        $this->personModel = new PersonModel();
        $this->productMetadataModel = new ProductMetadataModel();
    }

    public function createProposal($data)
    {
        // Get current user ID if available
        $userId = null;
        if (isset($data['user_id'])) {
            $userId = $data['user_id'];
        } else {
            // Try to get from session
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $token = str_replace('Bearer ', '', $headers['Authorization']);
                $sessionModel = new \App\Models\SessionModel();
                $session = $sessionModel->getSessionByToken($token);
                if ($session && isset($session['user_id'])) {
                    $userId = $session['user_id'];
                }
            }
        }
        
        $data['created_by'] = $userId;
        
        // Validate currency
        $currencyUtils = new \App\Utils\CurrencyUtils();
        $currencyCode = $data['currency_code'] ?? 'CZK';
        
        if (!$currencyUtils->isValidCurrency($currencyCode)) {
            throw new \Exception("Invalid currency code: {$currencyCode}");
        }
        
        // Check exchange rate if not CZK
        if ($currencyCode !== 'CZK') {
            $exchangeRate = $currencyUtils->getExchangeRate($currencyCode, 'CZK');
            if ($exchangeRate === null) {
                throw new \Exception("Exchange rate not available for {$currencyCode} to CZK");
            }
            error_log("ProposalLibrary::createProposal - Using exchange rate: {$exchangeRate} for {$currencyCode} to CZK");
        }
        
        // Validate mandatory metadata fields for each item
        foreach ($data['items'] as $itemIndex => $item) {
            if (isset($item['product_id']) && $item['product_id']) {
                $this->validateMandatoryMetadata($item, $itemIndex);
            }
        }
        
        $proposalId = $this->proposalModel->createProposal($data);

        foreach ($data['items'] as $itemIndex => $item) {
            $proposalItemId = $this->proposalModel->addProposalItem($proposalId, $item);

            if ($proposalItemId && isset($item['temp_key'])) {
                $this->linkTempImagesToProposalItem($item['temp_key'], $proposalItemId);
            }

            // Handle pieces for this item
            if (isset($item['pieces']) && is_array($item['pieces'])) {
                foreach ($item['pieces'] as $pieceIndex => $piece) {
                    try {
                        // Validate required piece fields
                        if (empty($piece['piece_id'])) {
                            throw new \Exception("Piece ID is required for piece $pieceIndex");
                        }
                        
                        // Clean piece data for new multiple materials structure
                        $cleanPiece = [
                            'piece_id' => $piece['piece_id'],
                            'description' => $piece['description'] ?? null,
                            'materials' => $piece['materials'] ?? []
                        ];
                        
                        // Add the piece to the proposal item
                        $this->proposalModel->addProposalPiece($proposalItemId, $cleanPiece);
                    } catch (\Exception $e) {
                        error_log("Error adding piece $pieceIndex to proposal item $proposalItemId: " . $e->getMessage());
                        throw $e;
                    }
                }
            }
        }

        return ['proposal_id' => $proposalId];
    }

    private function validateMandatoryMetadata($item, $itemIndex) {
        // Get product metadata to check mandatory fields
        $productModel = new \App\Models\ProductModel();
        $productMetadata = $productModel->getProductMetadata($item['product_id']);
        
        $mandatoryFields = [];
        foreach ($productMetadata as $metadata) {
            if ($metadata['is_mandatory']) {
                $mandatoryFields[] = $metadata['key_name'];
            }
        }
        
        if (empty($mandatoryFields)) {
            return; // No mandatory fields to validate
        }
        
        // Check if item has metadata
        $itemMetadata = $item['item_metadata'] ?? [];
        $providedFields = [];
        foreach ($itemMetadata as $metadata) {
            if (!empty($metadata['value'])) {
                $providedFields[] = $metadata['key_name'];
            }
        }
        
        // Find missing mandatory fields
        $missingFields = array_diff($mandatoryFields, $providedFields);
        
        if (!empty($missingFields)) {
            $missingFieldsList = implode(', ', $missingFields);
            throw new \Exception("Item " . ($itemIndex + 1) . " is missing mandatory metadata fields: " . $missingFieldsList);
        }
    }

    public function getProposalById($id)
    {
        try {
            error_log("ProposalLibrary::getProposalById - Fetching proposal with ID: " . $id);
            
            $proposal = $this->proposalModel->getProposal($id);
            if (!$proposal) {
                error_log("ProposalLibrary::getProposalById - Proposal not found with ID: " . $id);
                return null;
            }
            
            error_log("ProposalLibrary::getProposalById - Proposal found: " . json_encode($proposal));
        } catch (\Exception $e) {
            error_log("ProposalLibrary::getProposalById - Error: " . $e->getMessage());
            error_log("ProposalLibrary::getProposalById - Stack trace: " . $e->getTraceAsString());
            throw $e;
        }

        // Get customer information with error handling
        if (isset($proposal['prospect_id']) && $proposal['prospect_id']) {
            try {
                error_log("ProposalLibrary::getProposalById - Fetching customer for prospect_id: " . $proposal['prospect_id']);
                $customer = $this->personModel->get($proposal['prospect_id']);
                if ($customer) {
                    $proposal['customer'] = $customer;
                    error_log("ProposalLibrary::getProposalById - Customer found: " . json_encode($customer));
                } else {
                    // Customer not found, create a placeholder
                    $proposal['customer'] = [
                        'first_name' => 'Unknown',
                        'last_name' => 'Customer',
                        'email' => 'N/A',
                        'phone' => 'N/A',
                        'addresses' => []
                    ];
                    error_log("Customer not found for prospect_id: " . $proposal['prospect_id']);
                }
            } catch (\Exception $e) {
                error_log("Error fetching customer data: " . $e->getMessage());
                // Create a placeholder customer
                $proposal['customer'] = [
                    'first_name' => 'Unknown',
                    'last_name' => 'Customer',
                    'email' => 'N/A',
                    'phone' => 'N/A',
                    'addresses' => []
                ];
            }
        } else {
            // No prospect_id, create a placeholder
            $proposal['customer'] = [
                'first_name' => 'Unknown',
                'last_name' => 'Customer',
                'email' => 'N/A',
                'phone' => 'N/A',
                'addresses' => []
            ];
            error_log("No prospect_id found in proposal: " . $id);
        }

        // Get items with images
        try {
            error_log("ProposalLibrary::getProposalById - Getting items for proposal ID: " . $id);
            $items = $this->proposalModel->getProposalItems($proposal['proposal_id']);
            error_log("ProposalLibrary::getProposalById - Found " . count($items) . " items");
        } catch (\Exception $e) {
            error_log("ProposalLibrary::getProposalById - Error getting items: " . $e->getMessage());
            $items = [];
        }
        
        // For each item, get all available images (uploaded + product images)
        foreach ($items as &$item) {
            try {
                error_log("ProposalLibrary::getProposalById - Processing images for item ID: " . $item['proposal_item_id']);
                
                $allImages = [];
                
                // Add uploaded images first (these take priority)
                if (!empty($item['images']) && is_array($item['images'])) {
                    foreach ($item['images'] as $image) {
                        if (!empty($image['image_url'])) {
                            $allImages[] = [
                                'image_id' => $image['image_id'],
                                'image_url' => $image['image_url'],
                                'description' => $image['description'] ?? '',
                                'is_uploaded' => true,
                                'sort_order' => $image['sort_order'] ?? 0
                            ];
                        }
                    }
                }
                
                // Add product images if the item has a product_id
                if (!empty($item['product_id'])) {
                    try {
                        $productImageModel = new \App\Models\ProductImageModel();
                        $productImages = $productImageModel->getByProduct($item['product_id']);
                        
                        foreach ($productImages as $productImage) {
                            $allImages[] = [
                                'image_id' => 'product_' . $productImage['product_image_id'],
                                'image_url' => $productImage['image_url'],
                                'description' => '',
                                'is_uploaded' => false,
                                'is_primary' => $productImage['is_primary'] ?? false,
                                'sort_order' => $productImage['is_primary'] ? 0 : 999 // Primary images first
                            ];
                        }
                    } catch (\Exception $e) {
                        error_log("ProposalLibrary::getProposalById - Error getting product images for product ID " . $item['product_id'] . ": " . $e->getMessage());
                    }
                }
                
                // Sort images: uploaded images first, then primary product image, then other product images
                usort($allImages, function($a, $b) {
                    if ($a['is_uploaded'] && !$b['is_uploaded']) return -1;
                    if (!$a['is_uploaded'] && $b['is_uploaded']) return 1;
                    if (!$a['is_uploaded'] && !$b['is_uploaded']) {
                        if ($a['is_primary'] && !$b['is_primary']) return -1;
                        if (!$a['is_primary'] && $b['is_primary']) return 1;
                    }
                    return $a['sort_order'] - $b['sort_order'];
                });
                
                $item['all_images'] = $allImages;
                error_log("ProposalLibrary::getProposalById - Processed " . count($allImages) . " images for item ID: " . $item['proposal_item_id']);
            } catch (\Exception $e) {
                error_log("ProposalLibrary::getProposalById - Error processing images for item ID " . $item['proposal_item_id'] . ": " . $e->getMessage());
                $item['all_images'] = [];
            }
            
            // Get pieces for this item
            try {
                error_log("ProposalLibrary::getProposalById - Getting pieces for item ID: " . $item['proposal_item_id']);
                $pieces = $this->proposalModel->getProposalPieces($item['proposal_item_id']);
                $item['pieces'] = $pieces;
                error_log("ProposalLibrary::getProposalById - Found " . count($pieces) . " pieces for item ID: " . $item['proposal_item_id']);
            } catch (\Exception $e) {
                error_log("ProposalLibrary::getProposalById - Error getting pieces for item ID " . $item['proposal_item_id'] . ": " . $e->getMessage());
                $item['pieces'] = [];
            }
            
            // Get metadata for this item
            try {
                error_log("ProposalLibrary::getProposalById - Getting metadata for item ID: " . $item['proposal_item_id']);
                $metadata = $this->proposalModel->getProposalItemMetadata($item['proposal_item_id']);
                $item['metadata'] = $metadata;
                error_log("ProposalLibrary::getProposalById - Found " . count($metadata) . " metadata entries for item ID: " . $item['proposal_item_id']);
            } catch (\Exception $e) {
                error_log("ProposalLibrary::getProposalById - Error getting metadata for item ID " . $item['proposal_item_id'] . ": " . $e->getMessage());
                $item['metadata'] = [];
            }
        }
        
        $proposal['items'] = $items;
        return $proposal;
    }

    public function getProposals($page = 1, $limit = 10)
    {
        try {
            $result = $this->proposalModel->getProposals($page, $limit);
            
            // Ensure we have the expected structure
            if (!isset($result['proposals']) || !is_array($result['proposals'])) {
                error_log("ProposalLibrary::getProposals - getProposals() returned unexpected structure: " . json_encode($result));
                return [
                    'proposals' => [],
                    'pagination' => [
                        'current_page' => 1,
                        'per_page' => $limit,
                        'total' => 0,
                        'total_pages' => 0
                    ]
                ];
            }
            
            // Calculate total price for each proposal (gross prices including VAT)
            foreach ($result['proposals'] as &$proposal) {
                $items = $this->proposalModel->getProposalItems($proposal['proposal_id']);
                $total = 0;
                foreach ($items as $item) {
                    $total += ($item['quantity'] * $item['final_price']); // final_price is now gross (including VAT)
                }
                $proposal['total_price'] = $total; // This is now the gross total including VAT
            }
            
            return $result;
        } catch (\Exception $e) {
            error_log("ProposalLibrary::getProposals - Error: " . $e->getMessage());
            error_log("ProposalLibrary::getProposals - Stack trace: " . $e->getTraceAsString());
            return [
                'proposals' => [],
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $limit,
                    'total' => 0,
                    'total_pages' => 0
                ]
            ];
        }
    }

    public function updateProposal($id, $data)
    {
        // Get current user ID if available
        $userId = null;
        if (isset($data['user_id'])) {
            $userId = $data['user_id'];
        } else {
            // Try to get from session
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $token = str_replace('Bearer ', '', $headers['Authorization']);
                $sessionModel = new \App\Models\SessionModel();
                $session = $sessionModel->getSessionByToken($token);
                if ($session && isset($session['user_id'])) {
                    $userId = $session['user_id'];
                }
            }
        }
        
        // Add user ID to data for logging
        $data['modified_by'] = $userId;
        
        // Process temp images for items that have them
        if (isset($data['items']) && is_array($data['items'])) {
            error_log("ProposalLibrary::updateProposal - Processing " . count($data['items']) . " items");
            foreach ($data['items'] as $index => $item) {
                error_log("ProposalLibrary::updateProposal - Item $index: proposal_item_id=" . ($item['proposal_item_id'] ?? 'null') . ", temp_key=" . ($item['temp_key'] ?? 'null'));
                if (isset($item['temp_key']) && !empty($item['temp_key'])) {
                    // This item has temp images that need to be processed
                    // We'll link them after the proposal item is created/updated
                    error_log("ProposalLibrary::updateProposal - Found item with temp_key: " . $item['temp_key']);
                }
            }
        }
        
        $result = $this->proposalModel->updateProposal($id, $data);
        
        // After updating the proposal, link temp images to their proposal items
        if (isset($data['items']) && is_array($data['items'])) {
            error_log("ProposalLibrary::updateProposal - Linking temp images for " . count($data['items']) . " items");
            foreach ($data['items'] as $index => $item) {
                error_log("ProposalLibrary::updateProposal - Linking item $index: proposal_item_id=" . ($item['proposal_item_id'] ?? 'null') . ", temp_key=" . ($item['temp_key'] ?? 'null'));
                if (isset($item['temp_key']) && !empty($item['temp_key'])) {
                    // Get the proposal item ID - it could be existing or newly created
                    $proposalItemId = null;
                    
                    if (isset($item['proposal_item_id'])) {
                        // Existing item
                        $proposalItemId = $item['proposal_item_id'];
                        error_log("ProposalLibrary::updateProposal - Using existing proposal_item_id: " . $proposalItemId);
                    } else {
                        // New item - we need to find it by temp_key or other identifying info
                        // For now, we'll assume the model handles this in updateProposal
                        // and we can get the item ID from the result
                        error_log("ProposalLibrary::updateProposal - New item with temp_key, need to find proposal_item_id");
                    }
                    
                    if ($proposalItemId) {
                        try {
                            error_log("ProposalLibrary::updateProposal - Attempting to link temp images for temp_key: " . $item['temp_key'] . " to proposal_item_id: " . $proposalItemId);
                            $this->linkTempImagesToProposalItem($item['temp_key'], $proposalItemId);
                            error_log("ProposalLibrary::updateProposal - Successfully linked temp images for item: " . $proposalItemId);
                        } catch (\Exception $e) {
                            error_log("ProposalLibrary::updateProposal - Error linking temp images: " . $e->getMessage());
                        }
                    } else {
                        error_log("ProposalLibrary::updateProposal - No proposal_item_id found for temp_key: " . $item['temp_key']);
                    }
                }
            }
        }
        
        return $result;
    }

    public function deleteProposal($id)
    {
        return $this->proposalModel->deleteProposal($id);
    }

    public function uploadItemImage($proposalItemId, $file, $description)
    {
        // Get the proposal_id for the proposal_item_id
        $proposalId = $this->proposalModel->getProposalIdFromItemId($proposalItemId);
        
        // Use the simplified directory structure: uploads/proposals/{proposal_id}/{proposal_item_id}/
        $directory = 'uploads/proposals/' . $proposalId . '/' . $proposalItemId;
        $filePath = FileUploader::upload($file, $directory);
        return $this->proposalModel->addItemImage($proposalItemId, $filePath, $description);
    }

    public function getItemImages($proposalItemId)
    {
        return $this->proposalModel->getItemImages($proposalItemId);
    }

    public function updateItemImageDescription($imageId, $description)
    {
        return $this->proposalModel->updateItemImageDescription($imageId, $description);
    }

    public function reorderItemImages($proposalItemId, $imageOrder)
    {
        return $this->proposalModel->reorderItemImages($proposalItemId, $imageOrder);
    }

    public function deleteItemImage($imageId)
    {
        return $this->proposalModel->deleteItemImage($imageId);
    }

    /**
     * Get the next version number for a proposal efficiently
     */
    public function getNextVersionNumber($proposalId)
    {
        return $this->proposalModel->getNextVersionNumber($proposalId);
    }

    public function generateProposalPDF($proposalId, $userName = null)
    {
        $proposal = $this->getProposalById($proposalId);
        if (!$proposal) {
            throw new \Exception("Proposal not found.");
        }
        // Generate HTML from proposal data, pass userName
        $html = $this->generateProposalHTML($proposal, $userName);
        // Get the next version number for this proposal
        $nextVersion = $this->getNextVersionNumber($proposalId);
        
        // Convert HTML to PDF
        $pdfResult = $this->generatePDF($html, "CN_{$proposalId}_{$nextVersion}.pdf");
        return $pdfResult;
    }

    private function generateProposalHTML($proposal, $userName = null)
    {
        $config = include __DIR__ . '/../../config/config.php';
        ob_start();
        include __DIR__ . '/../Templates/general-proposal.html';

        $html = ob_get_clean();

        // Replace top-level placeholders
        $html = str_replace('{{proposal_id}}', $proposal['proposal_id'], $html);

        $created_at = date('d. m. Y', strtotime($proposal['created_at']));
        $html = str_replace('{{date}}', $created_at, $html);

        $valid_until = date('d. m. Y', strtotime($proposal['valid_until']));
        $html = str_replace('{{valid_until}}', $valid_until, $html);

        // Format customer data
        $customer = $proposal['customer'];
        $customerName = $customer['first_name'] . ' ' . $customer['last_name'];
        $html = str_replace('{{customer_name}}', $customerName, $html);

        // Get customer's primary address
        $customerAddress = '';
        if (!empty($customer['addresses'])) {
            $primaryAddress = $customer['addresses'][0]; // Get the first address
            $customerAddress = sprintf(
                "%s<br>%s<br>%s %s<br>%s",
                $primaryAddress['street'],
                $primaryAddress['city'],
                $primaryAddress['postal_code'],
                $primaryAddress['state_province'],
                $primaryAddress['country']
            );
        }

        // Replace customer address and contact info
        $html = str_replace('{{customer_address}}', $customerAddress, $html);
        $html = str_replace('{{customer_phone}}', $customer['phone'] ?? '', $html);
        $html = str_replace('{{customer_email}}', $customer['email'] ?? '', $html);

        // Replace processed by user info
        $processedBy = $userName ?? ($proposal['userName'] ?? '');
        $html = str_replace('{{user_name}}', $processedBy, $html);
        $processedPhone = $proposal['userPhone'] ?? '';
        $html = str_replace('{{user_phone}}', $processedPhone, $html);

        // Process items and calculate totals
        $itemHtml = '';
        $subtotal = 0;
        foreach ($proposal['items'] as $item) {
            $itemTotal = $item['quantity'] * $item['final_price'];
            $subtotal += $itemTotal;

            // Get material from product metadata if product_id exists
            $material = 'Hedvábí'; // Default material
            if (!empty($item['product_id'])) {
                $metadata = $this->productMetadataModel->getByProduct($item['product_id']);
                foreach ($metadata as $meta) {
                    if ($meta['key_name'] === 'material') {
                        $material = $meta['value'];
                        break;
                    }
                }
            }

            $newItemHtml = '<tr>
                      <td class="cs-width_3">' . htmlspecialchars($item['item_name']) . '</td>
                      <td class="cs-width_2">Materiál:<br>' . htmlspecialchars($material) . '</td>
                      <td class="cs-width_2">Množství:<br>' . $item['quantity'] . '</td>
                      <td class="cs-width_3 cs-text_right"><br>' . number_format($item['final_price'], 2) . ' Kč / kus</td>
                      <td class="cs-width_3 cs-text_right"><br><b>' . number_format($itemTotal, 2) . ' Kč</b></td>
                    </tr>';
            if (!empty($item['images'])) {
                $newItemHtml .=
                    '<tr>
                      <td class="cs-width_3 border-top-zero" colspan="5">';
                foreach ($item['images'] as $image) {
                    $newItemHtml .= '<img class="item" src="' . $config['base_api_url'] . $image['image_url'] . '" />';
                }
                $newItemHtml .= '</td>
                    </tr>';
            }

            $newItemHtml .= '<tr>
                      <td class="cs-width_3 border-top-zero" colspan="5">
                        ' . htmlspecialchars($item['description']) . '
                      </td>
                    </tr>';

            $itemHtml .= $newItemHtml;
        }

        $html = str_replace('{{items}}', $itemHtml, $html);

        // Calculate VAT from gross prices using proposal snapshot vat_rate
        // Since prices are now stored INCLUDING VAT, calculate net and VAT from gross
        $vatRate = isset($proposal['vat_rate']) ? floatval($proposal['vat_rate']) : 0.21;
        $total = $subtotal; // Total is now the gross amount (including VAT)
        $subtotal = $total / (1 + $vatRate); // Calculate net amount (excluding VAT)
        $vat = $total - $subtotal; // Calculate VAT amount

        // Replace summary details
        $html = str_replace('{{subtotal}}', number_format($subtotal, 2), $html);
        $html = str_replace('{{vat}}', number_format($vat, 2), $html);
        $html = str_replace('{{total}}', number_format($total, 2), $html);
        $html = str_replace('{{vat_percent}}', (string)round($vatRate * 100), $html);

        return $html;
    }

    public function generatePDF($html, $filename)
    {
        $dompdf = new \Dompdf\Dompdf();
        
        // Configure DomPDF options for better compatibility and image quality
        $options = new \Dompdf\Options();
        $options->set([
            'isRemoteEnabled' => true,
            'defaultFont' => 'DejaVu Sans',
            'isFontSubsettingEnabled' => false, // Disable subsetting to ensure full character coverage
            'defaultMediaType' => 'screen',
            'isPhpEnabled' => false,
            'dpi' => 150,
            'imageCacheDir' => sys_get_temp_dir(),
            'enable_css_float' => true,
            'chroot' => realpath(__DIR__ . '/../../'), // Allow access to app root directory
            'debugKeepTemp' => false,
            'debugCss' => false,
            'debugLayout' => false,
            'debugLayoutLines' => false,
            'debugLayoutBlocks' => false,
            'debugLayoutInline' => false,
            'debugLayoutPaddingBox' => false,
            'fontHeightRatio' => 1.1, // Better line height for Czech characters
            'defaultPaperSize' => 'A4',
        ]);
        $dompdf->setOptions($options);
        
        // Use DejaVu Sans (better Czech character support) - no custom font registration needed
        // DomPDF's built-in DejaVu Sans has complete Czech character coverage
        
        // Clean whitespace between tags to prevent empty pages
        $html = preg_replace('/>\s+</', '><', $html);
        
        // Load and render the HTML with explicit UTF-8 encoding
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');

        try {
            $dompdf->render();
        } catch (\Exception $e) {
            error_log("DomPDF render error: " . $e->getMessage());
            throw new \Exception("PDF generation failed: " . $e->getMessage());
        }

        // Get the PDF content
        $output = $dompdf->output();
        
        // Check file size (10MB threshold)
        $fileSize = strlen($output);
        $maxSize = 10 * 1024 * 1024; // 10MB in bytes
        
        if ($fileSize > $maxSize) {
            // Save to file for download
            $downloadDir = __DIR__ . '/../../public/downloads/';
            if (!is_dir($downloadDir)) {
                mkdir($downloadDir, 0755, true);
            }
            
            $filePath = $downloadDir . $filename;
            file_put_contents($filePath, $output);
            
            return [
                'type' => 'download',
                'file_path' => '/downloads/' . $filename,
                'file_size' => $fileSize
            ];
        } else {
            // Convert to base64 for direct display
            $base64 = base64_encode($output);
            return [
                'type' => 'inline',
                'pdf_url' => 'data:application/pdf;base64,' . $base64,
                'file_size' => $fileSize
            ];
        }
    }

    public function addTempItemImage($tempKey, $filePath, $description)
    {
        return $this->proposalModel->addTempItemImage($tempKey, $filePath, $description);
    }

    public function updateTempItemImageDescription($tempImageId, $description)
    {
        return $this->proposalModel->updateTempItemImageDescription($tempImageId, $description);
    }

    public function linkTempImagesToProposalItem($tempKey, $proposalItemId)
    {
        $tempImages = $this->proposalModel->getTempImagesByKey($tempKey);
        error_log(print_r($tempKey, true));
        foreach ($tempImages as $tempImage) {
            // Move image from temporary to permanent storage using FileUploader
            $permanentPath = $this->moveImageToPermanentStorage($tempImage['image_url'], $proposalItemId);

            // Associate image with proposal item
            $this->proposalModel->addItemImage($proposalItemId, $permanentPath, $tempImage['description']);
        }

        // Clean up temporary images from database and filesystem
        $this->proposalModel->deleteTempImagesByKey($tempKey);
    }

    public function moveImageToPermanentStorage($tempPath, $proposalItemId)
    {
        // Define the source path (temp file location)
        // FileUploader now stores temp files in: public/uploads/proposals/temp/
        // and returns paths like: uploads/proposals/temp/filename.jpg
        $baseDir = __DIR__ . '/../../public/';
        $temporaryPath = $baseDir . $tempPath;
        
        // Check if temp file exists
        if (!file_exists($temporaryPath)) {
            error_log("Temp file not found: $temporaryPath");
            throw new \Exception("Temporary file not found: $tempPath");
        }
        
        // Get the proposal_id for the proposal_item_id
        $proposalId = $this->proposalModel->getProposalIdFromItemId($proposalItemId);
        
        // Define the permanent directory structure: uploads/proposals/{proposal_id}/{proposal_item_id}/
        $permanentBaseDir = __DIR__ . '/../../public/uploads/proposals/' . $proposalId . '/' . $proposalItemId;
        
        // Ensure the permanent directory exists
        if (!is_dir($permanentBaseDir)) {
            if (!mkdir($permanentBaseDir, 0775, true)) {
                error_log("Failed to create upload directory: $permanentBaseDir");
                throw new \Exception("Failed to create upload directory: $permanentBaseDir");
            }
        }
        
        // Check directory is writable
        if (!is_writable($permanentBaseDir)) {
            error_log("Upload directory is not writable: $permanentBaseDir");
            throw new \Exception("Upload directory is not writable: $permanentBaseDir");
        }
        
        $filename = basename($tempPath);
        $permanentPath = $permanentBaseDir . '/' . $filename;
        
        // Move the file
        if (!rename($temporaryPath, $permanentPath)) {
            error_log("Failed to move file from $temporaryPath to $permanentPath");
            throw new \Exception("Failed to move file to permanent storage");
        }
        
        // Return the relative path for storage in the database
        $relativePath = 'uploads/proposals/' . $proposalId . '/' . $proposalItemId . '/' . $filename;
        return $relativePath;
    }
    
    private function getProposalIdFromItemId($proposalItemId)
    {
        return $this->proposalModel->getProposalIdFromItemId($proposalItemId);
    }

    public function updateProposalStatus($proposalId, $statusId, $changedBy = null)
    {
        return $this->proposalModel->updateProposalStatus($proposalId, $statusId, $changedBy);
    }

    public function getStatusHistory($proposalId)
    {
        return $this->proposalModel->getStatusHistory($proposalId);
    }

    public function createPdfSnapshot($proposalId, $templateType, $pdfFilePath, $proposalData, $generatedBy = null)
    {
        return $this->proposalModel->createPdfSnapshot($proposalId, $templateType, $pdfFilePath, $proposalData, $generatedBy);
    }

    public function getPdfSnapshots($proposalId)
    {
        return $this->proposalModel->getPdfSnapshots($proposalId);
    }

    public function getPdfSnapshot($snapshotId)
    {
        return $this->proposalModel->getPdfSnapshot($snapshotId);
    }

    public function generatePDFWithSnapshot($html, $filename, $proposalId, $templateType, $proposalData, $generatedBy = null)
    {
        $dompdf = new \Dompdf\Dompdf();
        
        // Configure DomPDF options for better compatibility and image quality
        $options = new \Dompdf\Options();
        $options->set([
            'isRemoteEnabled' => true,
            'defaultFont' => 'DejaVu Sans',
            'isFontSubsettingEnabled' => false, // Disable subsetting to ensure full character coverage
            'defaultMediaType' => 'screen',
            'isPhpEnabled' => false,
            'dpi' => 150,
            'imageCacheDir' => sys_get_temp_dir(),
            'enable_css_float' => true,
            'chroot' => realpath(__DIR__ . '/../../'), // Allow access to app root directory
            'debugKeepTemp' => false,
            'debugCss' => false,
            'debugLayout' => false,
            'debugLayoutLines' => false,
            'debugLayoutBlocks' => false,
            'debugLayoutInline' => false,
            'debugLayoutPaddingBox' => false,
            'fontHeightRatio' => 1.1, // Better line height for Czech characters
            'defaultPaperSize' => 'A4',
        ]);
        $dompdf->setOptions($options);
        
        // Use DejaVu Sans (better Czech character support) - no custom font registration needed
        // DomPDF's built-in DejaVu Sans has complete Czech character coverage
        
        // Clean whitespace between tags to prevent empty pages
        $html = preg_replace('/>\s+</', '><', $html);
        
        // Load and render the HTML with explicit UTF-8 encoding
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');

        try {
            $dompdf->render();
        } catch (\Exception $e) {
            error_log("DomPDF render error: " . $e->getMessage());
            throw new \Exception("PDF generation failed: " . $e->getMessage());
        }

        // Get the PDF content
        $output = $dompdf->output();
        
        // Create snapshot directory
        $snapshotDir = __DIR__ . '/../../public/uploads/proposals/' . $proposalId . '/pdf-versions/';
        if (!is_dir($snapshotDir)) {
            mkdir($snapshotDir, 0755, true);
        }
        
        // Get the next version number for this proposal
        $nextVersion = $this->getNextVersionNumber($proposalId);
        
        // Generate filename using new format: CN_<proposal_id>_<version_number>
        $snapshotFilename = "CN_{$proposalId}_{$nextVersion}.pdf";
        $snapshotPath = $snapshotDir . $snapshotFilename;
        
        // Save PDF to snapshot location
        file_put_contents($snapshotPath, $output);
        
        // Create snapshot record in database
        $relativePath = 'uploads/proposals/' . $proposalId . '/pdf-versions/' . $snapshotFilename;
        $this->createPdfSnapshot($proposalId, $templateType, $relativePath, $proposalData, $generatedBy);
        
        // Check file size (10MB threshold)
        $fileSize = strlen($output);
        $maxSize = 10 * 1024 * 1024; // 10MB in bytes
        
        if ($fileSize > $maxSize) {
            // Save to file for download
            $downloadDir = __DIR__ . '/../../public/downloads/';
            if (!is_dir($downloadDir)) {
                mkdir($downloadDir, 0755, true);
            }
            
            $downloadFilename = "CN_{$proposalId}_{$nextVersion}.pdf";
            $filePath = $downloadDir . $downloadFilename;
            file_put_contents($filePath, $output);
            
            return [
                'type' => 'download',
                'file_path' => '/downloads/' . $downloadFilename,
                'file_size' => $fileSize,
                'snapshot_path' => $relativePath
            ];
        } else {
            // Convert to base64 for direct display
            $base64 = base64_encode($output);
            return [
                'type' => 'inline',
                'pdf_url' => 'data:application/pdf;base64,' . $base64,
                'file_size' => $fileSize,
                'snapshot_path' => $relativePath
            ];
        }
    }

    private function createOrGetMaterial($piece)
    {
        try {
            // If material_id is already set, return it
            if (isset($piece['material_id']) && $piece['material_id']) {
                error_log("Using existing material_id: " . $piece['material_id']);
                return $piece['material_id'];
            }

            // Try to find existing material by name
            $materialModel = new \App\Models\MaterialModel();
            $existingMaterial = $materialModel->getByName($piece['material_name']);
            
            if ($existingMaterial) {
                error_log("Found existing material: " . $existingMaterial['id']);
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

            error_log("Creating new material with data: " . json_encode($materialData, JSON_PRETTY_PRINT));
            $materialId = $materialModel->createOrGet($materialData);
            error_log("Created material with ID: " . $materialId);
            return $materialId;
        } catch (\Exception $e) {
            error_log("Error in createOrGetMaterial: " . $e->getMessage());
            error_log("Piece data: " . json_encode($piece, JSON_PRETTY_PRINT));
            throw $e;
        }
    }

    /**
     * Get product translation for specific language
     * @param int $productId
     * @param int $languageId
     * @return array|null
     */
    public function getProductTranslation($productId, $languageId)
    {
        $db = $this->proposalModel->getDb();
        $stmt = $db->prepare("
            SELECT pt.name, pt.base_price, l.currency_symbol, l.currency_code, l.name as language_name
            FROM product_translations pt
            JOIN languages l ON pt.language_id = l.language_id
            WHERE pt.product_id = :product_id AND pt.language_id = :language_id AND pt.is_active = 1 AND pt.deleted_at IS NULL
        ");
        $stmt->execute([
            ':product_id' => $productId,
            ':language_id' => $languageId
        ]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Get product price in specified currency with fallback hierarchy
     * @param int $productId
     * @param string $targetCurrency
     * @return array
     */
    public function getProductPriceInCurrency($productId, $targetCurrency)
    {
        $currencyUtils = new \App\Utils\CurrencyUtils();
        
        // Get language ID for target currency
        $languageId = $this->getLanguageIdByCurrency($targetCurrency);
        
        // Try to get translation for target currency
        $translation = $this->getProductTranslation($productId, $languageId);
        
        if ($translation && $translation['base_price'] > 0) {
            return [
                'price' => $translation['base_price'],
                'currency' => $targetCurrency,
                'source' => 'translation'
            ];
        }
        
        // Fallback to Czech translation (CZK)
        $czkLanguageId = $this->getLanguageIdByCurrency('CZK');
        $czkTranslation = $this->getProductTranslation($productId, $czkLanguageId);
        
        if ($czkTranslation && $czkTranslation['base_price'] > 0) {
            // Convert from CZK to target currency
            $exchangeRate = $currencyUtils->getExchangeRate('CZK', $targetCurrency);
            if ($exchangeRate) {
                $convertedPrice = $currencyUtils->convertFromCZK($czkTranslation['base_price'], $targetCurrency, $exchangeRate);
                return [
                    'price' => $convertedPrice,
                    'currency' => $targetCurrency,
                    'source' => 'converted_from_czk'
                ];
            }
        }
        
        // Final fallback to product base price
        $productModel = new \App\Models\ProductModel();
        $product = $productModel->get($productId);
        
        if ($product && $product['base_price'] > 0) {
            // Convert from CZK to target currency
            $exchangeRate = $currencyUtils->getExchangeRate('CZK', $targetCurrency);
            if ($exchangeRate) {
                $convertedPrice = $currencyUtils->convertFromCZK($product['base_price'], $targetCurrency, $exchangeRate);
                return [
                    'price' => $convertedPrice,
                    'currency' => $targetCurrency,
                    'source' => 'converted_from_base'
                ];
            }
        }
        
        return [
            'price' => 0,
            'currency' => $targetCurrency,
            'source' => 'no_price'
        ];
    }

    /**
     * Get language ID by currency code
     * @param string $currencyCode
     * @return int|null
     */
    private function getLanguageIdByCurrency($currencyCode)
    {
        $db = $this->proposalModel->getDb();
        $stmt = $db->prepare("
            SELECT language_id FROM languages 
            WHERE currency_code = :currency_code AND is_active = 1
            LIMIT 1
        ");
        $stmt->execute([':currency_code' => $currencyCode]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ? $result['language_id'] : null;
    }

    /**
     * Calculate item price for PDF generation with proposal currency
     * @param array $item
     * @param int $targetLanguageId
     * @param string $proposalCurrency
     * @param array $proposalData (contains exchange_rate_used)
     * @return array
     */
    public function calculateItemPriceForPdf($item, $targetLanguageId, $proposalCurrency, $proposalData = null)
    {
        $currencyUtils = new \App\Utils\CurrencyUtils();
        
        // Get target language data for product name
        $targetTranslation = $this->getProductTranslation($item['product_id'], $targetLanguageId);
        
        // Use translated name if available, otherwise use item name
        $displayName = $targetTranslation ? $targetTranslation['name'] : $item['item_name'];
        
        // Get the stored price in CZK
        $storedPriceCzk = $item['final_price'];
        
        // Convert from CZK back to proposal currency for display
        $displayPrice = $storedPriceCzk;
        if ($proposalCurrency !== 'CZK') {
            // Use the exchange rate that was used when the proposal was created
            $exchangeRate = $proposalData['exchange_rate_used'] ?? null;
            
            if ($exchangeRate) {
                // Convert from CZK back to the original currency using the same rate
                $displayPrice = $currencyUtils->convertFromCZK($storedPriceCzk, $proposalCurrency, $exchangeRate);
                error_log("calculateItemPriceForPdf - Converting {$storedPriceCzk} CZK back to {$proposalCurrency} using rate {$exchangeRate} = {$displayPrice}");
            } else {
                error_log("calculateItemPriceForPdf - No exchange rate found for proposal, using CZK price");
            }
        }
        
        // Get currency symbol
        $currencySymbol = $proposalCurrency === 'EUR' ? '€' : 'Kč';
        
        return [
            'item_name' => $displayName,
            'final_price' => $displayPrice,
            'currency_symbol' => $currencySymbol,
            'currency_code' => $proposalCurrency
        ];
    }

    /**
     * Update proposal currency
     * @param int $proposalId
     * @param string $newCurrencyCode
     * @return array
     */
    public function updateProposalCurrency($proposalId, $newCurrencyCode)
    {
        try {
            // Get current proposal
            $proposal = $this->proposalModel->getProposal($proposalId);
            if (!$proposal) {
                throw new \Exception("Proposal not found");
            }

            // Check if proposal is in draft status
            if ($proposal['proposal_status_id'] > 1) {
                throw new \Exception("Currency cannot be changed after proposal is sent");
            }

            // Validate currency
            $currencyUtils = new \App\Utils\CurrencyUtils();
            if (!$currencyUtils->isValidCurrency($newCurrencyCode)) {
                throw new \Exception("Invalid currency code: {$newCurrencyCode}");
            }

            // Get exchange rate if not CZK
            $exchangeRateUsed = null;
            
            if ($newCurrencyCode !== 'CZK') {
                $exchangeRateUsed = $currencyUtils->getExchangeRate($newCurrencyCode, 'CZK');
                if ($exchangeRateUsed === null) {
                    throw new \Exception("Exchange rate not available for {$newCurrencyCode} to CZK");
                }
            } else {
                $exchangeRateUsed = 1.0; // CZK to CZK rate is 1
            }

            // Update proposal currency
            $this->proposalModel->updateProposalCurrency($proposalId, $newCurrencyCode, $exchangeRateUsed);
            
            // Recalculate proposal total after currency change
            $this->proposalModel->recalculateProposalTotal($proposalId);

            return [
                'success' => true,
                'message' => 'Proposal currency updated successfully',
                'currency_code' => $newCurrencyCode,
                'exchange_rate_used' => $exchangeRateUsed
            ];

        } catch (\Exception $e) {
            error_log("ProposalLibrary::updateProposalCurrency - Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Calculate final price with custom pricing logic
     * @param array $item
     * @param int $targetLanguageId
     * @return array
     */
    public function calculateItemPriceForLanguage($item, $targetLanguageId)
    {
        $exchangeRateModel = new \App\Models\ExchangeRateModel();
        
        // Debug logging
        error_log("calculateItemPriceForLanguage - Item ID: " . $item['product_id'] . ", Target Language: " . $targetLanguageId);
        
        // Get target language data
        $targetTranslation = $this->getProductTranslation($item['product_id'], $targetLanguageId);
        error_log("calculateItemPriceForLanguage - Translation found: " . ($targetTranslation ? 'YES' : 'NO'));
        if ($targetTranslation) {
            error_log("calculateItemPriceForLanguage - Translation data: " . json_encode($targetTranslation));
        }
        
        if (!$targetTranslation) {
            // Fallback to original item data if no translation found
            error_log("calculateItemPriceForLanguage - No translation found, using fallback with currency conversion");
            
            // Get target language data for currency conversion
            $targetLanguageData = $this->getLanguageData($targetLanguageId);
            if (!$targetLanguageData) {
                error_log("calculateItemPriceForLanguage - Target language data not found, using CZK fallback");
                return [
                    'item_name' => $item['item_name'],
                    'final_price' => $item['final_price'],
                    'currency_symbol' => 'Kč',
                    'currency_code' => 'CZK'
                ];
            }
            
            // Get original currency from proposal item
            $originalCurrencyId = $item['price_currency_id'] ?? 1; // Default to CZK
            $originalCurrencyData = $this->getLanguageData($originalCurrencyId);
            $originalCurrency = $originalCurrencyData ? $originalCurrencyData['currency_code'] : 'CZK';
            
            $originalPrice = $item['final_price'];
            $targetCurrency = $targetLanguageData['currency_code'];
            $targetSymbol = $targetLanguageData['currency_symbol'];
            
            error_log("calculateItemPriceForLanguage - Converting " . $originalPrice . " " . $originalCurrency . " to " . $targetCurrency);
            
            try {
                // Debug: Check available exchange rates
                $availableRates = $exchangeRateModel->getAllExchangeRates();
                error_log("calculateItemPriceForLanguage - Available exchange rates: " . json_encode($availableRates));
                
                $convertedPrice = $exchangeRateModel->convertCurrency($originalPrice, $originalCurrency, $targetCurrency);
                error_log("calculateItemPriceForLanguage - Converted price: " . $convertedPrice);
                
                return [
                    'item_name' => $item['item_name'],
                    'final_price' => $convertedPrice,
                    'currency_symbol' => $targetSymbol,
                    'currency_code' => $targetCurrency
                ];
            } catch (\Exception $e) {
                error_log("calculateItemPriceForLanguage - Currency conversion failed: " . $e->getMessage());
                // Fallback to original price with target currency symbol
                return [
                    'item_name' => $item['item_name'],
                    'final_price' => $originalPrice,
                    'currency_symbol' => $targetSymbol,
                    'currency_code' => $targetCurrency
                ];
            }
        }

        $basePrice = $targetTranslation['base_price'];
        $currencySymbol = $targetTranslation['currency_symbol'];
        $currencyCode = $targetTranslation['currency_code'];

        // Check if item has custom pricing
        $customPricingData = null;
        if (!empty($item['custom_pricing_data'])) {
            $customPricingData = json_decode($item['custom_pricing_data'], true);
        }

        if ($customPricingData) {
            error_log("calculateItemPriceForLanguage - Custom pricing data found: " . json_encode($customPricingData));
            // Apply custom pricing logic
            if ($customPricingData['discount_type'] === 'percentage') {
                $finalPrice = $basePrice * (1 - $customPricingData['discount_value'] / 100);
                error_log("calculateItemPriceForLanguage - Applied percentage discount: " . $finalPrice);
            } else {
                // Absolute discount - need to convert to target currency
                $originalCurrency = $this->getLanguageCurrencyCode($customPricingData['original_currency_id']);
                $discountAmount = $customPricingData['discount_value'];
                
                error_log("calculateItemPriceForLanguage - Original currency: " . $originalCurrency . ", Target currency: " . $currencyCode);
                
                if ($originalCurrency !== $currencyCode) {
                    try {
                        $discountAmount = $exchangeRateModel->convertCurrency($discountAmount, $originalCurrency, $currencyCode);
                        error_log("calculateItemPriceForLanguage - Converted discount amount: " . $discountAmount);
                    } catch (\Exception $e) {
                        error_log("calculateItemPriceForLanguage - Exchange rate conversion failed: " . $e->getMessage());
                        // Fallback to original amount
                        $discountAmount = $customPricingData['discount_value'];
                    }
                }
                
                $finalPrice = max(0, $basePrice - $discountAmount);
                error_log("calculateItemPriceForLanguage - Applied absolute discount: " . $finalPrice);
            }
        } else {
            // Use base price from translation, but fallback to proposal item's final_price if base price is 0
            if ($basePrice > 0) {
                $finalPrice = $basePrice;
                error_log("calculateItemPriceForLanguage - Using base price from translation: " . $finalPrice);
            } else {
                // Base price is 0, use the custom final_price from proposal item
                $originalPrice = $item['final_price'];
                $originalCurrencyId = $item['price_currency_id'] ?? 1; // Default to CZK
                $originalCurrencyData = $this->getLanguageData($originalCurrencyId);
                $originalCurrency = $originalCurrencyData ? $originalCurrencyData['currency_code'] : 'CZK';
                
                // Convert from original currency to target currency if needed
                if ($originalCurrency !== $currencyCode) {
                    try {
                        $finalPrice = $exchangeRateModel->convertCurrency($originalPrice, $originalCurrency, $currencyCode);
                        error_log("calculateItemPriceForLanguage - Converted custom price from " . $originalCurrency . " to " . $currencyCode . ": " . $finalPrice);
                    } catch (\Exception $e) {
                        error_log("calculateItemPriceForLanguage - Currency conversion failed for custom price: " . $e->getMessage());
                        $finalPrice = $originalPrice; // Fallback to original price
                    }
                } else {
                    $finalPrice = $originalPrice;
                }
                error_log("calculateItemPriceForLanguage - Base price is 0, using proposal item final_price: " . $finalPrice);
            }
        }

        return [
            'item_name' => $targetTranslation['name'],
            'final_price' => $finalPrice, // Gross price (including VAT)
            'currency_symbol' => $currencySymbol,
            'currency_code' => $currencyCode
        ];
    }

    /**
     * Get currency code for language ID
     * @param int $languageId
     * @return string
     */
    private function getLanguageCurrencyCode($languageId)
    {
        $db = $this->proposalModel->getDb();
        $stmt = $db->prepare("
            SELECT currency_code FROM languages WHERE language_id = :language_id
        ");
        $stmt->execute([':language_id' => $languageId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result ? $result['currency_code'] : 'CZK';
    }

    /**
     * Get language data by ID
     * @param int $languageId
     * @return array|null
     */
    public function getLanguageData($languageId)
    {
        $db = $this->proposalModel->getDb();
        $stmt = $db->prepare("
            SELECT language_id, code, name, currency_code, currency_symbol
            FROM languages 
            WHERE language_id = :language_id AND is_active = 1
        ");
        $stmt->execute([':language_id' => $languageId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
