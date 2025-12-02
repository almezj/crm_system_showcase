<?php

namespace App\Utils;

/**
 * Security Headers Utility
 * Implements OWASP Top 10 security headers for web application protection
 */
class SecurityHeaders
{
    /**
     * Set comprehensive security headers
     * Protects against XSS, clickjacking, MIME sniffing, and other attacks
     */
    public static function setSecurityHeaders()
    {
        // Prevent XSS attacks
        header('X-XSS-Protection: 1; mode=block');
        
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Prevent clickjacking attacks
        header('X-Frame-Options: SAMEORIGIN');
        
        // Referrer Policy - Control referrer information
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Content Security Policy - Restrict resource loading
        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .
               "style-src 'self' 'unsafe-inline'; " .
               "img-src 'self' data: https:; " .
               "font-src 'self' data:; " .
               "connect-src 'self'; " .
               "frame-ancestors 'self';";
        header("Content-Security-Policy: $csp");
        
        // Strict Transport Security - Enforce HTTPS (only if HTTPS is detected)
        if (self::isHttps()) {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
        
        // Permissions Policy - Control browser features
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
        
        // Remove server information
        header_remove('Server');
        header_remove('X-Powered-By');
    }
    
    /**
     * Set CORS headers with security considerations
     * 
     * @param string $allowedOrigin Specific origin or '*' for all
     * @param array $allowedMethods Array of allowed HTTP methods
     * @param array $allowedHeaders Array of allowed headers
     * @param bool $allowCredentials Whether to allow credentials
     */
    public static function setCorsHeaders($allowedOrigin = '*', $allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], $allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'], $allowCredentials = true)
    {
        // Security: Avoid wildcard with credentials
        if ($allowCredentials && $allowedOrigin === '*') {
            error_log('SECURITY WARNING: CORS credentials=true with origin=* is insecure');
        }
        
        header("Access-Control-Allow-Origin: $allowedOrigin");
        header("Access-Control-Allow-Methods: " . implode(', ', $allowedMethods));
        header("Access-Control-Allow-Headers: " . implode(', ', $allowedHeaders));
        header("Access-Control-Allow-Credentials: " . ($allowCredentials ? 'true' : 'false'));
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
    
    /**
     * Check if the current request is using HTTPS
     * 
     * @return bool
     */
    private static function isHttps()
    {
        return (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            $_SERVER['SERVER_PORT'] == 443 ||
            (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
            (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on')
        );
    }
    
    /**
     * Set rate limiting headers (for future implementation)
     * 
     * @param int $limit Number of requests allowed
     * @param int $window Time window in seconds
     * @param int $remaining Remaining requests
     */
    public static function setRateLimitHeaders($limit, $window, $remaining)
    {
        header("X-RateLimit-Limit: $limit");
        header("X-RateLimit-Window: $window");
        header("X-RateLimit-Remaining: $remaining");
    }
}
