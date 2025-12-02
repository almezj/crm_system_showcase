import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissionsRequest } from "../../redux/permissions/actions";

const RoleForm = ({ role = {}, onSubmit, loading }) => {
  const dispatch = useDispatch();
  const { permissions, loading: permissionsLoading } = useSelector(
    (state) => state.permissions
  );

  const [formData, setFormData] = useState({
    role_name: role?.role_name || "",
    description: role?.description || "",
    rights: [],
  });

  // Fetch permissions on component mount
  useEffect(() => {
    dispatch(fetchPermissionsRequest());
  }, [dispatch]);

  // Map permissions and role rights to state
  useEffect(() => {
    if (permissions && permissions.length > 0) {
      const mappedRights = permissions.map((perm) => {
        const roleRight = (role?.rights || []).find(
          (right) => right.area_name === perm.area_name
        );
        return {
          right_id: perm.right_id,
          area_name: perm.area_name,
          permission_type: roleRight ? roleRight.permission_type : "none",
        };
      });
      setFormData((prev) => ({ ...prev, rights: mappedRights }));
    }
  }, [permissions, role?.rights]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRightChange = (rightId, permission) => {
    setFormData((prev) => {
      const updatedRights = prev.rights.map((right) =>
        right.right_id === rightId
          ? { ...right, permission_type: permission }
          : right
      );
      return { ...prev, rights: updatedRights };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="role_name" className="form-label">Role Name</label>
        <input
          type="text"
          id="role_name"
          name="role_name"
          className="form-control"
          value={formData.role_name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
        />
      </div>

      <div className="mb-4">
        <h5>Permissions</h5>
        <table className="table">
          <thead>
            <tr>
              <th>Area Name</th>
              <th>Description</th>
              <th>Permission</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((right) => (
              <tr key={right.right_id}>
                <td>{right.area_name}</td>
                <td>{right.description}</td>
                <td>
                  <select
                    className="form-select"
                    value={
                      formData.rights.find((r) => r.right_id === right.right_id)
                        ?.permission_type || "none"
                    }
                    onChange={(e) =>
                      handleRightChange(right.right_id, e.target.value)
                    }
                  >
                    <option value="none">No Access</option>
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                    <option value="full control">Full Control</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Save Role"}
      </button>
    </form>
  );
};

export default RoleForm;
