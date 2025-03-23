import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token, redirect to Sign-in
  if (!token) {
    return <Navigate to="/sign-in" />;
  }

  // If role is not allowed, redirect to Unauthorized page
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
