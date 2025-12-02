<?php

namespace App\Controllers;

use App\Libraries\LanguageLibrary;
use App\Utils\JsonResponse;

class LanguageController
{
    private $languageLibrary;

    public function __construct()
    {
        $this->languageLibrary = new LanguageLibrary();
    }

    public function getAllLanguages()
    {
        $languages = $this->languageLibrary->getLanguages();
        JsonResponse::send($languages);
    }

    public function getLanguage($id)
    {
        $language = $this->languageLibrary->getLanguage($id);
        
        if (empty($language)) {
            JsonResponse::send(['error' => 'Language not found'], 404);
            return;
        }

        JsonResponse::send($language);
    }
} 