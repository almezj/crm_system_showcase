<?php

namespace App\Utils;

class FileUploader
{
    // Supported image formats
    private static $allowedImageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp'
    ];

    public static function upload($file, $directory, $validateImage = true)
    {
        // Validate image format if requested
        if ($validateImage) {
            self::validateImageFormat($file);
        }

        // Use public/uploads as the base directory for all uploads
        $baseDir = __DIR__ . '/../../public/uploads';
        $uploadDir = rtrim($baseDir . '/' . $directory, '/');
        $filename = uniqid() . '_' . basename($file['name']);
        $filePath = $uploadDir . '/' . $filename;

        // Ensure the upload directory exists
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0775, true)) {
                error_log("Failed to create upload directory: $uploadDir");
                throw new \Exception("Failed to create upload directory: $uploadDir");
            }
        }

        // Check directory is writable
        if (!is_writable($uploadDir)) {
            error_log("Upload directory is not writable: $uploadDir");
            throw new \Exception("Upload directory is not writable: $uploadDir");
        }

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            error_log("move_uploaded_file failed: tmp_name={$file['tmp_name']} filePath=$filePath");
            throw new \Exception("File upload failed: Could not move file to $filePath");
        }

        // Return the path relative to uploads (for serving via uploads route)
        $relativePath = 'uploads/' . $directory . '/' . $filename;
        return $relativePath;
    }

    private static function validateImageFormat($file)
    {
        // Check if file type is in allowed list
        if (!in_array($file['type'], self::$allowedImageTypes)) {
            $allowedFormats = implode(', ', array_map(function($type) {
                return str_replace('image/', '', $type);
            }, self::$allowedImageTypes));
            
            throw new \Exception("Unsupported image format. Allowed formats: " . $allowedFormats);
        }

        // Additional validation: check file size (5MB limit)
        if ($file['size'] > 5 * 1024 * 1024) {
            throw new \Exception("File size too large. Maximum 5MB allowed.");
        }

        // Validate that it's actually an image using getimagesize
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            throw new \Exception("Invalid image file. Please upload a valid image.");
        }
    }

    public static function getAllowedImageTypes()
    {
        return self::$allowedImageTypes;
    }

    public static function getAllowedImageExtensions()
    {
        return array_map(function($type) {
            return str_replace('image/', '', $type);
        }, self::$allowedImageTypes);
    }
}
