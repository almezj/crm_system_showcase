<?php

namespace App\Controllers;

use App\Libraries\ReferenceLibrary;
use App\Utils\JsonResponse;

class ReferenceController
{
    private $referenceLibrary;

    public function __construct()
    {
        $this->referenceLibrary = new ReferenceLibrary();
    }

    public function getAll($table)
    {
        error_log("getting all from table: $table");
        $result = $this->referenceLibrary->getAllFromTable($table);
        JsonResponse::send($result);
    }
}
