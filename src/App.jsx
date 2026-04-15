import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div style={{ background: "#000", height: "100vh" }} />;
  }

  // Show Dashboard with sidebar for authenticated users
  if (user) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  // Show Landing page (with new dual-mode login) for unauthenticated users
  return <Landing />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;