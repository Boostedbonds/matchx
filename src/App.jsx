import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !ready) {
    return <div style={{ background: "#000", height: "100vh" }} />;
  }

  // ✅ Authenticated = Supabase session OR localStorage player
  if (isAuthenticated) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

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