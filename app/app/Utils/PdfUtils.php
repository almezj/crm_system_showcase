<?php

namespace App\Utils;

class PdfUtils
{
    private static function debugLog($message) {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] PDF_DEBUG: {$message}\n";
        
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
        error_log("PDF_DEBUG: {$message}");
    }

    public static function imageToBase64($imageUrl, $maxWidth = 300, $maxHeight = 300, $quality = 80) {
        $startMemory = memory_get_usage(true);
        self::debugLog('Starting imageToBase64 for: ' . $imageUrl . ' (Memory: ' . round($startMemory/1024/1024, 2) . 'MB)');
        
        $imageUrl = ltrim($imageUrl, '/');
        
        // Determine the correct base path based on the image URL
        $localPath = null;
        
        // Get the document root dynamically
        $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '/var/www/html';
        
        if (strpos($imageUrl, 'uploads/products/') === 0) {
            // Product images: stored in public/uploads/products/
            $localPath = $documentRoot . '/public/' . $imageUrl;
        } elseif (strpos($imageUrl, 'uploads/proposals/') === 0) {
            // Proposal images: stored in public/uploads/proposals/
            $localPath = $documentRoot . '/public/' . $imageUrl;
        } else {
            // Fallback: try public/static/ first, then public/
            $localPath = $documentRoot . '/public/static/' . $imageUrl;
            if (!file_exists($localPath)) {
                $localPath = $documentRoot . '/public/' . $imageUrl;
            }
        }
        
        self::debugLog('imageUrl: ' . $imageUrl);
        self::debugLog('documentRoot: ' . $documentRoot);
        self::debugLog('localPath: ' . $localPath);
        
        if (!file_exists($localPath)) {
            self::debugLog(' File not found: ' . $localPath);
            // Try alternative paths
            $alternativePaths = [
                __DIR__ . '/../../public/' . $imageUrl,
                __DIR__ . '/../../../public/' . $imageUrl,
                $documentRoot . '/' . $imageUrl
            ];
            
            foreach ($alternativePaths as $altPath) {
                self::debugLog(' Trying alternative path: ' . $altPath);
                if (file_exists($altPath)) {
                    $localPath = $altPath;
                    self::debugLog(' Found file at: ' . $localPath);
                    break;
                }
            }
            
            if (!file_exists($localPath)) {
                $endMemory = memory_get_usage(true);
                self::debugLog(' FALLBACK - File not found in any location, using placeholder (Memory: ' . round($endMemory/1024/1024, 2) . 'MB)');
                return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
            }
        }
        
        // Get image info
        $imageInfo = getimagesize($localPath);
        if (!$imageInfo) {
            self::debugLog(' Invalid image: ' . $localPath . ', using placeholder');
            return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        $originalWidth = $imageInfo[0];
        $originalHeight = $imageInfo[1];
        $mimeType = $imageInfo['mime'];
        
        // Get DPI information if available
        $dpiX = $imageInfo['channels'] ?? 0;
        $dpiY = $imageInfo['bits'] ?? 0;
        
        // Try to get actual DPI from EXIF data for JPEG images
        $actualDpi = 72; // Default DPI
        if ($mimeType === 'image/jpeg') {
            $exif = @exif_read_data($localPath);
            if ($exif && isset($exif['COMPUTED']['XResolution']) && isset($exif['COMPUTED']['YResolution'])) {
                $actualDpi = (int)$exif['COMPUTED']['XResolution'];
                self::debugLog(' DPI detected: ' . $actualDpi . ' from EXIF data');
            }
        }
        
        // Calculate effective display size based on DPI
        $displayWidth = $originalWidth / ($actualDpi / 72); // Convert to 72 DPI equivalent
        $displayHeight = $originalHeight / ($actualDpi / 72);
        
        self::debugLog(' Original: ' . $originalWidth . 'x' . $originalHeight . 'px, DPI: ' . $actualDpi . ', Display size: ' . round($displayWidth) . 'x' . round($displayHeight) . 'px');
        
        // Initialize effective dimensions
        $effectiveWidth = $originalWidth;
        $effectiveHeight = $originalHeight;
        
        // If image has high DPI (>150), use display size for calculations
        if ($actualDpi > 150) {
            $effectiveWidth = round($displayWidth);
            $effectiveHeight = round($displayHeight);
            self::debugLog(' High DPI image detected, using effective size: ' . $effectiveWidth . 'x' . $effectiveHeight);
        }
        
        // Ensure effective dimensions are valid
        if ($effectiveWidth <= 0) $effectiveWidth = $originalWidth;
        if ($effectiveHeight <= 0) $effectiveHeight = $originalHeight;
        
        // Validate effective image dimensions
        if ($effectiveWidth <= 0 || $effectiveHeight <= 0) {
            self::debugLog(' Invalid effective image dimensions: ' . $effectiveWidth . 'x' . $effectiveHeight . ' for file: ' . $localPath);
            return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        self::debugLog(' Effective image: ' . $effectiveWidth . 'x' . $effectiveHeight . ', MIME: ' . $mimeType);
        
        // Calculate new dimensions while maintaining aspect ratio
        // If maxWidth or maxHeight is null, use effective dimensions
        if ($maxWidth === null || $maxHeight === null) {
            // Memory-based safety check: estimate memory needed for image processing
            $bytesPerPixel = 4; // RGBA
            $estimatedMemory = $effectiveWidth * $effectiveHeight * $bytesPerPixel * 3; // Source + destination + buffer
            $currentMemory = memory_get_usage(true);
            $memoryLimit = ini_get('memory_limit');
            $memoryLimitBytes = $memoryLimit === '-1' ? PHP_INT_MAX : (int)$memoryLimit * 1024 * 1024;
            $availableMemory = $memoryLimitBytes - $currentMemory;
            
            self::debugLog(' Image: ' . $effectiveWidth . 'x' . $effectiveHeight . ', Est. memory: ' . round($estimatedMemory/1024/1024) . 'MB, Available: ' . round($availableMemory/1024/1024) . 'MB');
            
            // Safety check: limit extremely large images to prevent memory issues
            $maxAllowedSize = 4000; // 4000px max for effective size
            if ($effectiveWidth > $maxAllowedSize || $effectiveHeight > $maxAllowedSize || $estimatedMemory > $availableMemory * 0.8) {
                if ($estimatedMemory > $availableMemory * 0.8) {
                    self::debugLog(' Image would use too much memory, reducing size');
                }
                self::debugLog(' Image too large (' . $effectiveWidth . 'x' . $effectiveHeight . '), limiting to ' . $maxAllowedSize . 'px');
                $ratio = min($maxAllowedSize / $effectiveWidth, $maxAllowedSize / $effectiveHeight);
                $newWidth = round($effectiveWidth * $ratio);
                $newHeight = round($effectiveHeight * $ratio);
            } else {
                $newWidth = $effectiveWidth;
                $newHeight = $effectiveHeight;
            }
        } else {
            $ratio = min($maxWidth / $effectiveWidth, $maxHeight / $effectiveHeight);
            $newWidth = round($effectiveWidth * $ratio);
            $newHeight = round($effectiveHeight * $ratio);
        }
        
        // Validate calculated dimensions
        if ($newWidth <= 0 || $newHeight <= 0 || $newWidth > 65535 || $newHeight > 65535) {
            self::debugLog(' Invalid calculated dimensions: ' . $newWidth . 'x' . $newHeight . ' (original: ' . $originalWidth . 'x' . $originalHeight . ')');
            return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        self::debugLog(' Final dimensions: ' . $newWidth . 'x' . $newHeight . ' (original: ' . $originalWidth . 'x' . $originalHeight . ')');
        
        // Create image resource based on type
        switch ($mimeType) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($localPath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($localPath);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($localPath);
                break;
            default:
                self::debugLog(' Unsupported image type: ' . $mimeType . ', using placeholder');
                return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        if (!$source) {
            self::debugLog(' Failed to create image resource: ' . $localPath . ', using placeholder');
            return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        // Create new image with new dimensions
        $destination = imagecreatetruecolor($newWidth, $newHeight);
        
        if (!$destination) {
            self::debugLog(' Failed to create destination image with dimensions: ' . $newWidth . 'x' . $newHeight);
            imagedestroy($source);
            return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        // Preserve transparency for PNG images
        if ($mimeType === 'image/png') {
            imagealphablending($destination, false);
            imagesavealpha($destination, true);
            $transparent = imagecolorallocatealpha($destination, 255, 255, 255, 127);
            imagefilledrectangle($destination, 0, 0, $newWidth, $newHeight, $transparent);
        }
        
        // Resize image
        $resampleResult = imagecopyresampled($destination, $source, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);
        
        if (!$resampleResult) {
            self::debugLog(' Failed to resample image from ' . $originalWidth . 'x' . $originalHeight . ' to ' . $newWidth . 'x' . $newHeight);
            imagedestroy($source);
            imagedestroy($destination);
            return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        // Output to buffer
        ob_start();
        switch ($mimeType) {
            case 'image/jpeg':
                imagejpeg($destination, null, $quality);
                break;
            case 'image/png':
                imagepng($destination, null, 9); // PNG compression level 0-9
                break;
            case 'image/gif':
                imagegif($destination);
                break;
        }
        $imageData = ob_get_clean();
        
        // Clean up
        imagedestroy($source);
        imagedestroy($destination);
        
        // Convert to base64
        $base64 = 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
        
        $endMemory = memory_get_usage(true);
        $memoryUsed = $endMemory - $startMemory;
        $base64Length = strlen($base64);
        
        // Check if base64 is too large (might cause issues with DomPDF or browsers)
        $maxBase64Size = 10 * 1024 * 1024; // 10MB limit for base64
        if ($base64Length > $maxBase64Size) {
            self::debugLog(' FALLBACK - Base64 too large (' . round($base64Length/1024/1024, 2) . 'MB), using placeholder');
            return self::getPlaceholderImage($maxWidth ?? 300, $maxHeight ?? 300);
        }
        
        self::debugLog(' SUCCESS - Original: ' . $originalWidth . 'x' . $originalHeight . ', New: ' . $newWidth . 'x' . $newHeight . ', Memory used: ' . round($memoryUsed/1024/1024, 2) . 'MB, Final memory: ' . round($endMemory/1024/1024, 2) . 'MB');
        self::debugLog(' Base64 length: ' . round($base64Length/1024/1024, 2) . 'MB');
        
        return $base64;
    }

    /**
     * Get image path for DomPDF (preferred over base64)
     */
    public static function getImagePath($imageUrl) {
        $imageUrl = ltrim($imageUrl, '/');
        
        // Determine the correct base path based on the image URL
        $localPath = null;
        
        // Get the document root dynamically
        $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '/var/www/html';
        
        if (strpos($imageUrl, 'uploads/products/') === 0) {
            // Product images: stored in public/uploads/products/
            $localPath = $documentRoot . '/public/' . $imageUrl;
        } elseif (strpos($imageUrl, 'uploads/proposals/') === 0) {
            // Proposal images: stored in public/uploads/proposals/
            $localPath = $documentRoot . '/public/' . $imageUrl;
        } else {
            // Fallback: try public/static/ first, then public/
            $localPath = $documentRoot . '/public/static/' . $imageUrl;
            if (!file_exists($localPath)) {
                $localPath = $documentRoot . '/public/' . $imageUrl;
            }
        }
        
        self::debugLog('getImagePath - imageUrl: ' . $imageUrl);
        self::debugLog('getImagePath - localPath: ' . $localPath);
        
        if (!file_exists($localPath)) {
            self::debugLog('getImagePath - File not found: ' . $localPath);
            // Try alternative paths
            $alternativePaths = [
                __DIR__ . '/../../public/' . $imageUrl,
                __DIR__ . '/../../../public/' . $imageUrl,
                $documentRoot . '/' . $imageUrl
            ];
            
            foreach ($alternativePaths as $altPath) {
                self::debugLog('getImagePath - Trying alternative path: ' . $altPath);
                if (file_exists($altPath)) {
                    $localPath = $altPath;
                    self::debugLog('getImagePath - Found file at: ' . $localPath);
                    break;
                }
            }
            
            if (!file_exists($localPath)) {
                self::debugLog('getImagePath - File not found in any location');
                return null;
            }
        }
        
        return $localPath;
    }

    /**
     * Convert newlines to HTML break tags while keeping HTML safe
     * 
     * @param string $text The text to process
     * @return string Text with newlines converted to <br> tags and HTML escaped
     */
    public static function nl2brSafe($text) {
        // First escape HTML to prevent XSS
        $text = htmlspecialchars($text);
        // Then convert newlines to <br> tags
        return nl2br($text);
    }

    /**
     * Generate a placeholder image as base64 SVG
     */
    public static function getPlaceholderImage($width = 300, $height = 300) {
        // Create a simple SVG placeholder with better font compatibility
        $svg = '<svg width="' . $width . '" height="' . $height . '" xmlns="http://www.w3.org/2000/svg">';
        $svg .= '<rect width="100%" height="100%" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>';
        $svg .= '<text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="' . max(12, min($width, $height) / 12) . '" text-anchor="middle" dy=".3em" fill="#999">No Image</text>';
        $svg .= '<text x="50%" y="65%" font-family="Arial, Helvetica, sans-serif" font-size="' . max(10, min($width, $height) / 18) . '" text-anchor="middle" dy=".3em" fill="#ccc">Available</text>';
        $svg .= '</svg>';
        
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }
    
    // Keep the original method for backward compatibility
    public static function imageToBase64Original($imageUrl) {
        $imageUrl = ltrim($imageUrl, '/');
        
        // Determine the correct base path based on the image URL
        $localPath = null;
        
        // Get the document root dynamically
        $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '/var/www/html';
        
        if (strpos($imageUrl, 'uploads/products/') === 0) {
            // Product images: stored in public/uploads/products/
            $localPath = $documentRoot . '/public/' . $imageUrl;
        } elseif (strpos($imageUrl, 'uploads/proposals/') === 0) {
            // Proposal images: stored in public/uploads/proposals/
            $localPath = $documentRoot . '/public/' . $imageUrl;
        } else {
            // Fallback: try public/static/ first, then public/
            $localPath = $documentRoot . '/public/static/' . $imageUrl;
            if (!file_exists($localPath)) {
                $localPath = $documentRoot . '/public/' . $imageUrl;
            }
        }
        
        self::debugLog(' imageUrl: ' . $imageUrl);
        self::debugLog(' localPath: ' . $localPath);
        
        if (!file_exists($localPath)) {
            self::debugLog(' File not found: ' . $localPath);
            return null;
        }
        
        $type = pathinfo($localPath, PATHINFO_EXTENSION);
        $data = file_get_contents($localPath);
        $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
        return $base64;
    }
} 