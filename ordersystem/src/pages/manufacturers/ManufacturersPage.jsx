import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchManufacturersRequest,
  deleteManufacturerRequest,
} from "../../redux/manufacturers/actions";

const ManufacturersPage = () => {
  const dispatch = useDispatch();
  const { manufacturers, loading, error } = useSelector(
    (state) => state.manufacturers
  );

  useEffect(() => {
    dispatch(fetchManufacturersRequest());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="mb-4">Manufacturers</h1>
      <Link to="/manufacturers/add" className="btn btn-primary mb-3">
        Add Manufacturer
      </Link>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.map((manufacturer) => (
              <tr key={manufacturer.manufacturer_id}>
                <td>{manufacturer.manufacturer_id}</td>
                <td>{manufacturer.name}</td>
                <td>{manufacturer.contact_person}</td>
                <td>{manufacturer.contact_email}</td>
                <td>{manufacturer.contact_phone}</td>
                <td>
                  <Link
                    to={`/manufacturers/${manufacturer.manufacturer_id}`}
                    className="btn btn-sm btn-primary me-2"
                  >
                    View
                  </Link>
                  <Link
                    to={`/manufacturers/${manufacturer.manufacturer_id}/edit`}
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
    </div>
  );
};

export default ManufacturersPage;
