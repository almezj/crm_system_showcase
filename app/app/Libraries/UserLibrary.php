<?php

namespace App\Libraries;

use App\Models\UserModel;

class UserLibrary
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    public function getUser($id)
    {
        return $this->userModel->get($id);
    }

    public function getUsers()
    {
        return $this->userModel->getAll();
    }

    public function addUser($data)
    {
        return $this->userModel->create($data);
    }

    public function updateUser($id, $data)
    {
        return $this->userModel->update($id, $data);
    }

    public function deleteUser($id)
    {
        return $this->userModel->delete($id);
    }
}
