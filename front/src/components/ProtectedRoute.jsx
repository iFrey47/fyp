import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log("Token:", token); // Debugging
  console.log("Role:", role); // Debugging
  console.log("Allowed Roles:", allowedRoles); // Debugging

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
