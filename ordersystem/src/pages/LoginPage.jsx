import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "../redux/auth/actions";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [wasLoggedIn, setWasLoggedIn] = useState(isAuthenticated);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password }));
  };

  useEffect(() => {
    if (!wasLoggedIn && (token || isAuthenticated)) {
      setWasLoggedIn(true);
      setEmail("");
      setPassword("");
      navigate("/dashboard");
    }
  }, [token, isAuthenticated, navigate, wasLoggedIn]);

  return (
    <div className="login-page d-flex justify-content-center align-items-center vh-100">
      <form
        onSubmit={handleSubmit}
        className="w-50 p-4 border rounded bg-light"
      >
        <h2 className="mb-4">Login</h2>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            data-testid="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            data-testid="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="error text-danger mt-3">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
