import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { convertProposalToOrderRequest } from "../redux/proposals/actions";

const ProposalConversionButton = ({ proposal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.proposals.loading);
  const order = useSelector((state) => state.proposals.order);

  React.useEffect(() => {
    if (order) {
      // Navigate to the new order after successful conversion
      navigate(`/orders/${order.id}`);
    }
  }, [order, navigate]);

  const handleConversion = () => {
    if (
      window.confirm(
        "Are you sure you want to convert this proposal to an order?"
      )
    ) {
      console.log("Requesting conversion of proposal:", proposal.proposal_id);
      dispatch(convertProposalToOrderRequest(proposal.proposal_id));
    }
  };

  return (
    <button
      variant="contained"
      color="primary"
      onClick={handleConversion}
      disabled={loading}
      data-testid="proposal-conversion-button"
    >
      {loading ? "Converting..." : "Convert to Order"}
    </button>
  );
};

export default ProposalConversionButton;
