<?php
require_once __DIR__ . '/ProposalPdfGeneratorInterface.php';
require_once __DIR__ . '/../Models/ProductModel.php';
require_once __DIR__ . '/../Utils/PdfUtils.php';

class ProductSummaryProposalPdfGenerator implements ProposalPdfGeneratorInterface
{
    public function generate(array $proposalData, $options = []): string
    {
        $imageSize = is_array($options) ? ($options['imageSize'] ?? 'small') : 'small';
        $imageSizePx = $imageSize === 'large' ? 120 : 60;
        $selectedProductSummaryImages = is_array($options) ? ($options['selectedProductSummaryImages'] ?? []) : [];
        $customSections = is_array($options) ? ($options['customSections'] ?? []) : [];
        $additionalInformation = is_array($options) ? ($options['additionalInformation'] ?? '') : '';
        // Get language-specific data
        $proposalLibrary = new \App\Libraries\ProposalLibrary();

        // Use explicit language from proposal data and currency for amounts
        $proposalCurrency = $proposalData['currency_code'] ?? 'CZK';
        $languageId = $proposalData['language_id'] ?? 1;

        $languageData = $proposalLibrary->getLanguageData($languageId);

        $config = include __DIR__ . '/../../config/config.php';
        ob_start();
        include __DIR__ . '/../Templates/general-proposal.html';
        $html = ob_get_clean();

        // Replace basic placeholders
        $html = str_replace('{{proposal_id}}', $proposalData['proposal_id'], $html);
        $html = str_replace('{{date}}', date('d.m.Y'), $html);
        $html = str_replace('{{valid_until}}', date('d.m.Y', strtotime($proposalData['valid_until'])), $html);

        // Replace customer information
        $customer = $proposalData['customer'];
        $html = str_replace('{{customer_name}}', $customer['first_name'] . ' ' . $customer['last_name'], $html);
        $html = str_replace('{{customer_phone}}', $customer['phone'] ?? '', $html);
        $html = str_replace('{{customer_email}}', $customer['email'] ?? '', $html);

        // Handle customer address - replace with empty string if not available
        $customerAddress = '';
        if (!empty($customer['address'])) {
            $customerAddress = $customer['address'];
        }
        $html = str_replace('{{customer_address}}', $customerAddress, $html);

        // Replace processed by user
        $processedBy = $proposalData['userName'] ?? '';
        $html = str_replace('{{user_name}}', $processedBy, $html);
        $processedPhone = $proposalData['userPhone'] ?? '';
        $html = str_replace('{{user_phone}}', $processedPhone, $html);

        // Process items and calculate totals
        $itemHtml = '';
        $subtotal = 0;
        $hasAnyMaterials = false;

        // First pass: check if any items have materials
        foreach ($proposalData['items'] as $item) {
            $materials = [];
            if (!empty($item['pieces']) && is_array($item['pieces'])) {
                foreach ($item['pieces'] as $piece) {
                    // Handle new multiple materials structure
                    if (!empty($piece['materials']) && is_array($piece['materials'])) {
                        foreach ($piece['materials'] as $material) {
                            if (!empty($material['name'])) {
                                $materials[] = $material['name'];
                            }
                        }
                    } elseif (!empty($piece['material_name'])) {
                        // Legacy support for single material_name
                        $materials[] = $piece['material_name'];
                    }
                }
            }

            if (!empty($materials)) {
                $hasAnyMaterials = true;
                break;
            }
        }

        foreach ($proposalData['items'] as $item) {
            // DEBUG
            error_log("ProductSummaryProposalPdfGenerator - Processing item: " . json_encode($item));
            error_log("ProductSummaryProposalPdfGenerator - Proposal Currency: " . $proposalCurrency . ", Language ID: " . $languageId);

            $languageItemData = $proposalLibrary->calculateItemPriceForPdf($item, $languageId, $proposalCurrency, $proposalData);
            error_log("ProductSummaryProposalPdfGenerator - Language item data: " . json_encode($languageItemData));

            // Use stored CZK prices for calculations, then convert totals for display (might change later, not sure yet)
            $itemTotalCzk = $item['quantity'] * $item['final_price'];
            $subtotal += $itemTotalCzk;


            // Get unique materials from pieces
            $materials = [];
            if (!empty($item['pieces']) && is_array($item['pieces'])) {
                foreach ($item['pieces'] as $piece) {
                    if (!empty($piece['materials']) && is_array($piece['materials'])) {
                        foreach ($piece['materials'] as $material) {
                            if (!empty($material['name'])) {
                                $materials[] = $material['name'];
                            }
                        }
                    } elseif (!empty($piece['material_name'])) {
                        $materials[] = $piece['material_name'];
                    }
                }
            }

            $materials = array_unique($materials);
            $materialText = !empty($materials) ? implode(', ', $materials) : '';

            $imageHtml = '';
            $imageUrl = null;

            $selectedImageId = $selectedProductSummaryImages[$item['proposal_item_id']] ?? null;

            if ($selectedImageId && !empty($item['all_images'])) {
                foreach ($item['all_images'] as $image) {
                    if ((string)$image['image_id'] === (string)$selectedImageId) {
                        $imageUrl = $image['image_url'];
                        break;
                    }
                }
            }

            // Fallback to first uploaded image if no selection or selected image not found
            if (!$imageUrl && !empty($item['images']) && isset($item['images'][0]['image_url'])) {
                $imageUrl = $item['images'][0]['image_url'];
            }

            // Fallback to product primary image if no uploaded images
            if (!$imageUrl && !empty($item['product_id'])) {
                $productModel = new \App\Models\ProductModel();
                $product = $productModel->get($item['product_id']);
                if (!empty($product['primary_image_url'])) {
                    $imageUrl = $product['primary_image_url'];
                }
            }

            if ($imageUrl) {
                // Process at 2x resolution for better quality in PDF
                $processingSize = $imageSize === 'large' ? 240 : 120;
                $imgSrc = \App\Utils\PdfUtils::imageToBase64($imageUrl, $processingSize, $processingSize, 95);

                // Changed from 'margin: 2px auto' to 'margin: 2px' to align left
                $imageHtml = '<img src="' . $imgSrc . '" style="display: block; margin: 4px; max-width: ' . $imageSizePx . 'px; max-height: ' . $imageSizePx . 'px; width: auto; height: auto; border-radius: 4px;" />';
            } else {
                // Placeholder image
                $processingSize = $imageSize === 'large' ? 240 : 120;
                $imgSrc = \App\Utils\PdfUtils::getPlaceholderImage($processingSize, $processingSize);

                $imageHtml = '<img src="' . $imgSrc . '" alt="No image available" style="display: block; margin: 4px; max-width: ' . $imageSizePx . 'px; max-height: ' . $imageSizePx . 'px; width: auto; height: auto; border-radius: 4px;" />';
            }

            $specificationText = '';

            if (!empty($materialText)) {
                $specificationText = htmlspecialchars($materialText);
            }

            // Calculate VAT breakdown per unit
            $vatRate = isset($proposalData['vat_rate']) ? floatval($proposalData['vat_rate']) : 0.21;
            $priceWithVatPerUnit = $languageItemData['final_price'];
            $priceWithoutVatPerUnit = $priceWithVatPerUnit / (1 + $vatRate);
            $vatAmountPerUnit = $priceWithVatPerUnit - $priceWithoutVatPerUnit;

            // Check if item has discount and calculate original prices
            $discount = isset($item['discount']) ? floatval($item['discount']) : 0;
            $hasDiscount = $discount > 0;

            // Helper function to format price with discount
            $formatPriceWithDiscount = function ($discountedPrice, $originalPrice, $currencySymbol) use ($hasDiscount) {
                if ($hasDiscount && $originalPrice > 0) {
                    return '<s>' . number_format($originalPrice, 2) . ' ' . $currencySymbol . '</s></br> ' . number_format($discountedPrice, 2) . ' ' . $currencySymbol;
                }
                return number_format($discountedPrice, 2) . ' ' . $currencySymbol;
            };


            // Helper function to calculate the discount amount from discount percentage
            $calculateDiscountAmount = function ($discount, $originalPrice) use ($hasDiscount) {
                if ($hasDiscount && $originalPrice > 0) {
                    return $originalPrice * $discount / 100;
                }
                return 0;
            };

            $discountAmount = $calculateDiscountAmount($discount, $priceWithVatPerUnit);

            $originalPriceWithVatPerUnit = null;
            $originalPriceWithoutVatPerUnit = null;
            $originalVatAmountPerUnit = null;

            if ($hasDiscount && isset($item['list_price']) && floatval($item['list_price']) > 0) {
                // Get list_price in CZK and convert to display currency
                $listPriceCzk = floatval($item['list_price']);
                $listPriceDisplay = $listPriceCzk;

                if ($proposalCurrency !== 'CZK') {
                    $exchangeRate = $proposalData['exchange_rate_used'] ?? null;
                    if ($exchangeRate) {
                        $currencyUtils = new \App\Utils\CurrencyUtils();
                        $listPriceDisplay = $currencyUtils->convertFromCZK($listPriceCzk, $proposalCurrency, $exchangeRate);
                    }
                }

                $originalPriceWithVatPerUnit = $listPriceDisplay;
                $originalPriceWithoutVatPerUnit = $originalPriceWithVatPerUnit / (1 + $vatRate);
                $originalVatAmountPerUnit = $originalPriceWithVatPerUnit - $originalPriceWithoutVatPerUnit;
            }

            // Format price cells
            $discountCell = "-{$discountAmount} {$languageItemData['currency_symbol']}";
            
            $priceWithoutVatCell = $formatPriceWithDiscount(
                $priceWithoutVatPerUnit,
                $originalPriceWithoutVatPerUnit ?? 0,
                $languageItemData['currency_symbol']
            );

            $vatAmountCell = $formatPriceWithDiscount(
                $vatAmountPerUnit,
                $originalVatAmountPerUnit ?? 0,
                $languageItemData['currency_symbol']
            );

            $priceWithVatCell = $formatPriceWithDiscount(
                $priceWithVatPerUnit,
                $originalPriceWithVatPerUnit ?? 0,
                $languageItemData['currency_symbol']
            );

            
            $cellSize = $imageSizePx;
            $imageCellStyle = 'width: ' . $cellSize . 'px; height: ' . $cellSize . 'px; padding-left: 12px;';
            $specificationText = htmlspecialchars($specificationText);
            $itemName = htmlspecialchars($item['item_name']);

            $newItemHtml = "<tr>";
            $newItemHtml .= "<td style='{$imageCellStyle}'>{$imageHtml}</td>";
            $newItemHtml .= "<td style='vertical-align: middle;'><strong>{$itemName}</strong></td>";
            $hasAnyMaterials ? $newItemHtml .= "<td style='vertical-align: middle;'>{$specificationText}</td>" : null;
            $newItemHtml .= "<td class='cs-width-fit' style='vertical-align: middle;'>{$item['quantity']}</td>";
            $discountAmount > 0 ? $newItemHtml .= "<td class='cs-width-fit' style='vertical-align: middle;'>{$discountCell}</td>" : null;
            $newItemHtml .= "<td class='cs-width-fit' style='vertical-align: middle;'>{$priceWithoutVatCell}</td>";
            $newItemHtml .= "<td class='cs-width-fit' style='vertical-align: middle;'>{$priceWithVatCell}</td>";
            $newItemHtml .= "</tr>";
            $newItemHtml .= "<tr></tr>";

            $customDescription = '';
            if (!empty($options['customDescriptions']['item_' . $item['proposal_item_id']])) {
                $customDescription = $options['customDescriptions']['item_' . $item['proposal_item_id']];
            } elseif (!empty($item['custom_description'])) {
                $customDescription = $item['custom_description'];
            }

            if (!empty($customDescription)) {
                $colspan = $hasAnyMaterials ? 7 : 6;
                $newItemHtml .= '<tr>
                          <td class="border-top-zero" colspan="' . $colspan . '">
                            <strong>Popis:</strong> ' . \App\Utils\PdfUtils::nl2brSafe($customDescription) . '
                          </td>
                        </tr>';
            }

            $itemHtml .= $newItemHtml;
        }

        $cellSize = $imageSizePx + 10;
        $imageHeaderStyle = 'width: ' . $cellSize . 'px;';

        $tableHeader = '';
        if ($hasAnyMaterials) {
            // With materials: 7 columns (Image, Product Name, Materials, Quantity, Price without VAT, VAT, Price with VAT)
            $tableHeader = '<tr>
                      <th class="cs-primary_color cs-focus_bg" style="' . $imageHeaderStyle . '">Obrázek</th>
                      <th class="cs-primary_color cs-focus_bg">Název</th>
                      <th class="cs-primary_color cs-focus_bg">Materiál</th>
                      <th class="cs-primary_color cs-focus_bg">Množství</th>
                      <th class="cs-primary_color cs-focus_bg">Sleva / kus</th>
                      <th class="cs-primary_color cs-focus_bg">Cena / kus</th>
                      <th class="cs-primary_color cs-focus_bg">Cena s DPH / kus</th>
                    </tr>';
        } else {
            // Without materials: 6 columns (Image, Product Name, Quantity, Price without VAT, VAT, Price with VAT)
            $tableHeader = '<tr>
                      <th class="cs-primary_color cs-focus_bg" style="' . $imageHeaderStyle . '">Obrázek</th>
                      <th class="cs-primary_color cs-focus_bg">Název</th>
                      <th class="cs-primary_color cs-focus_bg">Množství</th>
                      <th class="cs-primary_color cs-focus_bg">Sleva / kus</th>
                      <th class="cs-primary_color cs-focus_bg">Cena / kus</th>
                      <th class="cs-primary_color cs-focus_bg">Cena s DPH / kus</th>
                    </tr>';
        }

        $html = str_replace('{{table_header}}', $tableHeader, $html);
        $html = str_replace('{{items}}', $itemHtml, $html);

        // Calculate VAT from gross prices using proposal snapshot vat_rate
        // Since prices are stored INCLUDING VAT, calculate net and VAT from gross
        $vatRate = isset($proposalData['vat_rate']) ? floatval($proposalData['vat_rate']) : 0.21;
        $total = $subtotal; // Total is now the gross amount (including VAT)
        $subtotal = $total / (1 + $vatRate); // Calculate net amount (excluding VAT)
        $vat = $total - $subtotal; // Calculate VAT amount

        $proposalCurrency = $proposalData['currency_code'] ?? 'CZK';
        $currencySymbol = $proposalCurrency === 'EUR' ? '€' : 'Kč';

        // Convert totals from CZK to proposal currency for display
        $currencyUtils = new \App\Utils\CurrencyUtils();
        $displaySubtotal = $subtotal;
        $displayVat = $vat;
        $displayTotal = $total;

        if ($proposalCurrency !== 'CZK') {
            // Use the exchange rate that was used when the proposal was created
            $exchangeRate = $proposalData['exchange_rate_used'] ?? null;
            if ($exchangeRate) {
                $displaySubtotal = $currencyUtils->convertFromCZK($subtotal, $proposalCurrency, $exchangeRate);
                $displayVat = $currencyUtils->convertFromCZK($vat, $proposalCurrency, $exchangeRate);
                $displayTotal = $currencyUtils->convertFromCZK($total, $proposalCurrency, $exchangeRate);
                error_log("ProductSummaryProposalPdfGenerator - Converting totals: {$subtotal} CZK -> {$displaySubtotal} {$proposalCurrency} using rate {$exchangeRate}");
            } else {
                error_log("ProductSummaryProposalPdfGenerator - No exchange rate found for proposal totals, using CZK values");
            }
        }

        $html = str_replace('{{subtotal}}', number_format($displaySubtotal, 2) . ' ' . $currencySymbol, $html);
        $html = str_replace('{{vat}}', number_format($displayVat, 2) . ' ' . $currencySymbol, $html);
        $html = str_replace('{{total}}', number_format($displayTotal, 2) . ' ' . $currencySymbol, $html);
        $html = str_replace('{{vat_percent}}', (string)round($vatRate * 100), $html);

        // Process custom sections
        $customSectionsHtml = '';

        if (!empty($customSections)) {
            foreach ($customSections as $section) {
                if (!empty($section['title']) && !empty($section['images'])) {
                    $customSectionsHtml .= $this->generateCustomSectionHtml($section, $imageSizePx);
                }
            }
        }

        // Replace the custom sections placeholder
        $html = str_replace('{{custom_sections}}', $customSectionsHtml, $html);

        // Handle additional information section
        if (!empty(trim($additionalInformation))) {
            // Replace the hardcoded Lorem ipsum with user's additional information
            $additionalInfoHtml = '<p class="cs-m0">' . nl2br(htmlspecialchars($additionalInformation)) . '</p>';
            $html = str_replace(
                '<p class="cs-m0">Lorem ipsum <br>dolor sit amet.</p>',
                $additionalInfoHtml,
                $html
            );
        } else {
            // Hide the entire additional information section if no content
            $html = preg_replace(
                '/<div class="cs-left_footer cs-mobile_hide">\s*<p class="cs-mb0"><b class="cs-primary_color">Doplňující informace:<\/b><\/p>\s*<p class="cs-m0">.*?<\/p>\s*<\/div>/s',
                '',
                $html
            );
        }

        return $html;
    }

    /**
     * Generate HTML for a custom section with title and images
     * @param array $section Section data with title and images
     * @param int $imageSizePx Image size in pixels
     * @return string HTML for the custom section
     */
    private function generateCustomSectionHtml(array $section, int $imageSizePx): string
    {
        $title = htmlspecialchars($section['title']);
        $images = array_slice($section['images'], 0, 2); // Limit to max 2 images

        // Custom section with forced page break to start on new page
        $html = '<div class="cs-custom-section" style="margin-bottom: 8mm; page-break-before: always; page-break-inside: avoid;">';

        // Section header styled exactly like product-title from pretty proposal
        $html .= '<div class="cs-section-header" style="display: table; width: 100%; margin-bottom: 3mm; table-layout: fixed; page-break-after: avoid;">';
        $html .= '<div class="cs-section-title" style="display: table-cell; width: 100%; font-size: 17pt; font-weight: 700; color: #1d1d1f; vertical-align: middle; letter-spacing: -0.01em;">' . $title . '</div>';
        $html .= '</div>';

        if (!empty($images)) {
            $imageCount = count($images);

            if ($imageCount === 1) {
                // Single image: preserve aspect ratio, scale down only if too large
                $html .= '<div class="cs-section-images" style="margin-bottom: 6mm; page-break-before: avoid;">';

                $image = $images[0];
                if (!empty($image['url'])) {
                    try {
                        $maxSize = 800; // Process at high resolution for quality
                        $imgSrc = \App\Utils\PdfUtils::imageToBase64($image['url'], $maxSize, $maxSize, 95);
                        $html .= '<div class="cs-custom-image-container" style="width: 100%; min-height: 110mm; margin-bottom: 4mm; display: table; text-align: center;">';
                        $html .= '<img src="' . $imgSrc . '" alt="' . htmlspecialchars($title) . '" style="max-width: 100%; max-height: 110mm; width: auto; height: auto; border-radius: 3mm;" />';

                        // Add image description if available
                        if (!empty($image['description'])) {
                            $html .= '</div>';
                            $html .= '<div class="cs-image-description" style="margin-bottom: 4mm; font-size: 10pt; line-height: 1.4; text-align: justify;">' . htmlspecialchars($image['description']) . '</div>';
                        } else {
                            $html .= '</div>';
                        }
                    } catch (\Exception $e) {
                        error_log("ProductSummaryProposalPdfGenerator::generateCustomSectionHtml - Error processing image {$image['url']}: " . $e->getMessage());
                    }
                }

                $html .= '</div>';
            } else {
                // Two images: preserve aspect ratio, scale down only if too large
                $html .= '<div class="cs-section-images" style="margin-bottom: 6mm; page-break-before: avoid;">';

                foreach ($images as $index => $image) {
                    if (!empty($image['url'])) {
                        try {
                            $maxSize = 800; // Process at high resolution for quality
                            $imgSrc = \App\Utils\PdfUtils::imageToBase64($image['url'], $maxSize, $maxSize, 95);

                            // Add spacing between images (except for the first one)
                            if ($index > 0) {
                                $html .= '<div style="margin-top: 4mm;"></div>';
                            }

                            $html .= '<div class="cs-custom-image-container" style="width: 100%; min-height: 80mm; margin-bottom: 4mm; display: table; text-align: center;">';
                            $html .= '<img src="' . $imgSrc . '" alt="' . htmlspecialchars($title) . ' - Image ' . ($index + 1) . '" style="max-width: 100%; max-height: 80mm; width: auto; height: auto; border-radius: 3mm;" />';

                            // Add image description if available
                            if (!empty($image['description'])) {
                                $html .= '</div>';
                                $html .= '<div class="cs-image-description" style="margin-bottom: 4mm; font-size: 10pt; line-height: 1.4; text-align: justify;">' . htmlspecialchars($image['description']) . '</div>';
                            } else {
                                $html .= '</div>';
                            }
                        } catch (\Exception $e) {
                            error_log("ProductSummaryProposalPdfGenerator::generateCustomSectionHtml - Error processing image {$image['url']}: " . $e->getMessage());
                        }
                    }
                }

                $html .= '</div>';
            }
        }

        $html .= '</div>';

        return $html;
    }
}
