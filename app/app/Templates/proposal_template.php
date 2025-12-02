<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; }
        .items { margin-top: 20px; }
        .item { border-bottom: 1px solid #ccc; padding: 10px 0; }
        .item img { max-width: 100px; height: auto; }
        .summary { margin-top: 30px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Proposal</h1>
        <p>Proposal ID: {{proposal_id}}</p>
        <p>Date: {{date}}</p>
    </div>

    <div class="customer">
        <h2>Customer Details</h2>
        <p>Name: {{customer_name}}</p>
        <p>Billing Address: {{billing_address}}</p>
        <p>Delivery Address: {{delivery_address}}</p>
    </div>

    <div class="items">
        <h2>Proposal Items</h2>
        {{items}}
    </div>

    <div class="summary">
        <p>Subtotal: {{subtotal}}</p>
        <p>Discount: {{discount}}</p>
        <p>Total: {{total}}</p>
    </div>

    <div class="footer">
        <p>Thank you for considering us!</p>
    </div>
</body>
</html>
F