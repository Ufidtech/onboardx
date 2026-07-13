import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  return children;
}
