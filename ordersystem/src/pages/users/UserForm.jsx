import React, { useState, useEffect } from "react";

const UserForm = ({ user = {}, roles = [], onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    password: "",
    roles: user?.roles || [],
    is_active: user?.is_active !== undefined ? user.is_active : true,
  });

  // Only update form data when user prop changes and has different values
  useEffect(() => {
    const newFormData = {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      password: "",
      roles: user?.roles || [],
      is_active: user?.is_active !== undefined ? user.is_active : true,
    };

    // Only update if values are different
    if (
      newFormData.first_name !== formData.first_name ||
      newFormData.last_name !== formData.last_name ||
      newFormData.email !== formData.email ||
      newFormData.phone_number !== formData.phone_number ||
      newFormData.is_active !== formData.is_active ||
      JSON.stringify(newFormData.roles) !== JSON.stringify(formData.roles)
    ) {
      setFormData(newFormData);
    }
  }, [user?.first_name, user?.last_name, user?.email, user?.phone_number, user?.is_active, user?.roles]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle role checkbox changes
  const handleRoleChange = (roleId) => {
    setFormData((prev) => {
      const updatedRoles = prev.roles.includes(roleId)
        ? prev.roles.filter((id) => id !== roleId) // Remove role
        : [...prev.roles, roleId]; // Add role
      return { ...prev, roles: updatedRoles };
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="first_name" className="form-label">
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          className="form-control"
          value={formData.first_name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="last_name" className="form-label">
          Last Name
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          className="form-control"
          value={formData.last_name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="phone_number" className="form-label">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          className="form-control"
          value={formData.phone_number}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={handleInputChange}
          placeholder={user?.user_id ? "Leave blank to keep current password" : ""}
        />
      </div>

      <div className="mb-4">
        <h5>Assign Roles</h5>
        {roles.map((role) => (
          <div className="form-check" key={role.role_id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`role-${role.role_id}`}
              checked={formData.roles.includes(role.role_id)}
              onChange={() => handleRoleChange(role.role_id)}
            />
            <label className="form-check-label" htmlFor={`role-${role.role_id}`}>
              {role.role_name}
            </label>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="is_active">
            Active
          </label>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : user?.user_id ? "Update User" : "Add User"}
      </button>
    </form>
  );
};

export default UserForm;
