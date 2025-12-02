<?php

namespace App\Controllers;

use App\Models\OrderModel;
use App\Models\ProposalModel;
use App\Models\DeliveryModel;
use App\Models\FinancialDocumentModel;
use App\Utils\JsonResponse;

class DashboardController
{
    private $orderModel;
    private $proposalModel;
    private $deliveryModel;
    private $financialDocumentModel;

    public function __construct()
    {
        $this->orderModel = new OrderModel();
        $this->proposalModel = new ProposalModel();
        $this->deliveryModel = new DeliveryModel();
        $this->financialDocumentModel = new FinancialDocumentModel();
    }

    public function getStatistics()
    {
        try {
            // Debug: Check all proposal statuses
            $this->debugProposalStatuses();
            
            $stats = [
                'active_orders' => $this->getActiveOrdersCount(),
                'pending_proposals' => $this->getPendingProposalsCount(),
                'deliveries_in_progress' => $this->getDeliveriesInProgressCount(),
                'unpaid_invoices' => $this->getUnpaidInvoicesCount(),
                'order_trends' => $this->getOrderTrends(),
                'recent_activity' => $this->getRecentActivity()
            ];

            JsonResponse::send($stats);
        } catch (\Exception $e) {
            JsonResponse::send(['error' => $e->getMessage()], 500);
        }
    }

    private function debugProposalStatuses()
    {
        $db = $this->proposalModel->getDb();
        
        // Get all proposals with their statuses
        $stmt = $db->prepare("
            SELECT p.proposal_id, p.proposal_status_id, ps.status_name, p.deleted_at
            FROM proposals p
            LEFT JOIN proposal_status ps ON p.proposal_status_id = ps.proposal_status_id
            WHERE p.deleted_at IS NULL
            ORDER BY p.proposal_id DESC
        ");
        $stmt->execute();
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        error_log("[Dashboard Debug] All proposals with statuses: " . json_encode($results));
        
        // Count by status
        $statusCounts = [];
        foreach ($results as $row) {
            $statusName = $row['status_name'] ?? 'Unknown';
            $statusCounts[$statusName] = ($statusCounts[$statusName] ?? 0) + 1;
        }
        error_log("[Dashboard Debug] Status counts: " . json_encode($statusCounts));
    }

    private function getActiveOrdersCount()
    {
        $db = $this->orderModel->getDb();
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM orders 
            WHERE deleted_at IS NULL 
            AND order_status_id IN (1, 2, 3) -- Assuming these are active statuses
        ");
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }

    private function getPendingProposalsCount()
    {
        $db = $this->proposalModel->getDb();
        
        // Debug: Let's also get all proposals to see what statuses exist
        $debugStmt = $db->prepare("
            SELECT proposal_id, proposal_status_id, deleted_at 
            FROM proposals 
            WHERE deleted_at IS NULL
            ORDER BY proposal_id DESC
            LIMIT 10
        ");
        $debugStmt->execute();
        $debugResults = $debugStmt->fetchAll(\PDO::FETCH_ASSOC);
        error_log("[Dashboard Debug] All proposals: " . json_encode($debugResults));
        
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM proposals 
            WHERE deleted_at IS NULL 
            AND proposal_status_id = 4 -- Under Negotiation
        ");
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        $count = (int)$result['count'];
        error_log("[Dashboard Debug] Under Negotiation count: " . $count);
        return $count;
    }

    private function getDeliveriesInProgressCount()
    {
        $db = $this->deliveryModel->getDb();
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM deliveries 
            WHERE delivery_status_id IN (1, 2, 3) -- In Progress statuses
        ");
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }

    private function getUnpaidInvoicesCount()
    {
        $db = $this->financialDocumentModel->getDb();
        $stmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM financial_documents 
            WHERE document_type_id = 1 -- Invoice type
            AND document_status_id = 1 -- Pending payment
        ");
        $stmt->execute();
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return (int)$result['count'];
    }

    private function getOrderTrends()
    {
        $db = $this->orderModel->getDb();
        $stmt = $db->prepare("
            SELECT 
                DATE_FORMAT(order_date, '%Y-%m') as month,
                COUNT(*) as count
            FROM orders 
            WHERE deleted_at IS NULL 
            AND order_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(order_date, '%Y-%m')
            ORDER BY month ASC
        ");
        $stmt->execute();
        $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Format for chart.js
        $trends = [];
        foreach ($results as $row) {
            $trends[] = [
                'month' => date('M Y', strtotime($row['month'] . '-01')),
                'count' => (int)$row['count']
            ];
        }

        return $trends;
    }

    private function getRecentActivity()
    {
        $db = $this->orderModel->getDb();
        
        // Get recent orders
        $stmt = $db->prepare("
            SELECT 
                'order' as type,
                o.order_id as id,
                CONCAT(p.first_name, ' ', p.last_name) as customer_name,
                o.order_date as date,
                o.total_price as amount
            FROM orders o
            LEFT JOIN persons p ON o.principal_customer_id = p.person_id
            WHERE o.deleted_at IS NULL
            ORDER BY o.created_at DESC
            LIMIT 5
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Get recent proposals
        $stmt = $db->prepare("
            SELECT 
                'proposal' as type,
                p.proposal_id as id,
                CONCAT(per.first_name, ' ', per.last_name) as customer_name,
            p.created_at as date,
                p.total_price as amount
            FROM proposals p
            LEFT JOIN persons per ON p.prospect_id = per.person_id
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC
            LIMIT 5
        ");
        $stmt->execute();
        $proposals = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Combine and sort by date
        $activities = array_merge($orders, $proposals);
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return array_slice($activities, 0, 10);
    }
} 