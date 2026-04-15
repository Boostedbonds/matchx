import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Cover from "./pages/Cover";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { user } = useAuth();

  return (
    <Layout>
      {user ? <Dashboard /> : <Cover />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;