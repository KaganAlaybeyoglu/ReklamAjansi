import { useAuth } from "./contexts/AuthContext";
import { AuthForm } from "./components/Auth/AuthForm";
import { Dashboard } from "./components/Dashboard/Dashboard";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
}

export default App;
