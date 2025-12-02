<?php

namespace App\Utils;

/**
 * Simple SSRF Protection for Dompdf
 * Allows only specific domains for external resources
 */
class SimpleSSRFProtection
{
    private $allowedDomains;
    
    public function __construct()
    {
        // Define allowed domains for external resources
        // Based on actual codebase analysis - your app uses only local resources
        $this->allowedDomains = [
            // Your own domains only (maximum security)
            'sys.carelli.cz',
            'app.carelli.cz', 
            'carelli.cz'
        ];
    }
    
    /**
     * Check if URL is allowed for external resources
     */
    public function isAllowedUrl($url)
    {
        $parsed = parse_url($url);
        
        if (!$parsed || !isset($parsed['host'])) {
            return false;
        }
        
        $host = strtolower($parsed['host']);
        
        // Check if host is in allowed domains
        foreach ($this->allowedDomains as $allowedDomain) {
            if ($host === $allowedDomain || substr($host, -strlen('.' . $allowedDomain)) === '.' . $allowedDomain) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Validate and sanitize URL for Dompdf
     */
    public function validateForDompdf($url)
    {
        // Only allow HTTP/HTTPS protocols
        if (!preg_match('/^https?:\/\//', $url)) {
            return [
                'allowed' => false,
                'error' => 'Only HTTP/HTTPS protocols allowed'
            ];
        }
        
        // Check if URL is allowed
        if (!$this->isAllowedUrl($url)) {
            return [
                'allowed' => false,
                'error' => 'Domain not in allowed list'
            ];
        }
        
        // Basic URL validation
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return [
                'allowed' => false,
                'error' => 'Invalid URL format'
            ];
        }
        
        return [
            'allowed' => true,
            'url' => $url
        ];
    }
    
    /**
     * Add domain to allowed list
     */
    public function addAllowedDomain($domain)
    {
        if (!in_array($domain, $this->allowedDomains)) {
            $this->allowedDomains[] = $domain;
        }
    }
    
    /**
     * Get allowed domains
     */
    public function getAllowedDomains()
    {
        return $this->allowedDomains;
    }
}
