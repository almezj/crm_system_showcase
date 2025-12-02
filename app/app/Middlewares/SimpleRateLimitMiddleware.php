<?php

namespace App\Middlewares;

use App\Utils\SimpleRateLimiter;
use App\Utils\JsonResponse;

/**
 * Simple Rate Limit Middleware
 * Lightweight rate limiting for specific endpoints
 */
class SimpleRateLimitMiddleware
{
    private $rateLimiter;
    
    public function __construct()
    {
        $this->rateLimiter = new SimpleRateLimiter();
    }
    
    /**
     * Apply rate limiting to login endpoint
     */
    public static function forLogin()
    {
        $middleware = new self();
        return $middleware->applyRateLimit('login');
    }
    
    /**
     * Apply rate limiting to API endpoint
     */
    public static function forApi()
    {
        $middleware = new self();
        return $middleware->applyRateLimit('api');
    }
    
    /**
     * Apply rate limiting to upload endpoint
     */
    public static function forUpload()
    {
        $middleware = new self();
        return $middleware->applyRateLimit('upload');
    }
    
    /**
     * Apply rate limiting to general endpoint
     */
    public static function forGeneral()
    {
        $middleware = new self();
        return $middleware->applyRateLimit('general');
    }
    
    /**
     * Apply rate limit check
     */
    public function applyRateLimit($type = 'general')
    {
        $identifier = $this->rateLimiter->getClientIp();
        
        $result = $this->rateLimiter->checkRateLimit($identifier, $type);
        
        if (!$result['allowed']) {
            JsonResponse::send([
                'error' => 'Rate limit exceeded',
                'limit' => $result['limit'],
                'reset_time' => $result['reset_time']
            ], 429);
            exit;
        }
        
        // Record the request
        $this->rateLimiter->recordRequest($identifier, $type);
        
        return true;
    }
}
