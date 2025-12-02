<?php

namespace App\Utils;

/**
 * Security-Focused Input Validator
 * Implements OWASP Top 10 protection against injection attacks
 */
class SecurityValidator
{
    /**
     * Comprehensive input validation with security focus
     * 
     * @param array $data Input data to validate
     * @param array $rules Validation rules
     * @return array Sanitized and validated data
     * @throws \Exception If validation fails
     */
    public static function validate($data, $rules)
    {
        $sanitized = [];
        $errors = [];

        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;
            
            // Apply validation rules
            $result = self::validateField($field, $value, $rule);
            
            if ($result['valid']) {
                $sanitized[$field] = $result['value'];
            } else {
                $errors[$field] = $result['error'];
            }
        }

        if (!empty($errors)) {
            throw new \Exception('Validation failed: ' . json_encode($errors));
        }

        return $sanitized;
    }

    /**
     * Validate a single field
     * 
     * @param string $field Field name
     * @param mixed $value Field value
     * @param array $rule Validation rules
     * @return array Validation result
     */
    private static function validateField($field, $value, $rule)
    {
        // Check if required
        if (isset($rule['required']) && $rule['required'] && (is_null($value) || $value === '')) {
            return ['valid' => false, 'error' => "$field is required"];
        }

        // Skip validation if not required and empty
        if ((!isset($rule['required']) || !$rule['required']) && (is_null($value) || $value === '')) {
            return ['valid' => true, 'value' => $value];
        }

        // Sanitize based on type
        $sanitized = self::sanitizeByType($value, $rule['type'] ?? 'string');

        // Apply type-specific validation
        switch ($rule['type'] ?? 'string') {
            case 'email':
                if (!filter_var($sanitized, FILTER_VALIDATE_EMAIL)) {
                    return ['valid' => false, 'error' => "$field must be a valid email"];
                }
                break;

            case 'integer':
                if (!is_numeric($sanitized) || (int)$sanitized != $sanitized) {
                    return ['valid' => false, 'error' => "$field must be an integer"];
                }
                $sanitized = (int)$sanitized;
                break;

            case 'float':
                if (!is_numeric($sanitized)) {
                    return ['valid' => false, 'error' => "$field must be a number"];
                }
                $sanitized = (float)$sanitized;
                break;

            case 'url':
                if (!filter_var($sanitized, FILTER_VALIDATE_URL)) {
                    return ['valid' => false, 'error' => "$field must be a valid URL"];
                }
                break;

            case 'date':
                if (!self::isValidDate($sanitized)) {
                    return ['valid' => false, 'error' => "$field must be a valid date"];
                }
                break;

            case 'json':
                if (!self::isValidJson($sanitized)) {
                    return ['valid' => false, 'error' => "$field must be valid JSON"];
                }
                break;
        }

        // Apply length constraints
        if (isset($rule['min_length']) && strlen($sanitized) < $rule['min_length']) {
            return ['valid' => false, 'error' => "$field must be at least {$rule['min_length']} characters"];
        }

        if (isset($rule['max_length']) && strlen($sanitized) > $rule['max_length']) {
            return ['valid' => false, 'error' => "$field must be no more than {$rule['max_length']} characters"];
        }

        // Apply value constraints
        if (isset($rule['min']) && $sanitized < $rule['min']) {
            return ['valid' => false, 'error' => "$field must be at least {$rule['min']}"];
        }

        if (isset($rule['max']) && $sanitized > $rule['max']) {
            return ['valid' => false, 'error' => "$field must be no more than {$rule['max']}"];
        }

        // Apply pattern matching
        if (isset($rule['pattern']) && !preg_match($rule['pattern'], $sanitized)) {
            return ['valid' => false, 'error' => "$field format is invalid"];
        }

        // Apply whitelist/blacklist
        if (isset($rule['whitelist']) && !in_array($sanitized, $rule['whitelist'])) {
            return ['valid' => false, 'error' => "$field must be one of: " . implode(', ', $rule['whitelist'])];
        }

        if (isset($rule['blacklist']) && in_array($sanitized, $rule['blacklist'])) {
            return ['valid' => false, 'error' => "$field contains forbidden value"];
        }

        return ['valid' => true, 'value' => $sanitized];
    }

    /**
     * Sanitize input based on data type
     * 
     * @param mixed $value Input value
     * @param string $type Data type
     * @return mixed Sanitized value
     */
    private static function sanitizeByType($value, $type)
    {
        switch ($type) {
            case 'email':
                return filter_var(trim($value), FILTER_SANITIZE_EMAIL);

            case 'integer':
                return filter_var($value, FILTER_SANITIZE_NUMBER_INT);

            case 'float':
                return filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);

            case 'url':
                return filter_var(trim($value), FILTER_SANITIZE_URL);

            case 'string':
            default:
                return self::sanitizeString($value);
        }
    }

    /**
     * Comprehensive string sanitization
     * 
     * @param string $value Input string
     * @return string Sanitized string
     */
    private static function sanitizeString($value)
    {
        // Remove null bytes
        $value = str_replace(chr(0), '', $value);
        
        // Trim whitespace
        $value = trim($value);
        
        // Remove control characters except newlines and tabs
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        
        // NOTE: Do NOT HTML encode passwords or sensitive data
        // HTML encoding is only for display purposes, not for data processing
        
        return $value;
    }

    /**
     * Validate date format
     * 
     * @param string $date Date string
     * @return bool
     */
    private static function isValidDate($date)
    {
        $formats = ['Y-m-d', 'Y-m-d H:i:s', 'd/m/Y', 'm/d/Y'];
        
        foreach ($formats as $format) {
            $d = \DateTime::createFromFormat($format, $date);
            if ($d && $d->format($format) === $date) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Validate JSON format
     * 
     * @param string $json JSON string
     * @return bool
     */
    private static function isValidJson($json)
    {
        json_decode($json);
        return json_last_error() === JSON_ERROR_NONE;
    }

    /**
     * Validate file upload with security checks
     * 
     * @param array $file $_FILES array element
     * @param array $options Validation options
     * @return array Validation result
     */
    public static function validateFile($file, $options = [])
    {
        $errors = [];

        // Check if file was uploaded
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'No file uploaded or upload error'];
        }

        // Check file size
        $maxSize = $options['max_size'] ?? 5 * 1024 * 1024; // 5MB default
        if ($file['size'] > $maxSize) {
            $errors[] = 'File size exceeds maximum allowed size';
        }

        // Check file type
        if (isset($options['allowed_types'])) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mimeType, $options['allowed_types'])) {
                $errors[] = 'File type not allowed';
            }
        }

        // Check file extension
        if (isset($options['allowed_extensions'])) {
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($extension, $options['allowed_extensions'])) {
                $errors[] = 'File extension not allowed';
            }
        }

        // Additional security checks
        if (isset($options['scan_content']) && $options['scan_content']) {
            if (!self::isFileContentSafe($file['tmp_name'])) {
                $errors[] = 'File content appears to be malicious';
            }
        }

        return [
            'valid' => empty($errors),
            'error' => implode(', ', $errors)
        ];
    }

    /**
     * Basic file content security check
     * 
     * @param string $filePath Path to file
     * @return bool
     */
    private static function isFileContentSafe($filePath)
    {
        $content = file_get_contents($filePath, false, null, 0, 1024); // Read first 1KB
        
        // Check for suspicious patterns
        $suspiciousPatterns = [
            '/<script/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload=/i',
            '/onerror=/i',
            '/eval\(/i',
            '/exec\(/i'
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate SQL query parameters (additional protection)
     * 
     * @param string $query SQL query
     * @param array $params Parameters
     * @return bool
     */
    public static function validateSqlQuery($query, $params)
    {
        // Check for suspicious SQL patterns
        $suspiciousPatterns = [
            '/(\bunion\b.*\bselect\b)/i',
            '/(\bselect\b.*\bunion\b)/i',
            '/(\bdrop\b|\bdelete\b|\binsert\b|\bupdate\b)/i',
            '/(\bexec\b|\bexecute\b)/i',
            '/(\bscript\b)/i'
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $query)) {
                error_log("SECURITY WARNING: Suspicious SQL pattern detected: $query");
                return false;
            }
        }

        // Validate parameter count matches placeholders
        $placeholderCount = substr_count($query, '?') + substr_count($query, ':');
        if ($placeholderCount !== count($params)) {
            error_log("SECURITY WARNING: Parameter count mismatch in SQL query");
            return false;
        }

        return true;
    }
}
