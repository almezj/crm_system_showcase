<?php

namespace App\Utils;

use Exception;

class CustomException extends Exception
{
    private $httpCode;

    public function __construct($message, $httpCode = 500)
    {
        $this->httpCode = $httpCode;

        header("Status: $httpCode");
        parent::__construct($message);
    }

    public function getHttpCode()
    {
        return $this->httpCode;
    }
}
