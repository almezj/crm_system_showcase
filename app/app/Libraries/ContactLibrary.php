<?php
namespace App\Libraries;

use App\Models\ContactModel;

class ContactLibrary {
    private $contactModel;

    public function __construct() {
        $this->contactModel = new ContactModel();
    }

    public function getContacts() {
        return $this->contactModel->getAll();
    }

    public function addContact($data) {
        return $this->contactModel->create($data);
    }

    public function updateContact($id, $data) {
        return $this->contactModel->update($id, $data);
    }

    public function deleteContact($id) {
        return $this->contactModel->delete($id);
    }
}
?>
