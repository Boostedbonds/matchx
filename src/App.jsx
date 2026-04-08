import { Routes, Route } from "react-router-dom";
import Players from "./pages/Players";
import Dashboard from "./pages/Dashboard";
import Rankings from "./pages/Rankings";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div style={{ color: "white", padding: "20px" }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/players" element={<Players />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}