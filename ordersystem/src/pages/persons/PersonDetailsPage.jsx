import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPersonByIdRequest, fetchAddressTypesRequest } from "../../redux/persons/actions";
import { formatPrice } from "../../utils/currencyUtils";

const PersonDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { person, addressTypes, loading, error } = useSelector((state) => state.persons);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchPersonByIdRequest(id));
      dispatch(fetchAddressTypesRequest());
    }
  }, [dispatch, id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-danger">Error: {error}</p>;
  }

  if (!person) {
    return <p>No person found</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Customer Details</h1>
        <Link to={`/persons/edit/${id}`} className="btn btn-primary">
          Edit Customer
        </Link>
      </div>
      <div className="card mb-4">
        <div className="card-header">Customer Information</div>
        <div className="card-body">
          <p>
            <strong>Name:</strong> {person.first_name} {person.last_name}
          </p>
          <p>
            <strong>Email:</strong> {person.email}
          </p>
          <p>
            <strong>Phone:</strong> {person.phone}
          </p>
        </div>
      </div>

      {/* Addresses List */}
      <div className="card mb-4">
        <div className="card-header">Addresses</div>
        <div className="card-body">
          {person.addresses && person.addresses.length > 0 ? (
            <div className="row w-100">
              {person.addresses.map((address, idx) => (
                <div key={address.address_id || idx} className="col-12 col-md-6 col-lg-4 mb-4">
                  <div className="p-3 border rounded h-100 bg-light">
                    <p className="mb-1"><strong>Type:</strong> {address.address_type_name || address.address_type || 'N/A'}</p>
                    <p className="mb-1"><strong>Street:</strong> {address.street}</p>
                                          {address.floor !== null && address.floor !== undefined && address.floor !== "" && (
                        <p className="mb-1"><strong>Floor:</strong> {address.floor}</p>
                      )}
                    <p className="mb-1"><strong>City:</strong> {address.city}</p>
                    <p className="mb-1"><strong>State/Province:</strong> {address.state_province || address.state}</p>
                    <p className="mb-1"><strong>Postal Code:</strong> {address.postal_code}</p>
                    <p className="mb-1"><strong>Country:</strong> {address.country}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No addresses available.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">Order History</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {person.orders?.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.date}</td>
                  <td>{formatPrice(order.total, 'CZK')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PersonDetailsPage;
