import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Cover from "./pages/Cover";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { user } = useAuth();

  // Only show Layout (with sidebar) for authenticated users
  if (user) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  // Show Cover page without sidebar for unauthenticated users
  return <Cover />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;