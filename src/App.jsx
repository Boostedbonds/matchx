import { Routes, Route, Navigate } from "react-router-dom";
import Players from "./pages/Players";
import Dashboard from "./pages/Dashboard";
import Rankings from "./pages/Rankings";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Dashboard />} />

      {/* Other pages */}
      <Route path="/players" element={<Players />} />
      <Route path="/rankings" element={<Rankings />} />
      <Route path="/admin" element={<Admin />} />

      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}