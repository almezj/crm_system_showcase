<?php
namespace App\Libraries;

use App\Models\ReferenceModel;

class ReferenceLibrary {
    private $referenceModel;
    private $allowedTables = [
        'address_type',
        'person_type',
        'order_status',
        'proposal_status',
        'product_status',
        'delivery_status',
        'delivery_stage_status',
        'delivery_piece_status',
        'document_type',
        'document_status'
    ];

    public function __construct() {
        $this->referenceModel = new ReferenceModel();
    }

    public function getAllFromTable($table) {
        if (!in_array($table, $this->allowedTables)) {
            throw new \Exception("Table not allowed");
        }
        return $this->referenceModel->getAll($table);
    }
}
?>
