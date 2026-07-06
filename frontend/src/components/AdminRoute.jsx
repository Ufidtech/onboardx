import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

// Reads a comma-separated list of allowed admin emails from an env var,
// e.g. VITE_ADMIN_EMAILS=lead1@example.com,lead2@example.com
// This is a client-side gate -- good enough to hide the admin view from
// regular mentors/mentees for an MVP, but not a substitute for real
// Firestore security rules if this app ever handles sensitive data.
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-12 text-sm text-gray-500">Loading...</div>
    );
  }

  const isAdmin = user && ADMIN_EMAILS.includes(user.email.toLowerCase());

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
