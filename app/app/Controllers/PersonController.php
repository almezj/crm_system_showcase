<?php

namespace App\Controllers;

use App\Libraries\PersonLibrary;
use App\Libraries\AddressLibrary;
use App\Utils\JsonResponse;

class PersonController
{
    private $personLibrary;
    private $addressLibrary;

    public function __construct()
    {
        $this->personLibrary = new PersonLibrary();
        $this->addressLibrary = new AddressLibrary();
    }

    public function getAllPersons()
    {
        $persons = $this->personLibrary->getPersons();
        JsonResponse::send($persons);
        return;
    }

    public function getPerson($id)
    {
        $person = $this->personLibrary->getPerson($id);
        if (empty($person)) {
            JsonResponse::send(['error' => 'Person not found'], 404);
            return;
        }
        JsonResponse::send($person);
        return;
    }

    public function createPerson()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['first_name']) || !isset($data['last_name']) || !isset($data['person_type_id'])) {
            JsonResponse::send(['error' => 'First name, last name, and person type are required'], 400);
            return;
        }

        $result = $this->personLibrary->addPerson($data);

        // Handle addresses - skip if create_without_address flag is set
        if (!isset($data['create_without_address']) || !$data['create_without_address']) {
            if (isset($data['addresses']) && is_array($data['addresses'])) {
                foreach ($data['addresses'] as $address) {
                    // Skip empty addresses (all fields empty or address_type_id is null/empty)
                    $hasAddressType = !empty($address['address_type_id']);
                    $hasAddressData = !empty($address['street']) || !empty($address['city']) || !empty($address['country']);
                    
                    if ($hasAddressType && $hasAddressData) {
                        // Map the address fields to match the database structure
                        $addressData = [
                            'address_type_id' => $address['address_type_id'] ?? 1,
                            'street' => $address['street'] ?? '',
                            'floor' => $address['floor'] ?? '',
                            'city' => $address['city'] ?? '',
                            'state_province' => $address['state'] ?? '',
                            'postal_code' => $address['postal_code'] ?? '',
                            'country' => $address['country'] ?? ''
                        ];
                        $addressData['person_id'] = $result['person_id'];
                        $this->addressLibrary->addAddress($addressData);
                    }
                }
            } elseif (isset($data['address'])) {
                // Handle single address for backward compatibility
                $address = $data['address'];
                $hasAddressType = !empty($address['address_type_id']);
                $hasAddressData = !empty($address['street']) || !empty($address['city']) || !empty($address['country']);
                
                if ($hasAddressType && $hasAddressData) {
                    $addressData = [
                        'address_type_id' => $address['address_type_id'] ?? 1,
                        'street' => $address['street'] ?? '',
                        'floor' => $address['floor'] ?? '',
                        'city' => $address['city'] ?? '',
                        'state_province' => $address['state'] ?? '',
                        'postal_code' => $address['postal_code'] ?? '',
                        'country' => $address['country'] ?? ''
                    ];
                    $addressData['person_id'] = $result['person_id'];
                    $this->addressLibrary->addAddress($addressData);
                }
            }
        }

        //set eTag header
        header('ETag: ' . $result['person_id']);

        JsonResponse::send($result, 201);
        return;
    }

    public function updatePerson($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            JsonResponse::send(['error' => 'No data provided for update'], 400);
            return;
        }

        $result = $this->personLibrary->updatePerson($id, $data);
        JsonResponse::send($result);
        return;
    }

    public function deletePerson($id)
    {
        $this->personLibrary->deletePerson($id);
        JsonResponse::send(['message' => 'Person deleted successfully'], 204);
        return;
    }
}
