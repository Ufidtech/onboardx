import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <div>
      <header className="max-w-2xl mx-auto px-4 pt-6 flex justify-between items-center">
        <Link to="/" className="text-sm font-medium text-gray-700">
          OnboardX
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-xs text-gray-500 underline">
            Admin
          </Link>
          <span className="text-xs text-gray-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-teal-700 underline"
          >
            Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
