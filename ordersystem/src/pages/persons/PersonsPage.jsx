import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchPersonsRequest } from "../../redux/persons/actions";

const PersonsPage = () => {
  const dispatch = useDispatch();
  const { persons, loading, error } = useSelector((state) => state.persons);

  useEffect(() => {
    // Dispatch the action to fetch persons on component mount
    dispatch(fetchPersonsRequest());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-4">Customers</h1>
      <Link className="btn btn-primary mb-3" to={`/persons/add`}>
        Add Customer
      </Link>
      {loading && <p>Loading customers...</p>}
      {error && <p className="text-danger">Error: {error}</p>}
      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th
                  style={{
                    width: "50px",
                  }}
                >
                  ID
                </th>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th
                  style={{
                    width: "120px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {persons.map((person) => (
                <tr key={person.person_id}>
                  <td>{person.person_id}</td>
                  <td>
                    {person.first_name} {person.last_name}
                  </td>
                  <td>{person.person_type}</td>
                  <td>{person.email}</td>
                  <td>{person.phone}</td>
                  <td>
                    <Link
                      to={`/persons/${person.person_id}`}
                      className="btn btn-sm btn-primary me-2"
                    >
                      View
                    </Link>
                    <Link
                      to={`/persons/edit/${person.person_id}`}
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
      )}
    </div>
  );
};

export default PersonsPage;
