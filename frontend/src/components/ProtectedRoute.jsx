import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🚫 If no token or not the correct role → redirect to Sign In
  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace />;
  }

  // ✅ If authenticated and authorized → render the component
  return children;
}
