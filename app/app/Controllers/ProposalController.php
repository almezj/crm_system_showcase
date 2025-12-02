<?php

namespace App\Controllers;

use App\Libraries\ProposalLibrary;
use App\Libraries\OrderLibrary;
use App\Utils\FileUploader;
use App\Utils\JsonResponse;

class ProposalController
{
    private $proposalLibrary;
    private $simpleAuth;

    public function __construct()
    {
        $this->proposalLibrary = new ProposalLibrary();
        $this->simpleAuth = new \App\Utils\SimpleAuth();
    }

    public function createProposal()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        error_log("ProposalController::createProposal received data: " . json_encode($data, JSON_PRETTY_PRINT));

        if (!isset($data['prospect_id']) || empty($data['items'])) {
            JsonResponse::send(['error' => 'Please add at least one item to your proposal'], 400);
            return;
        }

        $result = $this->proposalLibrary->createProposal($data);
        error_log("ProposalController::createProposal result: " . json_encode($result, JSON_PRETTY_PRINT));
        JsonResponse::send($result, 201);
        return;
    }

    public function getProposal($id)
    {
        try {
            error_log("ProposalController::getProposal - Fetching proposal with ID: " . $id);
            
            // Add database connection debugging
            try {
                $db = \Config\Database::getConnection();
                error_log("ProposalController::getProposal - Database connection successful");
            } catch (\Exception $e) {
                error_log("ProposalController::getProposal - Database connection failed: " . $e->getMessage());
                JsonResponse::send(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
                return;
            }
            
            $proposal = $this->proposalLibrary->getProposalById($id);
            
            if ($proposal === null) {
                error_log("ProposalController::getProposal - Proposal not found, returning 404");
                JsonResponse::send(['error' => 'Proposal not found'], 404);
                return;
            }
            
            if (empty($proposal)) {
                error_log("ProposalController::getProposal - Proposal is empty");
                JsonResponse::send(['error' => 'Proposal data is empty'], 404);
                return;
            }
            
            error_log("ProposalController::getProposal - Proposal result: " . json_encode($proposal));
            JsonResponse::send($proposal);
            return;
        } catch (\Exception $e) {
            error_log("ProposalController::getProposal - Error: " . $e->getMessage());
            error_log("ProposalController::getProposal - Stack trace: " . $e->getTraceAsString());
            JsonResponse::send(['error' => 'Server error: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getAllProposals()
    {
        try {
            // Get pagination parameters from query string
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            
            // Validate parameters
            $page = max(1, $page);
            $limit = max(1, min(100, $limit)); // Limit between 1 and 100
            
            $result = $this->proposalLibrary->getProposals($page, $limit);
            
            // Ensure we always return the expected structure
            if (!isset($result['proposals']) || !is_array($result['proposals'])) {
                error_log("ProposalController::getAllProposals - getProposals() returned unexpected structure: " . json_encode($result));
                $result = [
                    'proposals' => [],
                    'pagination' => [
                        'current_page' => 1,
                        'per_page' => $limit,
                        'total' => 0,
                        'total_pages' => 0
                    ]
                ];
            }
            
            JsonResponse::send($result);
            return;
        } catch (\Exception $e) {
            error_log("ProposalController::getAllProposals - Error: " . $e->getMessage());
            error_log("ProposalController::getAllProposals - Stack trace: " . $e->getTraceAsString());
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    public function updateProposal($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
            return;
        }

        $result = $this->proposalLibrary->updateProposal($id, $data);
        JsonResponse::send($result);
        return;
    }

    public function deleteProposal($id)
    {
        $this->proposalLibrary->deleteProposal($id);
        JsonResponse::send(['message' => 'Proposal deleted successfully'], 204);
        return;
    }

    public function uploadItemImage($proposalItemId)
    {
        $data = $_FILES['image'];
        $description = $_POST['description'] ?? '';

        if (!$data) {
            JsonResponse::send(['error' => 'No file uploaded'], 400);
            return;
        }

        $result = $this->proposalLibrary->uploadItemImage($proposalItemId, $data, $description);
        JsonResponse::send($result, 201);
        return;
    }

    public function getItemImages($proposalItemId)
    {
        $images = $this->proposalLibrary->getItemImages($proposalItemId);
        JsonResponse::send($images);
        return;
    }

    public function updateItemImageDescription($imageId)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['description'])) {
            JsonResponse::send(['error' => 'Description is required'], 400);
            return;
        }

        $result = $this->proposalLibrary->updateItemImageDescription($imageId, $data['description']);
        JsonResponse::send($result);
        return;
    }

    public function updateProposalCurrency($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['currency_code'])) {
            JsonResponse::send(['error' => 'Currency code is required'], 400);
            return;
        }

        $result = $this->proposalLibrary->updateProposalCurrency($id, $data['currency_code']);
        JsonResponse::send($result);
        return;
    }

    public function reorderItemImages($proposalItemId)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['image_order']) || !is_array($data['image_order'])) {
                JsonResponse::send(['error' => 'Image order array is required'], 400);
                return;
            }

            error_log("[ProposalController] Reordering images for proposalItemId=$proposalItemId, image_order=" . json_encode($data['image_order']));
            
            $result = $this->proposalLibrary->reorderItemImages($proposalItemId, $data['image_order']);
            JsonResponse::send($result);
            return;
        } catch (\Exception $e) {
            error_log("[ProposalController] Error in reorderItemImages: " . $e->getMessage());
            error_log("[ProposalController] Stack trace: " . $e->getTraceAsString());
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    public function deleteItemImage($imageId)
    {
        $result = $this->proposalLibrary->deleteItemImage($imageId);
        JsonResponse::send($result);
        return;
    }

    public function generateProposalPDF($id)
    {
        try {
            // Get user info using SimpleAuth (Router already validated authentication)
            $user = $this->simpleAuth->getCurrentUser();
            $userName = null;
            $userPhone = null;
            $userId = null;
            
            if ($user) {
                $userId = $user['user_id'];
                $userName = $user['first_name'] . ' ' . $user['last_name'];
                $userPhone = $user['phone_number'] ?? null;
            }
            
            // Get all options from GET or POST
            $type = $_GET['type'] ?? $_POST['type'] ?? 'product_summary';
            $options = $_GET;
            unset($options['type']); // Remove type from options
            
            // Handle selectedImages parameter - convert from query string format to array
            if (isset($options['selectedImages']) && is_string($options['selectedImages'])) {
                $selectedImages = [];
                parse_str($options['selectedImages'], $selectedImages);
                // Normalize: ensure each value is an array
                foreach ($selectedImages as $key => $val) {
                    if (!is_array($val)) {
                        $selectedImages[$key] = [$val];
                    }
                }
                $options['selectedImages'] = $selectedImages;
            }
            
            // Handle selectedProductSummaryImages parameter - convert from query string format to array
            if (isset($options['selectedProductSummaryImages']) && is_string($options['selectedProductSummaryImages'])) {
                $selectedProductSummaryImages = [];
                parse_str($options['selectedProductSummaryImages'], $selectedProductSummaryImages);
                $options['selectedProductSummaryImages'] = $selectedProductSummaryImages;
            }
            
            // Clean proposal removed: no longer parse cleanProposalOptions
            
            // Handle prettyProposalOptions parameter
            if (isset($options['prettyProposalOptions'])) {
                // If it's a JSON string, decode it
                if (is_string($options['prettyProposalOptions'])) {
                    $decoded = json_decode($options['prettyProposalOptions'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $options['prettyProposalOptions'] = $decoded;
                    } else {
                        // Fallback: try parse_str for nested query string format
                        $parsed = [];
                        parse_str($options['prettyProposalOptions'], $parsed);
                        if (isset($parsed['prettyProposalOptions'])) {
                            $options['prettyProposalOptions'] = $parsed['prettyProposalOptions'];
                        }
                    }
                }
                // If it's already an array (from query string parsing), ensure nested arrays are properly structured
                if (is_array($options['prettyProposalOptions'])) {
                    // Ensure selectedProductImages is properly structured as arrays
                    if (isset($options['prettyProposalOptions']['selectedProductImages']) && is_array($options['prettyProposalOptions']['selectedProductImages'])) {
                        $normalizedSelectedImages = [];
                        foreach ($options['prettyProposalOptions']['selectedProductImages'] as $itemId => $imageIds) {
                            // Normalize item ID to string (to match database format)
                            $normalizedItemId = (string)$itemId;
                            // Ensure each item's images is an array and normalize image IDs to strings
                            if (!is_array($imageIds)) {
                                $imageIds = [$imageIds];
                            }
                            $normalizedSelectedImages[$normalizedItemId] = array_map('strval', $imageIds);
                        }
                        $options['prettyProposalOptions']['selectedProductImages'] = $normalizedSelectedImages;
                    }
                }
                
                // Debug logging
                error_log("ProposalController::generateProposalPDF - prettyProposalOptions: " . json_encode($options['prettyProposalOptions'] ?? []));
            }
            
            // Handle customSections parameter - convert from JSON string format to array
            if (isset($options['customSections']) && is_string($options['customSections'])) {
                // Try to decode as JSON first
                $decoded = json_decode($options['customSections'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $options['customSections'] = $decoded;
                } else {
                    // Fallback to parse_str if it's not JSON
                    $customSections = [];
                    parse_str($options['customSections'], $customSections);
                    
                    // Convert nested arrays properly for custom sections
                    if (isset($customSections['customSections'])) {
                        $options['customSections'] = $customSections['customSections'];
                    } else {
                        $options['customSections'] = $customSections;
                    }
                }
            }
            
            require_once __DIR__ . '/../PdfGenerators/ProposalPdfFactory.php';
            $factory = new \ProposalPdfFactory();
            $generator = $factory::create($type);
            

            
            // Get proposal data
            $proposal = $this->proposalLibrary->getProposalById($id);
            if (!$proposal) {
                throw new \Exception("Proposal not found.");
            }
            $proposal['userName'] = $userName;
            $proposal['userPhone'] = $userPhone;
            $html = $generator->generate($proposal, $options);
            
            // Get the next version number for this proposal
            $nextVersion = $this->proposalLibrary->getNextVersionNumber($id);
            
            // Generate PDF with snapshot
            $pdfResult = $this->proposalLibrary->generatePDFWithSnapshot($html, "CN_{$id}_{$nextVersion}.pdf", $id, $type, $proposal, $userId);
            
            // Return JSON response instead of directly outputting PDF
            JsonResponse::send($pdfResult);
            return;
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    public function getPdfSnapshots($id)
    {
        try {
            $snapshots = $this->proposalLibrary->getPdfSnapshots($id);
            JsonResponse::send($snapshots);
            return;
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    public function downloadPdfSnapshot($proposalId, $snapshotId)
    {
        try {
            // Check authentication - support Authorization header and query parameter
            $authenticated = false;
            $headers = getallheaders();
            
            // Try header-based authentication first
            if (isset($headers['Authorization'])) {
                try {
                    $authMiddleware = new \App\Middlewares\AuthMiddleware();
                    $userId = $authMiddleware->validateToken($headers);
                    $authenticated = ($userId !== null);
                } catch (\Exception $e) {
                    // Header auth failed, will try query parameter
                }
            }
            
            // If header auth failed, try query parameter
            if (!$authenticated && isset($_GET['token'])) {
                try {
                    $token = $_GET['token'];
                    $sessionModel = new \App\Models\SessionModel();
                    $session = $sessionModel->getSessionByToken($token);
                    
                    if ($session && $session['is_active'] && strtotime($session['expires_at']) > time()) {
                        $authenticated = true;
                    }
                } catch (\Exception $e) {
                    // Query parameter auth failed
                }
            }
            
            if (!$authenticated) {
                throw new \Exception("Authentication required to download PDF");
            }
            
            $snapshot = $this->proposalLibrary->getPdfSnapshot($snapshotId);
            if (!$snapshot || $snapshot['proposal_id'] != $proposalId) {
                throw new \Exception("Snapshot not found.");
            }
            
            $filePath = __DIR__ . '/../../public/' . $snapshot['pdf_file_path'];
            if (!file_exists($filePath)) {
                throw new \Exception("PDF file not found.");
            }
            
            // Set headers for file download
            $versionNumber = $snapshot['version_number'] ?? 'unknown';
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="CN_' . $proposalId . '_' . $versionNumber . '.pdf"');
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: no-cache, must-revalidate');
            header('Pragma: no-cache');
            
            // Output the file
            readfile($filePath);
            exit();
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    public function viewPdfSnapshot($proposalId, $snapshotId)
    {
        try {
            error_log("[PDF VIEW] Attempting to view snapshot: proposalId=$proposalId, snapshotId=$snapshotId");
            
            // Check authentication - support Authorization header and query parameter
            $authenticated = false;
            $headers = getallheaders();
            
            // Try header-based authentication first
            if (isset($headers['Authorization'])) {
                try {
                    $authMiddleware = new \App\Middlewares\AuthMiddleware();
                    $userId = $authMiddleware->validateToken($headers);
                    $authenticated = ($userId !== null);
                    error_log("[PDF VIEW] Header authentication successful for user: $userId");
                } catch (\Exception $e) {
                    error_log("[PDF VIEW] Header authentication failed: " . $e->getMessage());
                }
            }
            
            // If header auth failed, try query parameter
            if (!$authenticated && isset($_GET['token'])) {
                try {
                    $token = $_GET['token'];
                    $sessionModel = new \App\Models\SessionModel();
                    $session = $sessionModel->getSessionByToken($token);
                    
                    if ($session && $session['is_active'] && strtotime($session['expires_at']) > time()) {
                        $authenticated = true;
                        error_log("[PDF VIEW] Query parameter authentication successful");
                    } else {
                        error_log("[PDF VIEW] Query parameter authentication failed - invalid/expired token");
                    }
                } catch (\Exception $e) {
                    error_log("[PDF VIEW] Query parameter authentication error: " . $e->getMessage());
                }
            }
            
            if (!$authenticated) {
                error_log("[PDF VIEW] No valid authentication found");
                throw new \Exception("Authentication required to view PDF");
            }
            
            $snapshot = $this->proposalLibrary->getPdfSnapshot($snapshotId);
            error_log("[PDF VIEW] Raw snapshot data: " . json_encode($snapshot, JSON_PRETTY_PRINT));
            
            if (!$snapshot) {
                error_log("[PDF VIEW] Snapshot not found in database");
                throw new \Exception("Snapshot not found in database.");
            }
            
            if ($snapshot['proposal_id'] != $proposalId) {
                error_log("[PDF VIEW] Proposal ID mismatch: expected=$proposalId, got=" . $snapshot['proposal_id']);
                throw new \Exception("Snapshot not found for this proposal.");
            }
            
            if (empty($snapshot['pdf_file_path'])) {
                error_log("[PDF VIEW] PDF file path is empty in database");
                throw new \Exception("PDF file path is missing in database.");
            }
            
            $filePath = __DIR__ . '/../../public/' . $snapshot['pdf_file_path'];
            error_log("[PDF VIEW] Looking for file at: $filePath");
            
            if (!file_exists($filePath)) {
                error_log("[PDF VIEW] File not found at: $filePath");
                // Try alternative paths
                $alternativePaths = [
                    __DIR__ . '/../../public/uploads/' . $snapshot['pdf_file_path'],
                    __DIR__ . '/../../public/' . ltrim($snapshot['pdf_file_path'], '/'),
                    $snapshot['pdf_file_path'] // Try absolute path if stored as such
                ];
                
                foreach ($alternativePaths as $altPath) {
                    error_log("[PDF VIEW] Trying alternative path: $altPath");
                    if (file_exists($altPath)) {
                        $filePath = $altPath;
                        error_log("[PDF VIEW] Found file at alternative path: $filePath");
                        break;
                    }
                }
                
                if (!file_exists($filePath)) {
                    error_log("[PDF VIEW] File not found in any location");
                    throw new \Exception("PDF file not found on server.");
                }
            }
            
            $fileSize = filesize($filePath);
            error_log("[PDF VIEW] File found, size: $fileSize bytes");
            
            if ($fileSize === 0) {
                error_log("[PDF VIEW] File is empty");
                throw new \Exception("PDF file is empty.");
            }
            
            // Set headers for inline PDF display
            $versionNumber = $snapshot['version_number'] ?? 'unknown';
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="CN_' . $proposalId . '_' . $versionNumber . '.pdf"');
            header('Content-Length: ' . $fileSize);
            header('Cache-Control: no-cache, must-revalidate');
            header('Pragma: no-cache');
            
            // Output the file
            readfile($filePath);
            exit();
        } catch (\Exception $e) {
            error_log("[PDF VIEW] Error: " . $e->getMessage());
            error_log("[PDF VIEW] Stack trace: " . $e->getTraceAsString());
            JsonResponse::send(['error' => $e->getMessage()], 404);
            return;
        }
    }

    public function downloadProposalPDF($id)
    {
        try {
            // Get user info using SimpleAuth (Router already validated authentication)
            $user = $this->simpleAuth->getCurrentUser();
            $userName = null;
            
            if ($user) {
                $userName = $user['first_name'] . ' ' . $user['last_name'];
            }
            
            // Get all options from GET or POST
            $type = $_GET['type'] ?? $_POST['type'] ?? 'product_summary';
            $options = [];
            
            // Handle selectedImages parameter - convert from query string format to array
            if (isset($_GET['selectedImages']) && is_string($_GET['selectedImages'])) {
                $selectedImages = [];
                parse_str($_GET['selectedImages'], $selectedImages);
                // Normalize: ensure each value is an array
                foreach ($selectedImages as $key => $val) {
                    if (!is_array($val)) {
                        $selectedImages[$key] = [$val];
                    }
                }
                $options['selectedImages'] = $selectedImages;
            }
            
            // Handle selectedProductSummaryImages parameter - convert from query string format to array
            if (isset($_GET['selectedProductSummaryImages']) && is_string($_GET['selectedProductSummaryImages'])) {
                $selectedProductSummaryImages = [];
                parse_str($_GET['selectedProductSummaryImages'], $selectedProductSummaryImages);
                $options['selectedProductSummaryImages'] = $selectedProductSummaryImages;
            }
            
            require_once __DIR__ . '/../PdfGenerators/ProposalPdfFactory.php';
            $factory = new \ProposalPdfFactory();
            $generator = $factory::create($type);
            
            // Get proposal data
            $proposal = $this->proposalLibrary->getProposalById($id);
            if (!$proposal) {
                throw new \Exception("Proposal not found.");
            }
            $proposal['userName'] = $userName;
            $html = $generator->generate($proposal, $options);
            
            // Get the next version number for this proposal
            $nextVersion = $this->proposalLibrary->getNextVersionNumber($id);
            
            // Generate PDF and force download
            $pdfResult = $this->proposalLibrary->generatePDF($html, "CN_{$id}_{$nextVersion}.pdf");
            
            if ($pdfResult['type'] === 'download') {
                // File already saved, serve it for download
                $filePath = __DIR__ . '/../../public' . $pdfResult['file_path'];
                if (file_exists($filePath)) {
                    // Set headers for file download
                    header('Content-Type: application/pdf');
                    header('Content-Disposition: attachment; filename="CN_' . $id . '_' . $nextVersion . '.pdf"');
                    header('Content-Length: ' . filesize($filePath));
                    header('Cache-Control: no-cache, must-revalidate');
                    header('Pragma: no-cache');
                    
                    // Output the file
                    readfile($filePath);
                    exit();
                } else {
                    throw new \Exception("PDF file not found.");
                }
            } else {
                // Small file - convert to download anyway
                $output = base64_decode(str_replace('data:application/pdf;base64,', '', $pdfResult['pdf_url']));
                
                // Set headers for file download
                header('Content-Type: application/pdf');
                header('Content-Disposition: attachment; filename="CN_' . $id . '_' . $nextVersion . '.pdf"');
                header('Content-Length: ' . strlen($output));
                header('Cache-Control: no-cache, must-revalidate');
                header('Pragma: no-cache');
                
                // Output the file
                echo $output;
                exit();
            }
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    public function uploadTempItemImage()
    {
        $file = $_FILES['image'];
        $description = $_POST['description'] ?? '';
        $tempKey = $_POST['temp_key'] ?? null;

        if (!$file || !$tempKey) {
            JsonResponse::send(['error' => 'File and temp_key are required'], 400);
            return;
        }

        try {
            // Use FileUploader to upload the image with new structure
            $filePath = FileUploader::upload($file, 'proposals/temp');

            // Save the temporary image details in the database
            $result = $this->proposalLibrary->addTempItemImage($tempKey, $filePath, $description);

            JsonResponse::send(['image' => $result], 201);
            return;
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    public function updateTempItemImageDescription($tempImageId)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['description'])) {
            JsonResponse::send(['error' => 'Description is required'], 400);
            return;
        }

        try {
            $result = $this->proposalLibrary->updateTempItemImageDescription($tempImageId, $data['description']);
            JsonResponse::send($result);
            return;
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    private function getCurrentUserId()
    {
        // Use SimpleAuth for consistent user identification
        return $this->simpleAuth->getUserId();
    }
    
    private function parseNestedArray($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    $result[$key] = $this->parseNestedArray($value);
                } else {
                    $result[$key] = $value;
                }
            }
            return $result;
        }
        return $data;
    }

    public function sendProposal($id) { 
        $userId = $this->getCurrentUserId();
        $this->proposalLibrary->updateProposalStatus($id, 4, $userId); 
        JsonResponse::send(['message' => 'Proposal sent to customer.']);
        return;
    }
    
    public function acceptProposal($id) { 
        $userId = $this->getCurrentUserId();
        $this->proposalLibrary->updateProposalStatus($id, 5, $userId); 
        JsonResponse::send(['message' => 'Proposal accepted by customer.']);
        return;
    }
    
    public function holdProposal($id) { 
        $userId = $this->getCurrentUserId();
        $this->proposalLibrary->updateProposalStatus($id, 6, $userId); 
        JsonResponse::send(['message' => 'Proposal on hold.']);
        return;
    }
    
    public function expireProposal($id) { 
        $userId = $this->getCurrentUserId();
        $this->proposalLibrary->updateProposalStatus($id, 7, $userId); 
        JsonResponse::send(['message' => 'Proposal expired.']);
        return;
    }
    
    public function convertProposal($id) {
        try {
            // Get proposal data to check customer
            $proposal = $this->proposalLibrary->getProposalById($id);
            if (!$proposal) {
                JsonResponse::send(['error' => 'Proposal not found'], 404);
                return;
            }
            
            // Check if customer has delivery address
            $personModel = new \App\Models\PersonModel();
            $addresses = $personModel->getPersonAddresses($proposal['prospect_id']);
            $hasDeliveryAddress = false;
            
            foreach ($addresses as $address) {
                if ($address['address_type_id'] == 2) { // Delivery address type
                    $hasDeliveryAddress = true;
                    break;
                }
            }
            
            if (!$hasDeliveryAddress) {
                JsonResponse::send(['error' => 'Customer must have a delivery address to convert proposal to order'], 400);
                return;
            }
            
            $userId = $this->getCurrentUserId();
            $orderLibrary = new OrderLibrary();
            $orderResult = $orderLibrary->convertProposalToOrder($id, $userId);
            
            // Only update proposal status if order creation was successful
            $this->proposalLibrary->updateProposalStatus($id, 8, $userId); // Converted to Order
            
            JsonResponse::send(['message' => 'Proposal converted to order.', 'order' => $orderResult]);
            return;
        } catch (\Exception $e) {
            error_log("Error converting proposal to order: " . $e->getMessage());
            JsonResponse::send(['error' => 'Failed to convert proposal to order: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function getProposalStatusHistory($id)
    {
        $history = $this->proposalLibrary->getStatusHistory($id);
        JsonResponse::send($history);
        return;
    }

    public function cancelSend($id)
    {
        try {
            $userId = $this->getCurrentUserId();
            
            // Update proposal status back to Draft (status_id = 1)
            $this->proposalLibrary->updateProposalStatus($id, 1, $userId);
            
            JsonResponse::send(['message' => 'Proposal reverted to draft status.']);
            return;
        } catch (\Exception $e) {
            error_log("Error canceling send: " . $e->getMessage());
            JsonResponse::send(['error' => 'Failed to cancel send: ' . $e->getMessage()], 500);
            return;
        }
    }

    public function generateProposalPDFWithType($id)
    {
        try {
            // Get user info using SimpleAuth (Router already validated authentication)
            $user = $this->simpleAuth->getCurrentUser();
            $userName = null;
            
            if ($user) {
                $userName = $user['first_name'] . ' ' . $user['last_name'];
            }
            // Get proposal type from GET or POST
            $type = $_GET['type'] ?? $_POST['type'] ?? 'product_summary';
            
            // Collect PDF options from query parameters
            $options = [];
            
            // Image size option
            if (isset($_GET['imageSize'])) {
                $options['imageSize'] = $_GET['imageSize'];
            }
            
            // Selected product summary images
            if (isset($_GET['selectedProductSummaryImages'])) {
                $options['selectedProductSummaryImages'] = json_decode($_GET['selectedProductSummaryImages'], true) ?? [];
            }
            
            // Custom descriptions
            if (isset($_GET['customDescriptions'])) {
                $options['customDescriptions'] = json_decode($_GET['customDescriptions'], true) ?? [];
            }
            
            // Additional information
            if (isset($_GET['additionalInformation'])) {
                $options['additionalInformation'] = $_GET['additionalInformation'];
            }
            
            // Custom sections
            if (isset($_GET['customSections'])) {
                $options['customSections'] = json_decode($_GET['customSections'], true) ?? [];
            }
            
            require_once __DIR__ . '/../PdfGenerators/ProposalPdfFactory.php';
            $factory = new \ProposalPdfFactory();
            $generator = $factory::create($type);
            // Get proposal data (reuse your library logic)
            $proposal = $this->proposalLibrary->getProposalById($id);
            $proposal['userName'] = $userName;
            $html = $generator->generate($proposal, $options);
            // Check if this is a preview request
            $isPreview = isset($_GET['preview']) && $_GET['preview'] === 'true';
            
            if ($isPreview) {
                // For preview, generate PDF and return it directly as blob
                $pdfResult = $this->proposalLibrary->generatePDF($html, "CN_{$id}_preview.pdf");
                
                // Return the PDF as a blob for preview
                header('Content-Type: application/pdf');
                header('Content-Disposition: inline; filename="proposal_preview.pdf"');
                header('Cache-Control: no-cache, must-revalidate');
                header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
                
                if ($pdfResult['type'] === 'download') {
                    // For large files, read and output the file
                    readfile($pdfResult['file_path']);
                } else {
                    // For small files, output the data directly
                    echo $pdfResult['data'];
                }
                exit;
            } else {
                // Get the next version number for this proposal
                $nextVersion = $this->proposalLibrary->getNextVersionNumber($id);
                
                // Use dompdf to generate PDF from $html (reuse your existing logic)
                $pdfResult = $this->proposalLibrary->generatePDF($html, "CN_{$id}_{$nextVersion}.pdf");
                
                if ($pdfResult['type'] === 'download') {
                    // Large file - return download info
                    \App\Utils\JsonResponse::send([
                        'type' => 'download',
                        'download_url' => $pdfResult['file_path'],
                        'file_size' => $pdfResult['file_size'],
                        'message' => 'PDF is too large for inline display. Please download it.'
                    ], 200);
                    return;
                } else {
                    // Small file - return inline data
                    \App\Utils\JsonResponse::send([
                        'type' => 'inline',
                        'pdf_url' => $pdfResult['pdf_url'],
                        'file_size' => $pdfResult['file_size']
                    ], 200);
                    return;
                }
            }
        } catch (\Exception $e) {
            \App\Utils\JsonResponse::send(['error' => $e->getMessage()], 500);
            return;
        }
    }

    /**
     * Get HTML preview of proposal (for development/styling purposes)
     */
    public function getProposalPreview($id)
    {
        try {
            // Get user info using SimpleAuth (Router already validated authentication)
            $user = $this->simpleAuth->getCurrentUser();
            $userName = null;
            
            if ($user) {
                $userName = $user['first_name'] . ' ' . $user['last_name'];
            }
            
            // Get proposal type from GET parameters
            $type = $_GET['type'] ?? 'product_summary';
            
            // Collect PDF options from query parameters (same as PDF generation)
            $options = [];
            
            // Image size option
            if (isset($_GET['imageSize'])) {
                $options['imageSize'] = $_GET['imageSize'];
            }
            
            // Selected product summary images
            if (isset($_GET['selectedProductSummaryImages'])) {
                $options['selectedProductSummaryImages'] = json_decode($_GET['selectedProductSummaryImages'], true) ?? [];
            }
            
            // Custom descriptions
            if (isset($_GET['customDescriptions'])) {
                $options['customDescriptions'] = json_decode($_GET['customDescriptions'], true) ?? [];
            }
            
            // Additional information
            if (isset($_GET['additionalInformation'])) {
                $options['additionalInformation'] = $_GET['additionalInformation'];
            }
            
            // Custom sections
            if (isset($_GET['customSections'])) {
                $options['customSections'] = json_decode($_GET['customSections'], true) ?? [];
            }
            
            // Clean proposal removed: no longer accept cleanProposalOptions
            
            // Pretty proposal options
            if (isset($_GET['prettyProposalOptions'])) {
                $options['prettyProposalOptions'] = json_decode($_GET['prettyProposalOptions'], true) ?? [];
            }
            
            require_once __DIR__ . '/../PdfGenerators/ProposalPdfFactory.php';
            $factory = new \ProposalPdfFactory();
            $generator = $factory::create($type);
            
            // Get proposal data
            $proposal = $this->proposalLibrary->getProposalById($id);
            if (!$proposal) {
                throw new \Exception("Proposal not found.");
            }
            $proposal['userName'] = $userName;
            
            // Generate HTML (same as PDF generation but return HTML instead of PDF)
            $html = $generator->generate($proposal, $options);
            
            // Process HTML to make it DomPDF-compatible for preview
            $html = $this->makeHtmlDomPdfCompatible($html);
            
            // Return HTML with proper headers
            header('Content-Type: text/html; charset=UTF-8');
            echo $html;
            exit;
            
        } catch (\Exception $e) {
            error_log("ProposalController::getProposalPreview error: " . $e->getMessage());
            http_response_code(500);
            echo "<html><body><h1>Error generating preview</h1><p>" . htmlspecialchars($e->getMessage()) . "</p></body></html>";
            exit;
        }
    }

    /**
     * Make HTML DomPDF-compatible by replacing unsupported CSS properties
     */
    private function makeHtmlDomPdfCompatible($html)
    {
        // Only replace the most critical unsupported properties
        // Replace display: flex with display: block (simpler than table)
        $html = preg_replace('/display:\s*flex\s*;?/i', 'display: block;', $html);
        
        // Replace display: grid with display: block
        $html = preg_replace('/display:\s*grid\s*;?/i', 'display: block;', $html);
        
        // Remove only the most problematic flexbox properties
        $html = preg_replace('/align-items:\s*[^;]+;?/i', '', $html);
        $html = preg_replace('/justify-content:\s*[^;]+;?/i', '', $html);
        $html = preg_replace('/flex-direction:\s*[^;]+;?/i', '', $html);
        $html = preg_replace('/flex:\s*[^;]+;?/i', '', $html);
        $html = preg_replace('/flex-grow:\s*[^;]+;?/i', '', $html);
        $html = preg_replace('/flex-shrink:\s*[^;]+;?/i', '', $html);
        
        // Remove only truly unsupported properties
        $html = preg_replace('/transform:\s*[^;]+;?/i', '', $html);
        $html = preg_replace('/transition:\s*[^;]+;?/i', '', $html);
        $html = preg_replace('/animation:\s*[^;]+;?/i', '', $html);
        
        // Replace object-fit with basic sizing
        $html = preg_replace('/object-fit:\s*contain\s*;?/i', 'width: auto; height: auto;', $html);
        $html = preg_replace('/object-fit:\s*cover\s*;?/i', 'width: 100%; height: auto;', $html);
        
        return $html;
    }

    /**
     * Upload custom section image for PDF generation
     */
    public function uploadCustomSectionImage()
    {
        try {
            // Get user ID using SimpleAuth (Router already validated authentication)
            $userId = $this->simpleAuth->getUserId();

            // Check if file was uploaded
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                JsonResponse::send(['error' => 'No image file uploaded or upload error'], 400);
                return;
            }

            $file = $_FILES['image'];
            $description = $_POST['description'] ?? '';

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!in_array($file['type'], $allowedTypes)) {
                JsonResponse::send(['error' => 'Invalid file type. Only JPEG, PNG, and GIF are allowed.'], 400);
                return;
            }

            // Validate file size (max 5MB)
            if ($file['size'] > 5 * 1024 * 1024) {
                JsonResponse::send(['error' => 'File too large. Maximum size is 5MB.'], 400);
                return;
            }

            // Create upload directory if it doesn't exist
            $uploadDir = __DIR__ . '/../../public/uploads/custom-sections';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid('custom_section_') . '_' . time() . '.' . $extension;
            $filepath = $uploadDir . '/' . $filename;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                JsonResponse::send(['error' => 'Failed to save uploaded file'], 500);
                return;
            }

            // Return the image data
            $imageData = [
                'url' => 'uploads/custom-sections/' . $filename,
                'description' => $description,
                'filename' => $filename
            ];

            JsonResponse::send($imageData, 201);
            return;

        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Internal server error: ' . $e->getMessage()], 500);
            return;
        }
    }
}
