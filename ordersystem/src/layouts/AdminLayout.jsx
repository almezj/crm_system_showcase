import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LogoutButton from "../components/LogoutButton";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { path: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { path: "/orders", icon: "bi-basket2", label: "Orders" },
    { path: "/proposals", icon: "bi-file-earmark-text", label: "Proposals" },
    { path: "/persons", icon: "bi-person", label: "Persons" },
    { section: "Business" },
    { path: "/manufacturers", icon: "bi-building", label: "Manufacturers" },
    { path: "/products", icon: "bi-box-seam", label: "Products" },
    { path: "/materials", icon: "bi-palette", label: "Materials" },
    { path: "/routes", icon: "bi-geo-alt", label: "Routes" },
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Keyboard shortcut to toggle sidebar (Ctrl/Cmd + B)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  // Scroll to top functionality
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="admin-layout-container">
      {/* Sidebar */}
      <aside
        className={`bg-dark text-white p-3 transition-all sidebar-sticky ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          {!sidebarCollapsed && <h5 className="text-center mb-0">Menu</h5>}
          <button
            className="btn btn-sm btn-outline-light sidebar-toggle"
            onClick={toggleSidebar}
            style={{ minWidth: "30px" }}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
        <ul className="nav flex-column">
          {menuItems.map((item, index) =>
            item.section ? (
              !sidebarCollapsed && (
                <h6
                  key={index}
                  className="text-uppercase text-secondary mt-3 px-2"
                >
                  {item.section}
                </h6>
              )
            ) : (
              <li key={index} className="nav-item">
                <Link
                  className={`nav-link ${isActive(item.path) ? "active" : ""} text-white d-flex align-items-center ${sidebarCollapsed ? 'collapsed' : ''}`}
                  to={item.path}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <i className={`bi ${item.icon} ${sidebarCollapsed ? '' : 'me-2'}`}></i>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          )}
        </ul>
      </aside>

      {/* Main Content */}
      <div className={`flex-grow-1 main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-3">Welcome, {user?.first_name}</h5>
            <small className="text-muted">(Ctrl+B to toggle sidebar)</small>
          </div>
          {/* User Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="userMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {user?.first_name}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="userMenu"
            >
              <li>
                <Link to="/settings" className="dropdown-item">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/admin" className="dropdown-item">
                  Administration
                </Link>
              </li>
              <li>
                <LogoutButton />
              </li>
            </ul>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">{children}</main>
        
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            className="btn btn-primary scroll-to-top"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <i className="bi bi-arrow-up"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
