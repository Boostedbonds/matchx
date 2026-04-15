import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Cover from "./pages/Cover";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Rankings from "./pages/Rankings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import LiveMatch from "./pages/LiveMatch";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

// Inner component to access auth context
function AppRoutes() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <>
      {isAuthenticated ? (
        <Layout>
          <Routes>
            {/* Protected Routes with Sidebar */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:id"
              element={
                <ProtectedRoute>
                  <LiveMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <Players />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rankings"
              element={
                <ProtectedRoute>
                  <Rankings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            {/* Redirect to dashboard if authenticated and on root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          {/* Public Routes without Sidebar */}
          <Route path="/" element={<Cover />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Redirect authenticated users from public pages */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/players" element={<Navigate to="/" replace />} />
          <Route path="/rankings" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<Navigate to="/" replace />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}