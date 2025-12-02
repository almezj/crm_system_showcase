<?php

namespace App\Utils;

class ErrorResponse
{
    /**
     * Send a standardized error response
     *
     * @param string $message User-friendly error message
     * @param int $httpCode HTTP status code
     * @param string $code Error code for frontend handling
     * @param array $details Additional error details
     * @param array $validationErrors Validation errors if applicable
     */
    public static function send($message, $httpCode = 500, $code = null, $details = null, $validationErrors = null)
    {
        // Set CORS headers
        header("Access-Control-Allow-Origin: http://localhost:3000");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        
        http_response_code($httpCode);
        header("Content-Type: application/json");
        
        $response = [
            'error' => $message,
            'timestamp' => date('c'),
            'success' => false
        ];
        
        if ($code) {
            $response['code'] = $code;
        }
        
        if ($details) {
            $response['details'] = $details;
        }
        
        if ($validationErrors) {
            $response['validation_errors'] = $validationErrors;
        }
        
        // Log the error for debugging
        Logger::error("API Error Response: " . json_encode($response));
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * Send validation error response
     *
     * @param array $validationErrors Array of validation errors
     * @param string $message Optional custom message
     */
    public static function validationError($validationErrors, $message = "Validation failed")
    {
        self::send($message, 400, 'VALIDATION_ERROR', null, $validationErrors);
    }
    
    /**
     * Send not found error response
     *
     * @param string $resource Resource name (e.g., "User", "Product")
     * @param mixed $id Resource ID
     */
    public static function notFound($resource, $id = null)
    {
        $message = $id ? "{$resource} with ID {$id} not found" : "{$resource} not found";
        self::send($message, 404, 'NOT_FOUND');
    }
    
    /**
     * Send unauthorized error response
     *
     * @param string $message Optional custom message
     */
    public static function unauthorized($message = "Unauthorized access")
    {
        self::send($message, 401, 'UNAUTHORIZED');
    }
    
    /**
     * Send forbidden error response
     *
     * @param string $message Optional custom message
     */
    public static function forbidden($message = "Access forbidden")
    {
        self::send($message, 403, 'FORBIDDEN');
    }
    
    /**
     * Send server error response
     *
     * @param string $message Optional custom message
     * @param string $details Optional error details for debugging
     */
    public static function serverError($message = "Internal server error", $details = null)
    {
        self::send($message, 500, 'SERVER_ERROR', $details);
    }
    
    /**
     * Send conflict error response (e.g., duplicate resource)
     *
     * @param string $message Error message
     */
    public static function conflict($message)
    {
        self::send($message, 409, 'CONFLICT');
    }
    
    /**
     * Send bad request error response
     *
     * @param string $message Error message
     * @param array $details Optional details
     */
    public static function badRequest($message, $details = null)
    {
        self::send($message, 400, 'BAD_REQUEST', $details);
    }
}
