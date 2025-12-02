<?php

namespace App\Models;

use Config\Database;

class SessionModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function authenticate($email, $password)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email AND is_active = 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            return $user;
        }

        return null;
    }

    public function createSession($userId)
    {
        // Generate cryptographically secure token
        $token = bin2hex(random_bytes(32));
        // Initial session duration: 8 hours (will be extended with activity)
        $expiresAt = date('Y-m-d H:i:s', strtotime('+8 hours'));
        
        // Get client information for audit logging only (not enforced for validation)
        // Stored for debugging/analytics, but we don't terminate sessions if they change
        $clientIp = $this->getClientIp();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $userAgentHash = hash('sha256', $userAgent);

        // Clean up expired sessions to keep the table tidy
        $this->cleanupExpiredSessions();
        
        // Allow multiple active sessions per user (up to 10 concurrent sessions)
        // Remove oldest sessions if user has too many active ones
        $this->limitUserSessions($userId, 10);

        // Check if the sessions table has the new security columns
        $hasSecurityColumns = $this->hasSecurityColumns();
        
        if ($hasSecurityColumns) {
            // Use enhanced session creation with security tracking
            $stmt = $this->db->prepare("
                INSERT INTO sessions (user_id, token, expires_at, ip_address, browser_string, created_at)
                VALUES (:user_id, :token, :expires_at, :ip_address, :browser_string, NOW())
            ");
            $stmt->execute([
                ':user_id' => $userId, 
                ':token' => $token, 
                ':expires_at' => $expiresAt,
                ':ip_address' => $clientIp,
                ':browser_string' => $userAgent
            ]);
        } else {
            // Fallback to basic session creation
            $stmt = $this->db->prepare("
                INSERT INTO sessions (user_id, token, expires_at, created_at)
                VALUES (:user_id, :token, :expires_at, NOW())
            ");
            $stmt->execute([
                ':user_id' => $userId, 
                ':token' => $token, 
                ':expires_at' => $expiresAt
            ]);
        }

        // Log successful session creation
        \App\Utils\Logger::info("Session created for user {$userId} from IP {$clientIp}");

        return ['token' => $token, 'expires_at' => $expiresAt];
    }

    public function terminateSession($token)
    {
        $stmt = $this->db->prepare("UPDATE sessions SET is_active = 0 WHERE token = :token");
        $stmt->execute([':token' => $token]);
    }

    /**
     * Extend session expiry time (sliding window approach)
     * Extends session by 1 hour on each valid request
     */
    public function extendSession($token)
    {
        try {
            // Extend session by 1 hour from now
            $newExpiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $stmt = $this->db->prepare("
                UPDATE sessions 
                SET expires_at = :expires_at 
                WHERE token = :token AND is_active = 1
            ");
            $stmt->execute([
                ':expires_at' => $newExpiresAt,
                ':token' => $token
            ]);
            
            // Only log occasionally to avoid log spam (every 10 minutes)
            // Check if we should log based on random chance (1 in 10)
            if (rand(1, 10) === 1) {
                \App\Utils\Logger::info("Session extended for token: " . substr($token, 0, 8) . "...");
            }
        } catch (\Exception $e) {
            // Don't fail the request if session extension fails
            \App\Utils\Logger::error("Failed to extend session: " . $e->getMessage());
        }
    }

    /**
     * Renew session with a longer expiry (called during explicit token renewal)
     * Extends session by 8 hours from now (same as initial session duration)
     * Returns the new expiry time
     * 
     * @param string $token
     * @return string New expires_at timestamp
     */
    public function renewSession($token)
    {
        // Extend by 8 hours (same as initial session duration)
        $newExpiresAt = date('Y-m-d H:i:s', strtotime('+8 hours'));
        
        $stmt = $this->db->prepare("
            UPDATE sessions 
            SET expires_at = :expires_at 
            WHERE token = :token AND is_active = 1
        ");
        $stmt->execute([
            ':expires_at' => $newExpiresAt,
            ':token' => $token
        ]);
        
        \App\Utils\Logger::info("Session renewed for token: " . substr($token, 0, 8) . "... (new expiry: 8 hours)");
        
        return $newExpiresAt;
    }

    public function getSessionByToken($token)
    {
        $stmt = $this->db->prepare("SELECT * FROM sessions WHERE token = :token AND is_active = 1");
        $stmt->execute([':token' => $token]);
        $session = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if ($session) {
            // Check if session has expired
            if (strtotime($session['expires_at']) < time()) {
                $this->terminateSession($token);
                \App\Utils\Logger::info("Session expired for token: " . substr($token, 0, 8) . "...");
                return null;
            }
            
            // Note: We intentionally don't check IP/User-Agent changes to avoid false positives
            // Reasons: VPN changes, network switches, proxy rotation, browser updates
            // The cryptographic token (64 hex chars) provides sufficient security
            
            // Implement sliding window: extend session on each valid request
            $this->extendSession($token);
        }
        
        return $session;
    }

    public function getUserRoles($userId)
    {
        $stmt = $this->db->prepare("
            SELECT r.role_name
            FROM user_role ur
            INNER JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = :user_id AND ur.is_active = 1
        ");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    /**
     * Terminate all sessions for a specific user
     * 
     * @param int $userId
     */
    public function terminateAllUserSessions($userId)
    {
        $stmt = $this->db->prepare("UPDATE sessions SET is_active = 0 WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        
        \App\Utils\Logger::info("All sessions terminated for user {$userId}");
    }

    /**
     * Limit the number of active sessions for a user
     * Removes oldest sessions if user exceeds the limit
     * 
     * @param int $userId
     * @param int $maxSessions Maximum number of concurrent sessions allowed
     */
    public function limitUserSessions($userId, $maxSessions = 10)
    {
        // Count active sessions for this user
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM sessions 
            WHERE user_id = :user_id AND is_active = 1 AND expires_at > NOW()
        ");
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        $activeCount = $result['count'];
        
        // If user has too many sessions, terminate the oldest ones
        if ($activeCount >= $maxSessions) {
            $sessionsToRemove = $activeCount - $maxSessions + 1; // +1 for the new session we're about to create
            
            $stmt = $this->db->prepare("
                UPDATE sessions 
                SET is_active = 0 
                WHERE user_id = :user_id 
                AND is_active = 1 
                ORDER BY created_at ASC 
                LIMIT :limit
            ");
            $stmt->bindValue(':user_id', $userId, \PDO::PARAM_INT);
            $stmt->bindValue(':limit', $sessionsToRemove, \PDO::PARAM_INT);
            $stmt->execute();
            
            \App\Utils\Logger::info("Terminated {$sessionsToRemove} old session(s) for user {$userId} (limit: {$maxSessions})");
        }
    }

    /**
     * Get client IP address with proxy support
     * 
     * @return string
     */
    private function getClientIp()
    {
        // Check for forwarded IP (behind proxy/load balancer)
        $forwardedFor = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        if ($forwardedFor) {
            // Take the first IP if multiple are present
            $ips = explode(',', $forwardedFor);
            return trim($ips[0]);
        }
        
        // Check for real IP header
        $realIp = $_SERVER['HTTP_X_REAL_IP'] ?? '';
        if ($realIp) {
            return $realIp;
        }
        
        // Fall back to remote address
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    // Removed updateLastActivity method since we use expires_at for TTL

    /**
     * Clean up expired sessions
     */
    public function cleanupExpiredSessions()
    {
        $stmt = $this->db->prepare("
            UPDATE sessions 
            SET is_active = 0 
            WHERE expires_at < NOW() AND is_active = 1
        ");
        $stmt->execute();
        
        $affectedRows = $stmt->rowCount();
        if ($affectedRows > 0) {
            \App\Utils\Logger::info("Cleaned up {$affectedRows} expired sessions");
        }
    }

    /**
     * Get session statistics for monitoring
     * 
     * @return array
     */
    public function getSessionStats()
    {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_sessions,
                COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_sessions
            FROM sessions
        ");
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Check if the sessions table has security columns
     * 
     * @return bool
     */
    private function hasSecurityColumns()
    {
        try {
            $stmt = $this->db->prepare("SHOW COLUMNS FROM sessions LIKE 'ip_address'");
            $stmt->execute();
            return $stmt->rowCount() > 0;
        } catch (\Exception $e) {
            // If we can't check columns, assume they don't exist
            return false;
        }
    }
}
