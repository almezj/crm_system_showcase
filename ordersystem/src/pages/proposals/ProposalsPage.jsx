import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProposalsRequest } from "../../redux/proposals/actions";
import axios from "../../services/axiosInstance";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import { formatPrice } from "../../utils/currencyUtils";

const ProposalsPage = () => {
  const dispatch = useDispatch();
  const { proposals, pagination, loading, error } = useSelector((state) => state.proposals);
  const [statusOptions, setStatusOptions] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchProposalsRequest(currentPage, itemsPerPage));
    // Fetch status options from reference table
    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await axios.get("/references/proposal_status");
        const mapped = res.data.map((s) => ({
          id: s.proposal_status_id,
          name: s.status_name,
        }));
        setStatusOptions(mapped);
        setStatusError(null);
      } catch (err) {
        setStatusError("Failed to load statuses");
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, [dispatch, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Helper: get status name and badge class
  const getStatusInfo = (proposal) => {
    const status = statusOptions.find((s) => s.id === proposal.proposal_status_id);
    if (!status) return { name: "Unknown", badge: "bg-secondary" };
    let badge = "bg-secondary";
    switch (status.name) {
      case "Draft":
        badge = "bg-secondary text-dark";
        break;
      case "Pending Approval":
        badge = "bg-info text-dark";
        break;
      case "Under Negotiation":
        badge = "bg-primary text-white";
        break;
      case "Accepted":
        badge = "bg-success";
        break;
      case "Rejected":
        badge = "bg-danger";
        break;
      case "On Hold":
        badge = "bg-warning text-dark";
        break;
      case "Expired":
        badge = "bg-danger";
        break;
      case "Converted to Order":
        badge = "bg-success text-white";
        break;
      default:
        badge = "bg-secondary";
    }
    return { name: status.name, badge };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Proposals</h1>
        <Link to="/proposals/add" className="btn btn-primary">
          Add New Proposal
        </Link>
      </div>

      {/* Items per page selector */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <label htmlFor="itemsPerPage" className="form-label me-2 mb-0">
            Show:
          </label>
          <select
            id="itemsPerPage"
            className="form-select"
            style={{ width: 'auto' }}
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ms-2 text-muted">proposals per page</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Valid Until</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.proposal_id}>
                <td>{proposal.proposal_id}</td>
                <td>
                  <Link to={`/persons/${proposal.prospect_id}`}>
                    {proposal.customer_full_name}
                  </Link>
                </td>
                <td>
                  {statusLoading ? (
                    <span>Loading...</span>
                  ) : statusError ? (
                    <span className="text-danger">{statusError}</span>
                  ) : (
                    <StatusBadge status={getStatusInfo(proposal).name} />
                  )}
                </td>
                <td>{formatPrice(proposal.total_price, 'CZK')}</td>
                <td>{proposal.valid_until}</td>
                <td>
                  <Link
                    to={`/proposals/${proposal.proposal_id}`}
                    className="btn btn-sm btn-primary me-2"
                  >
                    View
                  </Link>
                  <Link
                    to={`/proposals/${proposal.proposal_id}/edit`}
                    className="btn btn-sm btn-secondary me-2"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
        itemsPerPage={pagination.per_page}
        showInfo={true}
      />
    </div>
  );
};

export default ProposalsPage;
