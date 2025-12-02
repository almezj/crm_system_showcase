<?php

interface ProposalPdfGeneratorInterface {
    /**
     * Generate the proposal PDF content (HTML or PDF path)
     * @param array $proposalData
     * @param array $options Optional options array containing imageSize, selectedImages, selectedProductSummaryImages, etc.
     * @return string HTML string or PDF file path
     */
    public function generate(array $proposalData, array $options = []): string;
} 