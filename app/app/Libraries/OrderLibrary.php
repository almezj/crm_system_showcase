<?php

namespace App\Libraries;

use App\Models\OrderModel;

class OrderLibrary
{
    private $orderModel;

    public function __construct()
    {
        $this->orderModel = new OrderModel();
    }

    public function createOrder($data)
    {
        $orderId = $this->orderModel->createOrder($data);

        foreach ($data['items'] as $item) {
            $orderItemId = $this->orderModel->addOrderItem($orderId, $item);

            if (isset($item['pieces'])) {
                foreach ($item['pieces'] as $piece) {
                    $this->orderModel->addOrderPiece($orderItemId, $piece);
                }
            }

            if (isset($item['images'])) {
                foreach ($item['images'] as $image) {
                    $this->orderModel->addOrderItemImage($orderItemId, $image);
                }
            }
        }

        if (isset($data['participants'])) {
            foreach ($data['participants'] as $participant) {
                $this->orderModel->addOrderParticipant($orderId, $participant);
            }
        }

        return ['order_id' => $orderId];
    }

    public function convertProposalToOrder($proposalId, $userId = null)
    {
        $proposalData = $this->orderModel->getProposalData($proposalId);
        
        if (!$proposalData) {
            throw new \Exception("Proposal not found or could not be retrieved");
        }
        
        if (empty($proposalData['items'])) {
            throw new \Exception("Proposal has no items to convert");
        }

        // Add user_id to proposal data if provided
        if ($userId) {
            $proposalData['user_id'] = $userId;
        }

        // Calculate total price from items if not set or is zero (gross prices including VAT)
        $total = 0;
        foreach ($proposalData['items'] as $item) {
            $total += ($item['quantity'] * $item['final_price']); // final_price is now gross (including VAT)
        }
        $proposalData['total_price'] = $total; // This is now the gross total including VAT

        $orderId = $this->orderModel->createOrderFromProposal($proposalData);

        foreach ($proposalData['items'] as $item) {
            // Insert items into the order
            $orderItemId = $this->orderModel->addOrderItemFromProposal($orderId, $item);

            // Carry over pieces for the item
            if (!empty($item['pieces'])) {
                foreach ($item['pieces'] as $piece) {
                    $this->orderModel->addOrderPiece($orderItemId, $piece);
                }
            }

            // Carry over images for the item
            if (!empty($item['images'])) {
                foreach ($item['images'] as $image) {
                    $this->orderModel->addOrderItemImage($orderItemId, $image);
                }
            }
        }

        return ['order_id' => $orderId];
    }


    public function getOrderById($id)
    {
        $order = $this->orderModel->getOrder($id);
        $items = $this->orderModel->getOrderItems($id);

        foreach ($items as &$item) {
            $item['pieces'] = $this->orderModel->getOrderPieces($item['order_item_id']);
            $item['images'] = $this->orderModel->getOrderItemImages($item['order_item_id']);
            // Map for frontend compatibility
            $item['name'] = $item['item_name'] ?? '';
            $item['price'] = $item['unit_price'] ?? 0.00;
            $item['total'] = $item['total_price'] ?? 0.00;
        }

        // Build customer object
        $customer = [
            'name' => trim(($order['first_name'] ?? '') . ' ' . ($order['last_name'] ?? '')),
            'email' => $order['email'] ?? '',
            'phone' => $order['phone'] ?? '',
        ];
        // Add delivery address if present
        if (!empty($order['delivery_address'])) {
            $delivery = $order['delivery_address'];
            $customer['delivery_address'] = [
                'street' => $delivery['street'] ?? '',
                'floor' => $delivery['floor'] ?? '',
                'city' => $delivery['city'] ?? '',
                'state_province' => $delivery['state_province'] ?? '',
                'postal_code' => $delivery['postal_code'] ?? '',
                'country' => $delivery['country'] ?? '',
            ];
        }

        $order['items'] = $items;
        $order['participants'] = $this->orderModel->getOrderParticipants($id);
        $order['customer'] = $customer;

        return $order;
    }

    public function getOrders()
    {
        $orders = $this->orderModel->getOrders();

        foreach ($orders as &$order) {
            $items = $this->orderModel->getOrderItems($order['order_id']);

            foreach ($items as &$item) {
                $item['pieces'] = $this->orderModel->getOrderPieces($item['order_item_id']);
                $item['images'] = $this->orderModel->getOrderItemImages($item['order_item_id']);
            }

            $order['items'] = $items;
            $order['participants'] = $this->orderModel->getOrderParticipants($order['order_id']);
        }

        return $orders;
    }

    public function updateOrder($id, $data)
    {
        return $this->orderModel->updateOrder($id, $data);
    }

    public function deleteOrder($id)
    {
        return $this->orderModel->deleteOrder($id);
    }
}
