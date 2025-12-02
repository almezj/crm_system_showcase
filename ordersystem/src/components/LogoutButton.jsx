import React from "react";
import { useDispatch } from "react-redux";
import { logoutRequest } from "../redux/auth/actions";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutRequest());
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className="dropdown-item">
      Logout
    </button>
  );
};

export default LogoutButton;
