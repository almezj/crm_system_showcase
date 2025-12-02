<?php

namespace App\Controllers;

use App\Models\SessionModel;
use App\Utils\JsonResponse;

class AuthController
{
    private $sessionModel;

    public function __construct()
    {
        $this->sessionModel = new SessionModel();
    }

    public function login()
    {
        try {
            // Apply simple rate limiting for login attempts
            \App\Middlewares\SimpleRateLimitMiddleware::forLogin();

            $data = json_decode(file_get_contents('php://input'), true);

            // Check if JSON decode was successful
            if (json_last_error() !== JSON_ERROR_NONE) {
                JsonResponse::send(['error' => 'Invalid JSON data'], 400);
                return;
            }

            // Enhanced input validation with security features
            try {
                $validatedData = \App\Utils\InputValidator::validateSecure($data, [
                    'email' => [
                        'type' => 'email',
                        'required' => true,
                        'max_length' => 100
                    ],
                    'password' => [
                        'type' => 'string',
                        'required' => true,
                        'min_length' => 1,
                        'max_length' => 255
                    ]
                ]);
            } catch (\Exception $e) {
                \App\Utils\Logger::error("Login validation failed: " . $e->getMessage());
                JsonResponse::send(['error' => 'Invalid input: ' . $e->getMessage()], 400);
                return;
            }

            $user = $this->sessionModel->authenticate($validatedData['email'], $validatedData['password']);

            if (!$user) {
                \App\Utils\Logger::error("Login failed for email: " . $validatedData['email']);
                JsonResponse::send(['error' => 'Invalid credentials'], 401);
                return;
            }

            $session = $this->sessionModel->createSession($user['user_id']);
            JsonResponse::send([
                'token' => $session['token'],
                'expires_at' => $session['expires_at'],
                'user' => [
                    'user_id' => $user['user_id'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'email' => $user['email'],
                    'is_active' => $user['is_active'],
                    'phone_number' => $user['phone_number'] ?? null
                ]
            ], 200);

        } catch (\Exception $e) {
            \App\Utils\Logger::error("Login error: " . $e->getMessage() . " - Trace: " . $e->getTraceAsString());
            JsonResponse::send(['error' => 'Internal server error'], 500);
        }
    }

    public function logout()
    {
        $headers = getallheaders();

        try {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $this->sessionModel->terminateSession($token);
            JsonResponse::send(['message' => 'Logged out successfully'], 200);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 401);
        }
    }

    public function renewToken()
    {
        $headers = getallheaders();

        // Use standard Authorization header (RFC 6750)
        $token = null;
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
        }

        if (!$token) {
            JsonResponse::send(['error' => 'Authorization token missing'], 401);
            return;
        }

        $session = $this->sessionModel->getSessionByToken($token);

        if (!$session || !$session['is_active'] || strtotime($session['expires_at']) < time()) {
            JsonResponse::send(['error' => 'Invalid or expired token'], 401);
            return;
        }

        // Instead of creating a new session (which terminates all existing ones),
        // just extend the current session with a longer expiry time
        // This prevents race conditions when multiple tabs try to renew simultaneously
        $newExpiresAt = $this->sessionModel->renewSession($token);
        
        $userModel = new \App\Models\UserModel();
        $user = $userModel->get($session['user_id']);
        JsonResponse::send([
            'token' => $token, // Keep the same token
            'expires_at' => $newExpiresAt,
            'user' => $user
        ], 200);
    }
}
