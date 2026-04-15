import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";

import Cover from "./pages/Cover";
import Dashboard from "./pages/Dashboard";

function App() {
  const { user } = useAuth();

  return (
    <Layout>
      {user ? <Dashboard /> : <Cover />}
    </Layout>
  );
}

export default App;