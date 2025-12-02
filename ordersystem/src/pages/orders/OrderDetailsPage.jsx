import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderByIdRequest } from "../../redux/orders/actions";
import { formatPrice } from "../../utils/currencyUtils";
import AddressEditModal from "../../components/modals/AddressEditModal";
import { useState } from "react";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.orders);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderByIdRequest(id));
  }, [dispatch, id]);

  if (loading) {
    return <div className="alert alert-info">Loading order details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!order) {
    return <div className="alert alert-warning">Order not found</div>;
  }

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAddressUpdate = (updatedAddress) => {
    // Handle address update logic here
    console.log('Address updated:', updatedAddress);
    setShowModal(false);
  };

  return (
    <div>
      <h1 className="mb-4">Order Details</h1>

      {/* Order Metadata */}
      <div className="card mb-4">
        <div className="card-header">Order Information</div>
        <div className="card-body">
          <p>
            <strong>Order ID:</strong> {order.order_id}
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong>
            <span
              className={`badge ms-2 ${
                order.status === "Completed"
                  ? "bg-success"
                  : order.status === "Pending"
                    ? "bg-warning"
                    : order.status === "Cancelled"
                      ? "bg-danger"
                      : "bg-info"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <strong>Total:</strong> {formatPrice(order.total_price, 'CZK')}
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="card mb-4">
        <div className="card-header">Customer Information</div>
        <div className="card-body">
          <p>
            <strong>Name:</strong> {order.customer?.name}
          </p>
          <p>
            <strong>Email:</strong> {order.customer?.email}
          </p>
          <p>
            <strong>Phone:</strong> {order.customer?.phone}
          </p>
          <p>
            <strong>Address:</strong> {order.customer?.delivery_address ? (
              <span>
                {order.customer.delivery_address.street}
                {order.customer.delivery_address.floor !== null && order.customer.delivery_address.floor !== undefined && order.customer.delivery_address.floor !== "" && (
                  `, Floor ${order.customer.delivery_address.floor}`
                )}
                , {order.customer.delivery_address.city}, {order.customer.delivery_address.state_province}, {order.customer.delivery_address.postal_code}, {order.customer.delivery_address.country}
              </span>
            ) : (
              <span className="text-muted">No delivery address</span>
            )}
            <button
              className="btn btn-primary btn-sm ms-2"
              onClick={() => setShowModal(true)}
            >
              Edit Address
            </button>
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="card-header">Order Items</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={item.item_id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.price, 'CZK')}</td>
                    <td>{formatPrice(item.quantity * item.price, 'CZK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddressEditModal
        show={showModal}
        onClose={() => setShowModal(false)}
        initialAddress={order.customer?.delivery_address}
        onSave={handleAddressUpdate}
      />
    </div>
  );
};

export default OrderDetailsPage;
