import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchManufacturerByIdRequest, fetchManufacturerMetadataRequest } from "../../redux/manufacturers/actions";

const ManufacturerDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { manufacturer, loading, error } = useSelector((state) => state.manufacturers);

  useEffect(() => {
    dispatch(fetchManufacturerByIdRequest(id));
    dispatch(fetchManufacturerMetadataRequest(id));
  }, [dispatch, id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!manufacturer) return <div>Manufacturer not found</div>;

  return (
    <div>
      <h1 className="mb-4">Manufacturer Details</h1>
      <div className="card mb-4">
        <div className="card-header">Manufacturer Information</div>
        <div className="card-body">
          <p>
            <strong>ID:</strong> {manufacturer.id}
          </p>
          <p>
            <strong>Name:</strong> {manufacturer.name}
          </p>
          <p>
            <strong>Contact Person:</strong> {manufacturer.contact}
          </p>
          <p>
            <strong>Email:</strong> {manufacturer.email}
          </p>
          <p>
            <strong>Phone:</strong> {manufacturer.phone}
          </p>
          <p>
            <strong>Address:</strong> {manufacturer.address}
          </p>
        </div>
      </div>
      <div className="card">
        <div className="card-header">Products</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {manufacturer.products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDetailsPage;
