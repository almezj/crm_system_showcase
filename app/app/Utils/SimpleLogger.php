<?php

namespace App\Utils;

/**
 * Simple Security Logger
 * Basic logging for security events
 */
class SimpleLogger
{
    private $logFile;
    
    public function __construct($logFile = null)
    {
        $this->logFile = $logFile ?: __DIR__ . '/../../logs/security.log';
        
        // Create log directory if it doesn't exist
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    /**
     * Log security event
     */
    public function logSecurityEvent($event, $details = [])
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'ip' => $this->getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'details' => $details
        ];
        
        $this->writeLog($logEntry);
    }
    
    /**
     * Log authentication failure
     */
    public function logAuthFailure($email, $reason = 'Invalid credentials')
    {
        $this->logSecurityEvent('auth_failure', [
            'email' => $email,
            'reason' => $reason
        ]);
    }
    
    /**
     * Log access denied
     */
    public function logAccessDenied($resource, $action = 'access')
    {
        $this->logSecurityEvent('access_denied', [
            'resource' => $resource,
            'action' => $action
        ]);
    }
    
    /**
     * Log suspicious activity
     */
    public function logSuspiciousActivity($activity, $details = [])
    {
        $this->logSecurityEvent('suspicious_activity', [
            'activity' => $activity,
            'details' => $details
        ]);
    }
    
    /**
     * Log rate limit exceeded
     */
    public function logRateLimitExceeded($endpoint, $ip)
    {
        $this->logSecurityEvent('rate_limit_exceeded', [
            'endpoint' => $endpoint,
            'ip' => $ip
        ]);
    }
    
    /**
     * Get client IP
     */
    private function getClientIp()
    {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Write log entry
     */
    private function writeLog($logEntry)
    {
        $logLine = json_encode($logEntry) . "\n";
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Get recent security events
     */
    public function getRecentEvents($limit = 100)
    {
        if (!file_exists($this->logFile)) {
            return [];
        }
        
        $lines = file($this->logFile, FILE_IGNORE_NEW_LINES);
        $events = [];
        
        foreach (array_slice($lines, -$limit) as $line) {
            $event = json_decode($line, true);
            if ($event) {
                $events[] = $event;
            }
        }
        
        return array_reverse($events);
    }
    
    /**
     * Clean old logs (keep last 1000 entries)
     */
    public function cleanOldLogs()
    {
        if (!file_exists($this->logFile)) {
            return;
        }
        
        $lines = file($this->logFile, FILE_IGNORE_NEW_LINES);
        
        if (count($lines) > 1000) {
            $recentLines = array_slice($lines, -1000);
            file_put_contents($this->logFile, implode("\n", $recentLines) . "\n");
        }
    }
}
