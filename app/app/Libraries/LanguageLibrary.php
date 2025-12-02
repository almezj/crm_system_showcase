<?php

namespace App\Libraries;

use App\Models\LanguageModel;

class LanguageLibrary
{
    private $languageModel;

    public function __construct()
    {
        $this->languageModel = new LanguageModel();
    }

    public function getLanguages()
    {
        return $this->languageModel->getAll();
    }

    public function getLanguage($id)
    {
        return $this->languageModel->get($id);
    }

    public function getLanguageByCode($code)
    {
        return $this->languageModel->getByCode($code);
    }
} 