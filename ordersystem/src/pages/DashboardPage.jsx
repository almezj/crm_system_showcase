import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStatisticsRequest } from "../redux/dashboard/actions";
import OrderTrendsChart from "../components/OrderTrendsChart.jsx";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { statistics, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStatisticsRequest());
  }, [dispatch]);

  if (loading) {
    return (
      <div>
        <h1 className="mb-4">Dashboard</h1>
        <div className="alert alert-info">Loading dashboard statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-4">Dashboard</h1>
        <div className="alert alert-danger">Error loading dashboard: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <div className="row h-100">
        {/* Active Orders */}
        <div className="col-md-3 d-flex">
          <div className="card text-white bg-primary mb-3 w-100 h-100 d-flex flex-column">
            <div className="card-header">Active Orders</div>
            <div className="card-body d-flex flex-column justify-content-center flex-grow-1">
              <h5 className="card-title text-center">{statistics?.active_orders || 0}</h5>
              <p className="card-text text-center">Orders currently being processed.</p>
            </div>
          </div>
        </div>

        {/* Proposals Under Negotiation */}
        <div className="col-md-3 d-flex">
          <div className="card text-white bg-warning mb-3 w-100 h-100 d-flex flex-column">
            <div className="card-header">Proposals Under Negotiation</div>
            <div className="card-body d-flex flex-column justify-content-center flex-grow-1">
              <h5 className="card-title text-center">{statistics?.pending_proposals || 0}</h5>
              <p className="card-text text-center">Proposals being discussed with customers.</p>
            </div>
          </div>
        </div>

        {/* Deliveries in Progress */}
        <div className="col-md-3 d-flex">
          <div className="card text-white bg-info mb-3 w-100 h-100 d-flex flex-column">
            <div className="card-header">Deliveries in Progress</div>
            <div className="card-body d-flex flex-column justify-content-center flex-grow-1">
              <h5 className="card-title text-center">{statistics?.deliveries_in_progress || 0}</h5>
              <p className="card-text text-center">Items currently being delivered.</p>
            </div>
          </div>
        </div>

        {/* Unpaid Invoices */}
        <div className="col-md-3 d-flex">
          <div className="card text-white bg-danger mb-3 w-100 h-100 d-flex flex-column">
            <div className="card-header">Unpaid Invoices</div>
            <div className="card-body d-flex flex-column justify-content-center flex-grow-1">
              <h5 className="card-title text-center">{statistics?.unpaid_invoices || 0}</h5>
              <p className="card-text text-center">Invoices awaiting payment.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mt-4">
        <div className="card-header">Order Trends</div>
        <div className="card-body" style={{ height: "300px" }}>
          <OrderTrendsChart orderTrends={statistics?.order_trends || []} />
        </div>
      </div>

      {/* Recent Activity */}
      {statistics?.recent_activity && statistics.recent_activity.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">Recent Activity</div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.recent_activity.map((activity, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`badge ${activity.type === 'order' ? 'bg-primary' : 'bg-warning'}`}>
                          {activity.type === 'order' ? 'Order' : 'Proposal'}
                        </span>
                      </td>
                      <td>{activity.id}</td>
                      <td>{activity.customer_name || 'N/A'}</td>
                      <td>{new Date(activity.date).toLocaleDateString()}</td>
                      <td>${parseFloat(activity.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
