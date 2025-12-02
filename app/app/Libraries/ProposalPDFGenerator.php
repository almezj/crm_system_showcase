<?php

require_once __DIR__ . '/../PdfGenerators/ProposalPdfFactory.php';

class ProposalPDFGenerator {
    
    /**
     * Generate HTML preview for a proposal
     */
    public function generateHTMLPreview($proposal, $templateType = 'general', $options = []) {
        try {
            // Use the existing PDF factory to get the appropriate generator
            $factory = new \ProposalPdfFactory();
            $generator = $factory::create($templateType);
            
            // Generate HTML using the same logic as PDF generation
            $html = $generator->generate($proposal, $options);
            
            // Add A4 styling for preview
            $html = $this->addPreviewStyling($html);
            
            return $html;
            
        } catch (Exception $e) {
            error_log("HTML preview generation error: " . $e->getMessage());
            throw new Exception("HTML preview generation failed: " . $e->getMessage());
        }
    }
    
    /**
     * Add A4 preview styling to HTML content
     */
    private function addPreviewStyling($html) {
        // Add A4 preview styles
        $previewStyles = '<style>
        /* A4 Preview Styles */
        @page {
            margin: 0;
            padding: 0;
            size: A4;
        }
        
        body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
            font-family: "DejaVu Sans", Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
        }
        
        /* Ensure proper scaling for preview */
        .pdf-preview-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* Hide any print-specific elements that shouldn\'t show in preview */
        @media screen {
            .no-preview {
                display: none !important;
            }
        }
        </style>';
        
        // Insert styles into the head section
        if (strpos($html, '<head>') !== false) {
            $html = str_replace('<head>', '<head>' . $previewStyles, $html);
        } else {
            // If no head section, add one
            $html = '<head>' . $previewStyles . '</head>' . $html;
        }
        
        return $html;
    }
}
