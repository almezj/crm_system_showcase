<?php

namespace App\Libraries;

use App\Models\PersonModel;

class PersonLibrary
{
    private $personModel;

    public function __construct()
    {
        $this->personModel = new PersonModel();
    }

    public function getPersons()
    {
        return $this->personModel->getAll();
    }

    public function getPerson($id)
    {
        return $this->personModel->get($id);
    }

    public function addPerson($data)
    {
        return $this->personModel->create($data);
    }

    public function updatePerson($id, $data)
    {
        $addresses = $data['addresses'] ?? [];
        unset($data['addresses']);
        unset($data['address']); // Remove legacy field if present

        // Update person fields
        $result = $this->personModel->update($id, $data);

        // Update addresses
        if (!empty($addresses)) {
            $this->personModel->updateAddresses($id, $addresses);
        }

        return ['message' => 'Person updated successfully'];
    }

    public function deletePerson($id)
    {
        return $this->personModel->delete($id);
    }
}
