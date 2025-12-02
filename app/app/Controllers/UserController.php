<?php

namespace App\Controllers;

use App\Libraries\UserLibrary;
use App\Utils\JsonResponse;

class UserController
{
    private $userLibrary;
    private $simpleAuth;

    public function __construct()
    {
        $this->userLibrary = new UserLibrary();
        $this->simpleAuth = new \App\Utils\SimpleAuth();
    }

    public function getUser($id)
    {
        // Simple admin check
        $this->simpleAuth->requireAdmin();

        $user = $this->userLibrary->getUser($id);
        JsonResponse::send($user);
    }

    public function getAllUsers()
    {
        // Simple admin check
        $this->simpleAuth->requireAdmin();

        $users = $this->userLibrary->getUsers();
        JsonResponse::send($users);
    }

    public function createUser()
    {
        // Simple admin check
        $this->simpleAuth->requireAdmin();

        // Enhanced input validation
        $data = json_decode(file_get_contents('php://input'), true);
        
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
                    'min_length' => 8,
                    'max_length' => 255
                ],
                'first_name' => [
                    'type' => 'string',
                    'required' => true,
                    'max_length' => 50,
                    'pattern' => '/^[a-zA-Z\s]+$/'
                ],
                'last_name' => [
                    'type' => 'string',
                    'required' => true,
                    'max_length' => 50,
                    'pattern' => '/^[a-zA-Z\s]+$/'
                ],
                'phone_number' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 20
                ]
            ]);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Invalid input: ' . $e->getMessage()], 400);
        }

        $result = $this->userLibrary->addUser($validatedData);
        JsonResponse::send($result, 201);
    }

    public function updateUser($id)
    {
        // Simple admin check
        $this->simpleAuth->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        
        // Enhanced input validation
        try {
            $validatedData = \App\Utils\InputValidator::validateSecure($data, [
                'email' => [
                    'type' => 'email',
                    'required' => false,
                    'max_length' => 100
                ],
                'first_name' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 50,
                    'pattern' => '/^[a-zA-Z\s]+$/'
                ],
                'last_name' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 50,
                    'pattern' => '/^[a-zA-Z\s]+$/'
                ],
                'phone_number' => [
                    'type' => 'string',
                    'required' => false,
                    'max_length' => 20
                ],
                'is_active' => [
                    'type' => 'integer',
                    'required' => false,
                    'min' => 0,
                    'max' => 1
                ]
            ]);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => 'Invalid input: ' . $e->getMessage()], 400);
        }

        $result = $this->userLibrary->updateUser($id, $validatedData);
        JsonResponse::send($result);
    }

    public function deleteUser($id)
    {
        // Simple admin check
        $this->simpleAuth->requireAdmin();

        $result = $this->userLibrary->deleteUser($id);
        JsonResponse::send($result);
    }
}
