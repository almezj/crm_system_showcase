<?php
require_once __DIR__ . '/ProductSummaryProposalPdfGenerator.php';
require_once __DIR__ . '/PrettyProposalPdfGenerator.php';

class ProposalPdfFactory {
    public static function create(string $type): ProposalPdfGeneratorInterface {
        switch ($type) {
            case 'product_summary':
                return new ProductSummaryProposalPdfGenerator();
            case 'pretty_proposal':
                return new PrettyProposalPdfGenerator();
            default:
                throw new Exception('Unknown proposal type: ' . $type);
        }
    }
} 