<?php
namespace App\Utils;

class JsonResponse {
    public static function send($data, $status = 200) {
        // Set CORS headers
        header("Access-Control-Allow-Origin: http://localhost:3000");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        
        http_response_code($status);
        header("Content-Type: application/json");
        
        // Don't modify the data structure to maintain backward compatibility
        // Use success() method for new responses that need the wrapper
        
        echo json_encode($data);
        exit();
    }
    
    /**
     * Send success response with data
     *
     * @param mixed $data Response data
     * @param int $status HTTP status code
     * @param string $message Optional success message
     */
    public static function success($data, $status = 200, $message = null)
    {
        $response = [
            'success' => true,
            'data' => $data,
            'timestamp' => date('c')
        ];
        
        if ($message) {
            $response['message'] = $message;
        }
        
        self::send($response, $status);
    }
    
    /**
     * Send error response (delegates to ErrorResponse for consistency)
     *
     * @param string $message Error message
     * @param int $httpCode HTTP status code
     * @param string $code Error code
     * @param array $details Error details
     */
    public static function error($message, $httpCode = 500, $code = null, $details = null)
    {
        ErrorResponse::send($message, $httpCode, $code, $details);
    }
}
?>
