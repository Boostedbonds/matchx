import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Rankings from "./pages/Rankings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import LiveMatch from "./pages/LiveMatch";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
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
      </Routes>
    </AuthProvider>
  );
}