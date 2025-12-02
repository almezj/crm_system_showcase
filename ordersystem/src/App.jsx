import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { renewSessionRequest } from "./redux/auth/actions";
import { loadDebugSettings } from "./redux/app/actions";
import PublicRoutes from "./routes/PublicRoutes";
import PrivateRoutes from "./routes/PrivateRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = !!authState.token;
  const user = authState.user;
  const location = useLocation();
  const navigate = useNavigate();

  // Check for existing token on app startup
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && (!authState.token || !user)) {
      // renew if we have a token but no authenticated state or user data
      dispatch(renewSessionRequest());
    }
  }, [dispatch, authState.token, user]);

  useEffect(() => {
    dispatch(loadDebugSettings());
  }, [dispatch]);

  useEffect(() => {
    const { pathname } = location;

    if (isAuthenticated) {
      if (pathname === "/login") navigate("/dashboard", { replace: true });
      return;
    }

    if (pathname !== "/login") navigate("/login", { replace: true });
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <>
      {isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
