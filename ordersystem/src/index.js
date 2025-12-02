import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App.jsx";
import { ErrorProvider } from "./contexts/ErrorContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorNotification from "./components/ErrorNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import "leaflet/dist/leaflet.css";
import "./index.scss";

const root = createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <ErrorProvider>
        <BrowserRouter>
          <App />
          <ErrorNotification />
        </BrowserRouter>
      </ErrorProvider>
    </Provider>
  </ErrorBoundary>
);
