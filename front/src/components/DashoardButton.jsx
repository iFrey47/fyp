import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function DashboardButton() {
  const location = useLocation(); // Get the current route
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Fetch user role only if authenticated and on the profile page
  useEffect(() => {
    if (!isAuthenticated || location.pathname !== "/profile") return;

    const fetchUserRole = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/auth/user-role", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to fetch role");
          return;
        }

        setRole(data.role);
      } catch (error) {
        setError("Error fetching role");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [isAuthenticated, location.pathname, token]); // Rerun when location changes

  // hide button if not on profile page
  if (location.pathname !== "/profile" || !isAuthenticated || !role)
    return null;

  //  dashboard routes
  const dashboardRoutes = {
    student: "/student-dashboard",
    supervisor: "/supervisor-dashboard",
    mentor: "/mentor-dashboard",
    admin: "/admin-dashboard",
  };

  const dashboardPath = dashboardRoutes[role] || "/unauthorized";

  return (
    <div className="fixed top-4 right-20 z-50">
      <Link
        to={dashboardPath}
        className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:bg-green-700 hover:shadow-lg transition"
      >
        {loading ? "Loading..." : "Dashboard"}
      </Link>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
