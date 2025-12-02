import React from "react";
import { Link } from "react-router-dom";

const AdminCrossroadsPage = () => {
  return (
    <div>
      <h1 className="mb-4">Administration</h1>
      <div className="row">
        {/* Roles Card */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Roles Management</h5>
              <p className="card-text">
                Manage user roles and their associated permissions.
              </p>
              <Link to="/admin/roles" className="btn btn-primary">
                Manage Roles
              </Link>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Users Management</h5>
              <p className="card-text">Manage system users and assign roles.</p>
              <Link to="/admin/users" className="btn btn-primary">
                Manage Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCrossroadsPage;
