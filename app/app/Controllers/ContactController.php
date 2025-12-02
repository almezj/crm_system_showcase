<?php

namespace App\Controllers;

use App\Libraries\ContactLibrary;
use App\Utils\JsonResponse;

class ContactController
{
    private $contactLibrary;

    public function __construct()
    {
        $this->contactLibrary = new ContactLibrary();
    }

    public function getAllContacts()
    {
        $contacts = $this->contactLibrary->getContacts();
        JsonResponse::send($contacts);
    }

    public function createContact()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['person_id']) || !isset($data['type']) || !isset($data['detail'])) {
            JsonResponse::send(['error' => 'Person ID, type, and detail are required'], 400);
        }

        $result = $this->contactLibrary->addContact($data);
        JsonResponse::send($result, 201);
    }

    public function updateContact($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
        }

        $result = $this->contactLibrary->updateContact($id, $data);
        JsonResponse::send($result);
    }

    public function deleteContact($id)
    {
        $this->contactLibrary->deleteContact($id);
        JsonResponse::send(['message' => 'Contact deleted successfully'], 204);
    }
}
