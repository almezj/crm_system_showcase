<?php
require_once __DIR__ . '/ProposalPdfGeneratorInterface.php';
require_once __DIR__ . '/../Models/ProductModel.php';
require_once __DIR__ . '/../Models/ProductImageModel.php';
require_once __DIR__ . '/../Utils/PdfUtils.php';

class PrettyProposalPdfGenerator implements ProposalPdfGeneratorInterface {
    
    private static $debugMessages = [];
    
    /**
     * Simple UTF-8 safe HTML escaping
     */
    private static function escapeHtml($string) {
        return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
    }
    
    private static function debugLog($message) {
        // Store debug messages for later output
        self::$debugMessages[] = date('H:i:s') . " - " . $message;
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] PRETTY_PROPOSAL: {$message}\n";
        
        // Try multiple locations for the debug log
        $logPaths = [
            __DIR__ . '/../../logs/pdf_debug.log',
            __DIR__ . '/pdf_debug.log',
            __DIR__ . '/../../pdf_debug.log',
            '/tmp/pdf_debug.log'
        ];
        
        foreach ($logPaths as $path) {
            $dir = dirname($path);
            if (is_writable($dir) || is_writable($path)) {
                file_put_contents($path, $logEntry, FILE_APPEND | LOCK_EX);
                break;
            }
        }
        
        // Also use error_log as fallback
        error_log("PRETTY_PROPOSAL: {$message}");
    }
    
    public function generate(array $proposalData, $options = []): string {
        // Performance testing: Log start time
        $startTime = microtime(true);
        
        // Test debug logging immediately
        self::debugLog("=== PDF GENERATION STARTED ===");
        self::debugLog("Proposal ID: " . ($proposalData['proposal_id'] ?? 'unknown'));
        self::debugLog("Number of items: " . count($proposalData['items'] ?? []));
        // Extract pretty proposal options (same structure as clean proposal)
        $prettyOptions = $options['prettyProposalOptions'] ?? [];
        
        // Default options if not provided
        $defaultOptions = [
            'showProductImages' => true,
            'showProductInfo' => true,
            'showPieces' => true,
            'showPieceImages' => true,
            'showPieceInfo' => true,
            'showMaterials' => true,
            'showMaterialImages' => true,
            'showMaterialInfo' => true,
            'selectedProductInfoFields' => ['name', 'description', 'price', 'quantity'],
            'selectedPieceInfoFields' => ['name', 'description', 'price'],
            'selectedMaterialInfoFields' => ['name', 'color', 'finish'],
            'selectedProductImages' => [],
            'selectedPieceImages' => [],
            'selectedMaterialImages' => [],
            'customDescriptions' => []
        ];
        
        $prettyOptions = array_merge($defaultOptions, $prettyOptions);

        ob_start();
        include __DIR__ . '/../Templates/pretty-proposal.html';
        $html = ob_get_clean();

        // Prepare the body with product sections
        $body = '';
        if (!empty($proposalData['items'])) {
            foreach ($proposalData['items'] as $itemIndex => $item) {
                // Start product section with appropriate class
                $sectionClass = ($itemIndex === 0) ? 'product-section first-section' : 'product-section subsequent-section';
                $body .= '<div class="' . $sectionClass . '">';
                
                // Product header: Name and Price
                $body .= '<div class="product-header">';
                $body .= '<div class="product-title">' . self::escapeHtml($item['item_name']) . '</div>';
                
                $price = '';
                if (!empty($item['final_price']) && floatval($item['final_price']) > 0) {
                    // Get proposal currency
                    $proposalCurrency = $proposalData['currency_code'] ?? 'CZK';
                    $currencySymbol = $proposalCurrency === 'EUR' ? '€' : 'Kč';
                    
                    // Convert price from CZK to proposal currency if needed
                    $displayPrice = $item['final_price'];
                    if ($proposalCurrency !== 'CZK') {
                        $currencyUtils = new \App\Utils\CurrencyUtils();
                        // Use the exchange rate that was used when the proposal was created
                        $exchangeRate = $proposalData['exchange_rate_used'] ?? null;
                        if ($exchangeRate) {
                            $displayPrice = $currencyUtils->convertFromCZK($item['final_price'], $proposalCurrency, $exchangeRate);
                        }
                    }
                    
                    $price = number_format($displayPrice, 0, ',', ' ') . ' ' . $currencySymbol;
                    $body .= '<div class="product-price">' . self::escapeHtml($price) . '</div>';
                }
                $body .= '</div>';
                
                // Product Images Section
                if ($prettyOptions['showProductImages'] && !empty($item['all_images'])) {
                    $itemId = (string)$item['proposal_item_id'];
                    $itemSelectedImages = $prettyOptions['selectedProductImages'][$itemId] ?? [];
                    
                    // DEBUG
                    self::debugLog("Item ID: {$itemId}, Type: " . gettype($item['proposal_item_id']));
                    self::debugLog("Available keys in selectedProductImages: " . json_encode(array_keys($prettyOptions['selectedProductImages'] ?? [])));
                    self::debugLog("Selected images for item {$itemId}: " . json_encode($itemSelectedImages));
                    self::debugLog("Total available images: " . count($item['all_images']));
                    
                    $imagesToShow = [];
                    
                    if (!empty($itemSelectedImages)) {
                        // Create a lookup map for fast image finding
                        $imageMap = [];
                        foreach ($item['all_images'] as $image) {
                            $imageIdStr = (string)$image['image_id'];
                            $imageMap[$imageIdStr] = $image;
                        }
                        
                        foreach ($itemSelectedImages as $selectedImageId) {
                            $selectedImageIdStr = (string)$selectedImageId;
                            if (isset($imageMap[$selectedImageIdStr])) {
                                $imagesToShow[] = $imageMap[$selectedImageIdStr];
                                self::debugLog("Image {$selectedImageIdStr} matched and added to imagesToShow at position " . (count($imagesToShow) - 1));
                            } else {
                                self::debugLog("Warning: Selected image ID {$selectedImageIdStr} not found in item's all_images");
                            }
                        }
                        self::debugLog("Total images to show after filtering: " . count($imagesToShow));
                        self::debugLog("Final imagesToShow order: " . json_encode(array_map(function($img) { return (string)$img['image_id']; }, $imagesToShow)));
                    } else {
                        $imagesToShow = $item['all_images'];
                        self::debugLog("No images selected for item {$itemId}, showing all images");
                    }
                    
                    if (!empty($imagesToShow)) {
                        $body .= '<div class="product-gallery">';
                        
                        $primaryImage = $imagesToShow[0];
                        if (!empty($primaryImage['image_url'])) {
                            self::debugLog("====== PROCESSING PRIMARY IMAGE ======");
                            self::debugLog("Primary URL: " . $primaryImage['image_url']);
                            $primaryStart = microtime(true);
                            $primaryMemoryBefore = memory_get_usage(true);
                            
                            $imgSrc = \App\Utils\PdfUtils::getImagePath($primaryImage['image_url']);
                            if (!$imgSrc) {
                                $imgSrc = \App\Utils\PdfUtils::imageToBase64($primaryImage['image_url'], 1200, 900, 95);
                            }
                            
                            $primaryEnd = microtime(true);
                            $primaryMemoryAfter = memory_get_usage(true);
                            $primaryDuration = round(($primaryEnd - $primaryStart) * 1000, 2);
                            $primaryMemoryUsed = round(($primaryMemoryAfter - $primaryMemoryBefore) / 1024 / 1024, 2);
                            $isValidPrimary = !empty($imgSrc) && (strpos($imgSrc, 'data:image') === 0 || file_exists($imgSrc));
                            
                            self::debugLog("PRIMARY: Duration: {$primaryDuration}ms, Memory: {$primaryMemoryUsed}MB, Valid: " . ($isValidPrimary ? 'YES' : 'NO') . ", Length: " . strlen($imgSrc));
                            
                            $body .= '<div class="primary-image" style="background-image: url(' . $imgSrc . ');"></div>';
                        } else {
                            self::debugLog("Primary image: Empty URL, using placeholder");
                            $imgSrc = \App\Utils\PdfUtils::getPlaceholderImage(1200, 900);
                            $body .= '<div class="primary-image" style="background-image: url(' . $imgSrc . ');"></div>';
                        }
                        
                        $secondaryImages = array_slice($imagesToShow, 1, 3);
                        if (!empty($secondaryImages)) {
                            $body .= '<div class="secondary-images">';
                            $body .= '<div class="secondary-row">';
                            
                            foreach ($secondaryImages as $imageIndex => $image) {
                                $body .= '<div class="secondary-item">';
                                if (!empty($image['image_url'])) {
                                    // DEBUG: Log detailed state before processing each image
                                    $globalMemoryBefore = memory_get_usage(true);
                                    $peakMemory = memory_get_peak_usage(true);
                                    self::debugLog("====== STARTING IMAGE #{$imageIndex} ======");
                                    self::debugLog("URL: " . $image['image_url']);
                                    self::debugLog("Memory before: " . round($globalMemoryBefore/1024/1024, 2) . "MB, Peak: " . round($peakMemory/1024/1024, 2) . "MB");
                                    
                                    try {
                                        // Use a larger but reasonable size for secondary images
                                        $imageStart = microtime(true);
                                        $memoryBefore = memory_get_usage(true);
                                        
                                        $imgSrc = \App\Utils\PdfUtils::getImagePath($image['image_url']);
                                        if (!$imgSrc) {
                                            $imgSrc = \App\Utils\PdfUtils::imageToBase64($image['image_url'], 800, 800, 95);
                                        }
                                        
                                        $imageEnd = microtime(true);
                                        $memoryAfter = memory_get_usage(true);
                                        $imageDuration = round(($imageEnd - $imageStart) * 1000, 2);
                                        $memoryUsed = round(($memoryAfter - $memoryBefore) / 1024 / 1024, 2);
                                        
                                        // DEBUG: Check if we got a valid image source (file path or base64)
                                        $isValidImage = !empty($imgSrc) && (strpos($imgSrc, 'data:image') === 0 || file_exists($imgSrc));
                                        $globalMemoryAfter = memory_get_usage(true);
                                        $newPeakMemory = memory_get_peak_usage(true);
                                        
                                        self::debugLog("PROCESSING #{$imageIndex}: Duration: {$imageDuration}ms, Memory: {$memoryUsed}MB, Valid: " . ($isValidImage ? 'YES' : 'NO') . ", Length: " . strlen($imgSrc));
                                        self::debugLog("Memory after: " . round($globalMemoryAfter/1024/1024, 2) . "MB, Peak: " . round($newPeakMemory/1024/1024, 2) . "MB");
                                        self::debugLog("====== FINISHED IMAGE #{$imageIndex} ======");
                                        
                                        if ($isValidImage) {
                                            // Use background-image for all images to prevent stretching in DomPDF a.k.a. IMPORTANT!!!!
                                            $body .= '<div class="secondary-item-container" style="background-image: url(' . $imgSrc . ');"></div>';
                                        } else {
                                            self::debugLog("ERROR #{$imageIndex}: Invalid image source, using fallback");
                                            $imgSrc = \App\Utils\PdfUtils::getPlaceholderImage(500, 500);
                                            $body .= '<div class="secondary-item-container" style="background-image: url(' . $imgSrc . ');"></div>';
                                        }
                                    } catch (\Exception $e) {
                                        self::debugLog("EXCEPTION #{$imageIndex}: " . $e->getMessage());
                                        $imgSrc = \App\Utils\PdfUtils::getPlaceholderImage(500, 500);
                                        $body .= '<div class="secondary-item-container" style="background-image: url(' . $imgSrc . ');"></div>';
                                    }
                                } else {
                                    self::debugLog("Empty image URL #{$imageIndex}, using placeholder");
                                    $imgSrc = \App\Utils\PdfUtils::getPlaceholderImage(500, 500);
                                    $body .= '<div class="secondary-item-container" style="background-image: url(' . $imgSrc . ');"></div>';
                                }
                                $body .= '</div>';
                            }
                            
                            $body .= '</div>';
                            $body .= '</div>';
                        }
                        
                        $body .= '</div>';
                    }
                }
                
                // Product Description
                if (!empty($item['description'])) {
                    $body .= '<div class="product-description">';
                    $body .= self::escapeHtml($item['description']);
                    $body .= '</div>';
                }
                
                // Product Information Section
                if ($prettyOptions['showProductInfo']) {
                    // Use metadata from proposal_item_metadata table
                    $metadata = $item['metadata'] ?? [];
                    
                    if (!empty($metadata)) {
                        $body .= '<div class="info-section">';
                        $body .= '<div class="info-title">Informace</div>';
                        $body .= '<table class="info-table">';
                        
                        foreach ($metadata as $metaItem) {
                            if (!empty($metaItem['key_name']) && !empty($metaItem['value'])) {
                                $body .= '<tr>';
                                $body .= '<td class="info-key">' . self::escapeHtml($metaItem['key_name']) . '</td>';
                        $body .= '<td class="info-value">' . self::escapeHtml($metaItem['value']) . '</td>';
                                $body .= '</tr>';
                            }
                        }
                        
                        $body .= '</table>';
                        $body .= '</div>';
                    }
                }
                
                // Pieces Section
                if ($prettyOptions['showPieces'] && !empty($item['pieces'])) {
                    $body .= '<div class="pieces-section">';
                    $body .= '<div class="section-title">' . self::escapeHtml('Díly') . '</div>';
                    
                    foreach ($item['pieces'] as $pieceIndex => $piece) {
                        $body .= '<div class="piece-item">';
                        
                        // Piece header
                        $pieceName = $piece['internal_manufacturer_code'] ?? $piece['name'] ?? ('Díl ' . ($pieceIndex + 1));
                        $body .= '<div class="piece-title">' . self::escapeHtml($pieceName) . '</div>';
                        
                        // Piece Images
                        if ($prettyOptions['showPieceImages']) {
                            $pieceImages = [];
                            if (!empty($piece['proposal_images'])) {
                                $pieceSelectedImages = $prettyOptions['selectedPieceImages'][$piece['piece_id']] ?? [];
                                if (!empty($pieceSelectedImages)) {
                                    foreach ($piece['proposal_images'] as $image) {
                                        if (in_array((string)$image['piece_image_id'], array_map('strval', $pieceSelectedImages))) {
                                            $pieceImages[] = $image;
                                        }
                                    }
                                } else {
                                    $pieceImages = $piece['proposal_images'];
                                }
                            } elseif (!empty($piece['images'])) {
                                $pieceSelectedImages = $prettyOptions['selectedPieceImages'][$piece['piece_id']] ?? [];
                                if (!empty($pieceSelectedImages)) {
                                    foreach ($piece['images'] as $image) {
                                        if (in_array((string)$image['piece_image_id'], array_map('strval', $pieceSelectedImages))) {
                                            $pieceImages[] = $image;
                                        }
                                    }
                                } else {
                                    $pieceImages = $piece['images'];
                                }
                            }
                            
                            // Limit to 3 piece images
                            $pieceImages = array_slice($pieceImages, 0, 3);
                            
                            if (!empty($pieceImages)) {
                                $body .= '<div class="piece-gallery">';
                                $body .= '<div class="piece-images-row">';
                                
                                foreach ($pieceImages as $image) {
                                    $body .= '<div class="piece-image-item">';
                                    
                                    if (!empty($image['image_url'])) {
                                        $imgSrc = \App\Utils\PdfUtils::getImagePath($image['image_url']);
                            if (!$imgSrc) {
                                $imgSrc = \App\Utils\PdfUtils::imageToBase64($image['image_url'], 600, 600, 95);
                            }
                                        $body .= '<div class="piece-image-container" style="background-image: url(' . $imgSrc . ');"></div>';
                                    } else {
                                        $imgSrc = \App\Utils\PdfUtils::getPlaceholderImage(600, 600);
                                        $body .= '<div class="piece-image-container" style="background-image: url(' . $imgSrc . ');"></div>';
                                    }
                                    
                                    // Image caption
                                    $customDesc = $prettyOptions['customDescriptions']['piece_' . $image['piece_image_id']] ?? '';
                                    $description = $customDesc ?: ($image['description'] ?? 'Popis Obrázku');
                                    $body .= '<div class="image-caption">' . \App\Utils\PdfUtils::nl2brSafe($description) . '</div>';
                                    
                                    $body .= '</div>';
                                }
                                
                                $body .= '</div>';
                                $body .= '</div>';
                            }
                        }
                        
                        // Piece Description
                        if (!empty($piece['description'])) {
                            $body .= '<div class="piece-description">';
                            $body .= \App\Utils\PdfUtils::nl2brSafe($piece['description']);
                            $body .= '</div>';
                        }
                        
                        // Materials Section - Grid layout /w max 4 columns
                        if ($prettyOptions['showMaterials'] && !empty($piece['materials'])) {
                            $body .= '<div class="materials-section">';
                            $body .= '<div class="materials-grid">';
                            
                            // Group materials into rows of 4
                            $materialChunks = array_chunk($piece['materials'], 4);
                            
                            foreach ($materialChunks as $materialRow) {
                                $materialCount = count($materialRow);
                                $rowClass = 'materials-row';
                                
                                if ($materialCount == 2) {
                                    $rowClass .= ' two-items';
                                } elseif ($materialCount == 3) {
                                    $rowClass .= ' three-items';
                                } elseif ($materialCount >= 4) {
                                    $rowClass .= ' four-items';
                                }
                                
                                $body .= '<div class="' . $rowClass . '">';
                                
                                foreach ($materialRow as $material) {
                                    $body .= '<div class="material-card">';
                                    $body .= '<div class="material-card-container">';
                                    
                                    if ($prettyOptions['showMaterialImages']) {
                                        $body .= '<div class="material-image">';
                                        if (!empty($material['material_image_path'])) {
                                            $materialImgSrc = \App\Utils\PdfUtils::getImagePath($material['material_image_path']);
                            if (!$materialImgSrc) {
                                $materialImgSrc = \App\Utils\PdfUtils::imageToBase64($material['material_image_path'], 400, 400, 95);
                            }
                                            $body .= '<img src="' . $materialImgSrc . '" alt="' . self::escapeHtml($material['name']) . '" />';
                                        } else {
                                            $materialImgSrc = \App\Utils\PdfUtils::getPlaceholderImage(400, 400);
                                            $body .= '<img src="' . $materialImgSrc . '" alt="No material image available" />';
                                        }
                                        $body .= '</div>';
                                    } else {
                                        // Create empty image area if no image
                                        $body .= '<div class="material-image"></div>';
                                    }
                                    
                                    // Material info
                                    if ($prettyOptions['showMaterialInfo']) {
                                        $body .= '<div class="material-info">';
                                        $materialName = !empty($material['name']) ? self::escapeHtml($material['name']) : self::escapeHtml('Materiál');
                    $materialColor = !empty($material['color']) ? self::escapeHtml($material['color']) : self::escapeHtml('Barva');
                                        $body .= '<div class="material-name">' . $materialName . '</div>';
                                        $body .= '<div class="material-color">' . $materialColor . '</div>';
                                        $body .= '</div>';
                                    }
                                    
                                    $body .= '</div>';
                                    $body .= '</div>';
                                }
                                
                                $body .= '</div>';
                            }
                            
                            $body .= '</div>';
                            $body .= '</div>';
                        }
                        
                        $body .= '</div>'; // End piece-item
                    }
                    
                    $body .= '</div>'; // End pieces-section
                }
                
                // End product section
                $body .= '</div>';
                
                // Add separator between products (except for last item)
                if ($itemIndex < count($proposalData['items']) - 1) {
                    $body .= '<div class="product-separator"></div>';
                }
            }
        }
        
        $logoPath = 'logo.png';
        $logoSrc = '';
        
        try {
            $logoSrc = \App\Utils\PdfUtils::getImagePath($logoPath);
            if (!$logoSrc) {
                $logoSrc = \App\Utils\PdfUtils::imageToBase64($logoPath, 200, 80, 95);
            }
        } catch (\Exception $e) {
            // Fallback to direct file path if imageToBase64 fails
            $logoSrc = realpath(__DIR__ . '/../../public/static/' . $logoPath);
        }
        
        // Replace customer information
        $customer = $proposalData['customer'] ?? [];
        
        $customerName = '';
        if (!empty($customer['first_name']) || !empty($customer['last_name'])) {
            $customerName = trim(($customer['first_name'] ?? '') . ' ' . ($customer['last_name'] ?? ''));
        }
        
        // Build customer detail rows
        $customerEmailRow = '';
        if (!empty($customer['email'])) {
            $customerEmailRow = '<div class="customer-info-row"><span class="customer-label">E-mail:</span> <span class="customer-value">' . self::escapeHtml($customer['email']) . '</span></div>';
        }
        
        $customerPhoneRow = '';
        if (!empty($customer['phone'])) {
            $customerPhoneRow = '<div class="customer-info-row"><span class="customer-label">Telefon:</span> <span class="customer-value">' . self::escapeHtml($customer['phone']) . '</span></div>';
        }
        
        $customerAddressRow = '';
        // Build address from multiple fields with UTF-8 safe escaping
        $addressParts = [];
        if (!empty($customer['street'])) $addressParts[] = self::escapeHtml($customer['street']);
        if (!empty($customer['house_number'])) $addressParts[] = self::escapeHtml($customer['house_number']);
        if (!empty($customer['city'])) $addressParts[] = self::escapeHtml($customer['city']);
        if (!empty($customer['postal_code'])) $addressParts[] = self::escapeHtml($customer['postal_code']);
        if (!empty($addressParts)) {
            $fullAddress = implode(', ', $addressParts);
            $customerAddressRow = '<div class="customer-info-row"><span class="customer-label">Adresa:</span> <span class="customer-value">' . $fullAddress . '</span></div>';
        }
        
        $customerCompanyRow = '';
        if (!empty($customer['company'])) {
            $customerCompanyRow = '<div class="customer-info-row"><span class="customer-label">Firma:</span> <span class="customer-value">' . self::escapeHtml($customer['company']) . '</span></div>';
        }
        
        // Replace all placeholders
        $html = str_replace('{{logo_path}}', $logoSrc, $html);
        $html = str_replace('{{date}}', date('d.m.Y'), $html);
        $html = str_replace('{{proposal_id}}', self::escapeHtml($proposalData['proposal_id'] ?? ''), $html);
        $html = str_replace('{{customer_name}}', self::escapeHtml($customerName), $html);
        $html = str_replace('{{customer_email_row}}', $customerEmailRow, $html);
        $html = str_replace('{{customer_phone_row}}', $customerPhoneRow, $html);
        $html = str_replace('{{customer_address_row}}', $customerAddressRow, $html);
        $html = str_replace('{{customer_company_row}}', $customerCompanyRow, $html);
        
        // Performance testing: Log end time and duration
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2); // milliseconds
        self::debugLog("PERFORMANCE: Total generation took {$duration}ms");
        
        // Create a comprehensive debug info file in public directory (easier to access via FTP)
        $debugInfo = "PDF Generation Debug Info - " . date('Y-m-d H:i:s') . "\n";
        $debugInfo .= "====================================\n";
        $debugInfo .= "Total generation time: {$duration}ms\n";
        $debugInfo .= "Memory usage: " . round(memory_get_usage(true)/1024/1024, 2) . "MB\n";
        $debugInfo .= "Peak memory: " . round(memory_get_peak_usage(true)/1024/1024, 2) . "MB\n\n";
        
        // Add all debug messages
        $debugInfo .= "DETAILED LOG:\n";
        $debugInfo .= "=============\n";
        foreach (self::$debugMessages as $msg) {
            $debugInfo .= $msg . "\n";
        }
        
        file_put_contents(__DIR__ . '/../../public/static/pdf_debug_info.txt', $debugInfo);
        
        // Replace body content
        $html = str_replace('{{body}}', $body, $html);
        
        return $html;
    }
}