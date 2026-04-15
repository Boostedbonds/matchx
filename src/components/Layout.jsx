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
    const success = await logout();
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="layout-wrapper">
      {/* SIDEBAR */}
      <aside
        className={`sidebar ${sidebarOpen ? "open" : "closed"} ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-content">
          {/* BRANDING - PREMIUM LOGO */}
          <div className="sidebar-branding">
            <div className="logo">
              <svg
                viewBox="0 0 200 80"
                xmlns="http://www.w3.org/2000/svg"
                className="logo-svg"
              >
                {/* Glow filters */}
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient
                    id="gradientCyan"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#00ff88" />
                  </linearGradient>
                  <linearGradient
                    id="gradientGold"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#ffaa00" />
                  </linearGradient>
                </defs>

                {/* M */}
                <text
                  x="10"
                  y="55"
                  fontSize="48"
                  fontWeight="900"
                  fontFamily="'Courier Prime', monospace"
                  fill="url(#gradientCyan)"
                  filter="url(#glow)"
                >
                  M
                </text>

                {/* A */}
                <text
                  x="50"
                  y="55"
                  fontSize="48"
                  fontWeight="900"
                  fontFamily="'Courier Prime', monospace"
                  fill="url(#gradientCyan)"
                  filter="url(#glow)"
                >
                  A
                </text>

                {/* T */}
                <text
                  x="85"
                  y="55"
                  fontSize="48"
                  fontWeight="900"
                  fontFamily="'Courier Prime', monospace"
                  fill="url(#gradientCyan)"
                  filter="url(#glow)"
                >
                  T
                </text>

                {/* C */}
                <text
                  x="115"
                  y="55"
                  fontSize="48"
                  fontWeight="900"
                  fontFamily="'Courier Prime', monospace"
                  fill="url(#gradientCyan)"
                  filter="url(#glow)"
                >
                  C
                </text>

                {/* H */}
                <text
                  x="145"
                  y="55"
                  fontSize="48"
                  fontWeight="900"
                  fontFamily="'Courier Prime', monospace"
                  fill="url(#gradientCyan)"
                  filter="url(#glow)"
                >
                  H
                </text>

                {/* X - Premium X with glow and gold accent */}
                <g className="logo-x-wrapper">
                  <text
                    x="175"
                    y="55"
                    fontSize="48"
                    fontWeight="900"
                    fontFamily="'Courier Prime', monospace"
                    fill="url(#gradientGold)"
                    filter="url(#glow)"
                    className="logo-x"
                  >
                    X
                  </text>
                  {/* Animated glow circle around X */}
                  <circle
                    cx="190"
                    cy="30"
                    r="18"
                    fill="none"
                    stroke="url(#gradientGold)"
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="x-glow-ring"
                  />
                </g>
              </svg>
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
            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Logout"
            >
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
      <main
        className={`main-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;