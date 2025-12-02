<?php

namespace App\Models;

use Config\Database;

class OrderModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getDb()
    {
        return $this->db;
    }

    public function createOrder($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO orders (
                principal_customer_id, 
                order_date, 
                total_price, 
                order_status_id,
                created_at,
                created_by
            )
            VALUES (
                :customer_id, 
                :order_date, 
                :total_price, 
                :order_status_id,
                NOW(),
                :created_by
            )
        ");
        $stmt->execute([
            ':customer_id' => $data['customer_id'],
            ':order_date' => $data['order_date'] ?? date('Y-m-d'),
            ':total_price' => $data['total_price'] ?? 0.00,
            ':order_status_id' => 1, // Assuming 1 is the initial status
            ':created_by' => $data['user_id'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function createOrderFromProposal($proposalData)
    {
        $stmt = $this->db->prepare("
            INSERT INTO orders (
                proposal_id, 
                principal_customer_id, 
                order_date, 
                total_price, 
                order_status_id,
                created_at,
                created_by
            )
            VALUES (
                :proposal_id, 
                :customer_id, 
                :order_date, 
                :total_price, 
                :order_status_id,
                NOW(),
                :created_by
            )
        ");
        $stmt->execute([
            ':proposal_id' => $proposalData['proposal_id'],
            ':customer_id' => $proposalData['customer_id'],
            ':order_date' => date('Y-m-d'),
            ':total_price' => $proposalData['total_price'],
            ':order_status_id' => 1, // Assuming 1 is the initial status
            ':created_by' => $proposalData['user_id'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function addOrderItem($orderId, $item)
    {
        $stmt = $this->db->prepare("
            INSERT INTO order_items (
                order_id, 
                product_id,
                quantity, 
                unit_price, 
                total_price, 
                metadata,
                description,
                product_status_id,
                created_at,
                created_by
            )
            VALUES (
                :order_id, 
                :product_id,
                :quantity, 
                :unit_price, 
                :total_price, 
                :metadata,
                :description,
                :product_status_id,
                NOW(),
                :created_by
            )
        ");
        $stmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $item['product_id'],
            ':quantity' => $item['quantity'],
            ':unit_price' => $item['unit_price'] ?? 0.00,
            ':total_price' => $item['total_price'] ?? 0.00,
            ':metadata' => json_encode($item['metadata'] ?? []),
            ':description' => $item['description'] ?? null,
            ':product_status_id' => $item['product_status_id'] ?? 1,
            ':created_by' => $item['user_id'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function addOrderPiece($orderItemId, $piece)
    {
        $stmt = $this->db->prepare("
            INSERT INTO order_pieces (
                order_item_id, 
                internal_manufacturer_code, 
                ean_code, 
                qr_code,
                delivery_status_id,
                created_at,
                created_by
            )
            VALUES (
                :order_item_id, 
                :internal_manufacturer_code, 
                :ean_code, 
                :qr_code,
                :delivery_status_id,
                NOW(),
                :created_by
            )
        ");
        $stmt->execute([
            ':order_item_id' => $orderItemId,
            ':internal_manufacturer_code' => $piece['internal_manufacturer_code'],
            ':ean_code' => $piece['ean_code'] ?? null,
            ':qr_code' => $piece['qr_code'] ?? null,
            ':delivery_status_id' => $piece['delivery_status_id'] ?? 1,
            ':created_by' => $piece['user_id'] ?? null
        ]);
    }

    public function addOrderItemImage($orderItemId, $image)
    {
        $stmt = $this->db->prepare("
            INSERT INTO order_item_images (order_item_id, image_url, is_primary, description, linked_from_proposal, uploaded_at)
            VALUES (:order_item_id, :image_url, :is_primary, :description, :linked_from_proposal, NOW())
        ");
        $stmt->execute([
            ':order_item_id' => $orderItemId,
            ':image_url' => $image['image_url'],
            ':is_primary' => $image['is_primary'] ?? false,
            ':description' => $image['description'] ?? '',
            ':linked_from_proposal' => !empty($image['linked_from_proposal']) ? 1 : 0
        ]);
    }

    public function addOrderParticipant($orderId, $participant)
    {
        $stmt = $this->db->prepare("
            INSERT INTO order_participants (order_id, person_id, role, created_at)
            VALUES (:order_id, :person_id, :role, NOW())
        ");
        $stmt->execute([
            ':order_id' => $orderId,
            ':person_id' => $participant['person_id'],
            ':role' => $participant['role']
        ]);
    }

    public function getProposalData($proposalId)
    {
        // Fetch the proposal details
        $stmt = $this->db->prepare("SELECT * FROM proposals WHERE proposal_id = :proposal_id AND deleted_at IS NULL");
        $stmt->execute([':proposal_id' => $proposalId]);
        $proposal = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Fetch items for the proposal
        $stmt = $this->db->prepare("SELECT * FROM proposal_items WHERE proposal_id = :proposal_id AND deleted_at IS NULL");
        $stmt->execute([':proposal_id' => $proposalId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            // Fetch pieces for the item - use is_active instead of deleted_at
            $stmt = $this->db->prepare("SELECT * FROM proposal_item_pieces WHERE proposal_item_id = :proposal_item_id AND is_active = 1");
            $stmt->execute([':proposal_item_id' => $item['proposal_item_id']]);
            $item['pieces'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Fetch images for the item
            $stmt = $this->db->prepare("SELECT * FROM proposal_item_images WHERE proposal_item_id = :proposal_item_id");
            $stmt->execute([':proposal_item_id' => $item['proposal_item_id']]);
            $item['images'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        $proposal['items'] = $items;
        $proposal['customer_id'] = $proposal['prospect_id'];
        return $proposal;
    }


    public function getOrder($id)
    {
        $stmt = $this->db->prepare("
            SELECT o.*, p.first_name, p.last_name, p.email, p.phone, os.status_name as order_status_name
            FROM orders o
            LEFT JOIN persons p ON o.principal_customer_id = p.person_id
            LEFT JOIN order_status os ON o.order_status_id = os.order_status_id
            WHERE o.order_id = :order_id AND o.deleted_at IS NULL
        ");
        $stmt->execute([':order_id' => $id]);
        $order = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Map order_date to date for frontend compatibility
        if ($order) {
            $order['date'] = $order['order_date'];
            $order['status'] = $order['order_status_name'] ?? 'Unknown';
        }

        // Fetch delivery address (address_type_id = 2)
        if ($order && isset($order['principal_customer_id'])) {
            $stmt2 = $this->db->prepare("SELECT * FROM addresses WHERE person_id = :person_id AND address_type_id = 2 AND is_active = 1 LIMIT 1");
            $stmt2->execute([':person_id' => $order['principal_customer_id']]);
            $deliveryAddress = $stmt2->fetch(\PDO::FETCH_ASSOC);
            if ($deliveryAddress) {
                $order['delivery_address'] = $deliveryAddress;
            }
        }
        return $order;
    }

    public function getOrderItems($orderId)
    {
        $stmt = $this->db->prepare("SELECT * FROM order_items WHERE order_id = :order_id AND deleted_at IS NULL");
        $stmt->execute([':order_id' => $orderId]);
        $items = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        // Ensure unit_price and total_price are numbers
        foreach ($items as &$item) {
            $item['unit_price'] = isset($item['unit_price']) ? (float)$item['unit_price'] : 0.00;
            $item['total_price'] = isset($item['total_price']) ? (float)$item['total_price'] : 0.00;
        }
        return $items;
    }

    public function getOrderPieces($orderItemId)
    {
        $stmt = $this->db->prepare("SELECT * FROM order_pieces WHERE order_item_id = :order_item_id AND deleted_at IS NULL");
        $stmt->execute([':order_item_id' => $orderItemId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getOrderItemImages($orderItemId)
    {
        $stmt = $this->db->prepare("SELECT * FROM order_item_images WHERE order_item_id = :order_item_id");
        $stmt->execute([':order_item_id' => $orderItemId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getOrderParticipants($orderId)
    {
        $stmt = $this->db->prepare("SELECT * FROM order_participants WHERE order_id = :order_id AND deleted_at IS NULL");
        $stmt->execute([':order_id' => $orderId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function addOrderItemFromProposal($orderId, $proposalItem)
    {
        // Calculate the correct total price for this item (gross prices including VAT)
        $quantity = (int)($proposalItem['quantity'] ?? 1);
        $finalPrice = (float)($proposalItem['final_price'] ?? 0.00); // Gross price (including VAT)
        $totalPrice = $quantity * $finalPrice; // Total gross price
        
        // Insert the proposal item into the order_items table
        $stmt = $this->db->prepare("
            INSERT INTO order_items (order_id, product_id, item_name, description, quantity, unit_price, total_price, metadata, product_status_id, created_at)
            VALUES (:order_id, :product_id, :item_name, :description, :quantity, :unit_price, :total_price, :metadata, :product_status_id, NOW())
        ");
        $stmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $proposalItem['product_id'],
            ':item_name' => $proposalItem['item_name'],
            ':description' => $proposalItem['description'],
            ':quantity' => $quantity,
            ':unit_price' => $finalPrice, // Use final_price as unit_price
            ':total_price' => $totalPrice, // Calculate total as quantity * final_price
            ':metadata' => json_encode($proposalItem['metadata'] ?? []),
            ':product_status_id' => 1 // Default status for new order items
        ]);

        // Return the generated order_item_id for further use
        return $this->db->lastInsertId();
    }


    public function updateOrder($id, $data)
    {
        $stmt = $this->db->prepare("
            UPDATE orders
            SET 
                total_price = :total_price,
                order_status_id = :order_status_id,
                updated_at = NOW(),
                modified_by = :modified_by
            WHERE order_id = :order_id
        ");
        $stmt->execute([
            ':order_id' => $id,
            ':total_price' => $data['total_price'] ?? 0.00,
            ':order_status_id' => $data['order_status_id'] ?? 1,
            ':modified_by' => $data['user_id'] ?? null
        ]);

        return ['message' => 'Order updated successfully'];
    }

    public function deleteOrder($id, $userId = null)
    {
        $stmt = $this->db->prepare("
            UPDATE orders 
            SET 
                is_active = 0,
                deleted_at = NOW(),
                deleted_by = :deleted_by 
            WHERE order_id = :order_id
        ");
        $stmt->execute([
            ':order_id' => $id,
            ':deleted_by' => $userId
        ]);
    }

    public function getOrders()
    {
        $stmt = $this->db->prepare("
            SELECT 
                ord.*,
                persons.first_name,
                persons.last_name,
                CONCAT(persons.first_name, ' ', persons.last_name) AS customer_name,
                os.status_name as order_status_name
            FROM orders ord
            LEFT JOIN persons ON ord.principal_customer_id = persons.person_id
            LEFT JOIN order_status os ON ord.order_status_id = os.order_status_id
            WHERE ord.deleted_at IS NULL
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($orders as &$order) {
            // Map order_date to date for frontend compatibility
            $order['date'] = $order['order_date'];
            $order['status'] = $order['order_status_name'] ?? 'Unknown';
            
            $items = $this->getOrderItems($order['order_id']);

            foreach ($items as &$item) {
                $item['pieces'] = $this->getOrderPieces($item['order_item_id']);
                $item['images'] = $this->getOrderItemImages($item['order_item_id']);
            }

            $order['items'] = $items;
            $order['participants'] = $this->getOrderParticipants($order['order_id']);
        }

        return $orders;
    }
}
