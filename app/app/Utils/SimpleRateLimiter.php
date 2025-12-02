<?php

namespace App\Utils;

/**
 * Simple File-Based Rate Limiter
 * Lightweight rate limiting without database dependency
 */
class SimpleRateLimiter
{
    private $storageDir;
    private $limits;
    
    public function __construct($storageDir = null)
    {
        $this->storageDir = $storageDir ?: __DIR__ . '/rate_limit_storage';
        
        // Create storage directory if it doesn't exist
        if (!is_dir($this->storageDir)) {
            try {
                mkdir($this->storageDir, 0755, true);
            } catch (\Exception $e) {
                // If we can't create the directory, use a fallback
                $this->storageDir = sys_get_temp_dir() . '/carelli_rate_limit';
                if (!is_dir($this->storageDir)) {
                    mkdir($this->storageDir, 0755, true);
                }
            }
        }
        
        // Define rate limits (requests per minute)
        $this->limits = [
            'login' => 5,      // 5 login attempts per minute
            'api' => 60,       // 60 API requests per minute
            'upload' => 10,    // 10 uploads per minute
            'general' => 100   // 100 general requests per minute
        ];
    }
    
    /**
     * Check if request is within rate limit
     */
    public function checkRateLimit($identifier, $type = 'general')
    {
        $limit = $this->limits[$type] ?? $this->limits['general'];
        $file = $this->getStorageFile($identifier, $type);
        
        // Read current count
        $data = $this->readData($file);
        $now = time();
        $minute = floor($now / 60);
        
        // Clean old data (older than 1 minute)
        if (isset($data['minute']) && $data['minute'] < $minute) {
            $data = ['count' => 0, 'minute' => $minute];
        }
        
        // Check if limit exceeded
        if (($data['count'] ?? 0) >= $limit) {
            return [
                'allowed' => false,
                'limit' => $limit,
                'remaining' => 0,
                'reset_time' => ($minute + 1) * 60
            ];
        }
        
        return [
            'allowed' => true,
            'limit' => $limit,
            'remaining' => $limit - ($data['count'] ?? 0) - 1,
            'reset_time' => ($minute + 1) * 60
        ];
    }
    
    /**
     * Record a request
     */
    public function recordRequest($identifier, $type = 'general')
    {
        $file = $this->getStorageFile($identifier, $type);
        $data = $this->readData($file);
        $now = time();
        $minute = floor($now / 60);
        
        // Reset count if new minute
        if (!isset($data['minute']) || $data['minute'] < $minute) {
            $data = ['count' => 1, 'minute' => $minute];
        } else {
            $data['count'] = ($data['count'] ?? 0) + 1;
        }
        
        $this->writeData($file, $data);
        
        // Log rate limit exceeded if at limit
        $limit = $this->limits[$type] ?? $this->limits['general'];
        if ($data['count'] >= $limit) {
            $logger = new \App\Utils\SimpleLogger();
            $logger->logRateLimitExceeded($type, $identifier);
        }
    }
    
    /**
     * Get client IP address
     */
    public function getClientIp()
    {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Handle comma-separated IPs (from proxies)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Clean old files (call this periodically)
     */
    public function cleanOldFiles()
    {
        $files = glob($this->storageDir . '/*.json');
        $now = time();
        
        foreach ($files as $file) {
            if (filemtime($file) < $now - 3600) { // Delete files older than 1 hour
                unlink($file);
            }
        }
    }
    
    /**
     * Get storage file path
     */
    private function getStorageFile($identifier, $type)
    {
        $hash = hash('sha256', $identifier);
        return $this->storageDir . "/{$type}_{$hash}.json";
    }
    
    /**
     * Read data from file
     */
    private function readData($file)
    {
        if (!file_exists($file)) {
            return ['count' => 0, 'minute' => 0];
        }
        
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        
        return $data ?: ['count' => 0, 'minute' => 0];
    }
    
    /**
     * Write data to file
     */
    private function writeData($file, $data)
    {
        file_put_contents($file, json_encode($data));
    }
}
