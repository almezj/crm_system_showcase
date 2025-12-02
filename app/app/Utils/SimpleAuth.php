<?php

namespace App\Utils;

use App\Models\SessionModel;
use App\Models\UserModel;

/**
 * Simple Authorization Helper
 * Basic role-based access control
 */
class SimpleAuth
{
    private $sessionModel;
    private $userModel;
    
    public function __construct()
    {
        $this->sessionModel = new SessionModel();
        $this->userModel = new UserModel();
    }
    
    /**
     * Get current user from token
     */
    public function getCurrentUser($token = null)
    {
        if (!$token) {
            $headers = getallheaders();
            // Use standard Authorization header (RFC 6750)
            if (isset($headers['Authorization'])) {
                $token = str_replace('Bearer ', '', $headers['Authorization']);
            }
        }
        
        if (!$token) {
            return null;
        }
        
        $session = $this->sessionModel->getSessionByToken($token);
        if (!$session || !$session['is_active']) {
            return null;
        }
        
        return $this->userModel->get($session['user_id']);
    }
    
    /**
     * Check if user is admin
     */
    public function isAdmin($token = null)
    {
        $user = $this->getCurrentUser($token);
        return $user && $user['role_id'] == 1; // Assuming role_id 1 is admin
    }
    
    /**
     * Check if user is authenticated
     */
    public function isAuthenticated($token = null)
    {
        return $this->getCurrentUser($token) !== null;
    }
    
    /**
     * Require admin access
     */
    public function requireAdmin($token = null)
    {
        if (!$this->isAdmin($token)) {
            JsonResponse::send(['error' => 'Admin access required'], 403);
            exit;
        }
        return true;
    }
    
    /**
     * Require authentication
     */
    public function requireAuth($token = null)
    {
        if (!$this->isAuthenticated($token)) {
            JsonResponse::send(['error' => 'Authentication required'], 401);
            exit;
        }
        return true;
    }
    
    /**
     * Get user ID from token
     */
    public function getUserId($token = null)
    {
        $user = $this->getCurrentUser($token);
        return $user ? $user['user_id'] : null;
    }
}
