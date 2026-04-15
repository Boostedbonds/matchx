import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", label: "DASHBOARD", icon: "⚡" },
    { path: "/match/new", label: "NEW MATCH", icon: "🎾" },
    { path: "/rankings", label: "TOURNAMENT", icon: "🏆" },
    { path: "/rankings", label: "RANKINGS", icon: "📊" },
    { path: "/players", label: "PLAYERS", icon: "👥" },
    { path: "/profile", label: "PROFILE", icon: "👤" },
    { path: "/admin", label: "ADMIN", icon: "⚙️" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="layout-wrapper">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-content">
          {/* BRANDING */}
          <div className="sidebar-branding">
            <div className="logo">
              <span className="logo-text">MATCHX</span>
            </div>
            <p className="tagline">BADMINTON PLATFORM</p>
          </div>

          {/* DIVIDER */}
          <div className="sidebar-divider"></div>

          {/* NAVIGATION */}
          <nav className="sidebar-nav">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* DIVIDER */}
          <div className="sidebar-divider"></div>

          {/* USER SECTION */}
          <div className="sidebar-user">
            <div className="user-info">
              <div className="user-avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <p className="user-email-short">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <p className="user-status">Online</p>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE MENU TOGGLE */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        title="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {children}
      </main>
    </div>
  );
}

export default Layout;