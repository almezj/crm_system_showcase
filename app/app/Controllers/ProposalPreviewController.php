<?php

namespace App\Controllers;

use App\Libraries\ProposalPDFGenerator;
use App\Libraries\ProposalLibrary;
use App\Utils\JsonResponse;

class ProposalPreviewController {
    private $pdfGenerator;
    private $proposalLibrary;
    
    public function __construct() {
        $this->pdfGenerator = new ProposalPDFGenerator();
        $this->proposalLibrary = new ProposalLibrary();
    }
    
    /**
     * Generate HTML preview for a proposal
     */
    public function generatePreview($proposalId, $templateType = 'product_summary', $options = []) {
        try {
            error_log("ProposalPreviewController: generatePreview called with proposalId=$proposalId, templateType=$templateType");
            
            // Get proposal data using the existing library
            $proposal = $this->proposalLibrary->getProposalById($proposalId);
            if (!$proposal) {
                error_log("ProposalPreviewController: Proposal not found for ID=$proposalId");
                throw new \Exception("Proposal not found");
            }
            
            error_log("ProposalPreviewController: Proposal found, generating HTML preview");
            
            // Generate HTML content using the same logic as PDF generation
            $html = $this->pdfGenerator->generateHTMLPreview($proposal, $templateType, $options);
            
            error_log("ProposalPreviewController: HTML generated, length=" . strlen($html));
            
            // Return JSON response
            JsonResponse::send([
                'success' => true,
                'html' => $html,
                'proposal_id' => $proposalId,
                'template_type' => $templateType
            ]);
            
        } catch (\Exception $e) {
            error_log("ProposalPreviewController: Error - " . $e->getMessage());
            JsonResponse::send([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
