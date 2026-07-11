import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/AppLayout";
import RootRoute from "./components/RootRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Intake from "./pages/Intake";
import PlanView from "./pages/PlanView";
import CheckIn from "./pages/CheckIn";
import PathComplete from "./pages/PathComplete";
import MentorDashboard from "./pages/MentorDashboard";
import AdminView from "./pages/AdminView";

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<RootRoute />} />
          <Route
            path="/intake"
            element={
              <Protected>
                <Intake />
              </Protected>
            }
          />
          <Route
            path="/plan"
            element={
              <Protected>
                <PlanView />
              </Protected>
            }
          />
          <Route
            path="/checkin"
            element={
              <Protected>
                <CheckIn />
              </Protected>
            }
          />
          <Route
            path="/path-complete"
            element={
              <Protected>
                <PathComplete />
              </Protected>
            }
          />
          <Route
            path="/mentor-dashboard"
            element={
              <Protected>
                <MentorDashboard />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AppLayout>
                    <AdminView />
                  </AppLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
