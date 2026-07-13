import { useAuth } from "../lib/AuthContext";
import Spinner from "./Spinner";
import AppLayout from "./AppLayout";
import LandingPage from "../pages/LandingPage";
import Dashboard from "../pages/Dashboard";

// The root path ("/") serves two different things depending on auth state:
// a public landing page for logged-out visitors, or the real Dashboard
// for logged-in users. Previously "/" just redirected anyone logged-out
// straight to Signup with no explanation of what the product even is.
export default function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
