import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchOrdersRequest,
  deleteOrderRequest,
} from "../../redux/orders/actions";
import Pagination from "../../components/Pagination";
import { formatPrice } from "../../utils/currencyUtils";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders = [] } = useSelector((state) => state.orders || {});
  const { loading, error } = useSelector((state) => state.orders);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchOrdersRequest());
  }, [dispatch]);

  // Ensure orders is always an array - hotfix
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // DEBUG
  console.log('Orders state:', orders);
  console.log('Safe orders:', safeOrders);

  const filteredOrders =
    filter === "All" ? safeOrders : safeOrders.filter((o) => o.status === filter);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Orders</h1>

      {/* Filter Dropdown */}
      <div className="mb-3">
        <label>Filter by Status:</label>
        <select
          className="form-select w-auto d-inline-block ms-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Processing">Processing</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th
                    style={{
                      width: "150px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedOrders) && paginatedOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>
                      <span
                        className={`badge ${
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
                    </td>
                    <td>{formatPrice(order.total_price, 'CZK')}</td>
                    <td>{order.date}</td>
                    <td>
                      <Link
                        to={`/orders/${order.order_id}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        View
                      </Link>
                      <Link
                        to={`/orders/${order.order_id}/edit`}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPageInfo={true}
            maxVisiblePages={7}
          />
        </>
      )}
    </div>
  );
};

export default OrdersPage;
