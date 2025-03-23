import { Link, useLocation } from "react-router-dom";

export default function DashboardButton() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const location = useLocation();

  // Define valid dashboard routes
  const dashboardPages = [
    "/student-dashboard",
    "/supervisor-dashboard",
    "/mentor-dashboard",
    "/admin-dashboard",
  ];

  // If user is not authenticated OR not on a dashboard, don't show button
  if (!isAuthenticated || !dashboardPages.includes(location.pathname))
    return null;

  return (
    <div className="fixed top-4 right-24 z-50">
      <Link
        to={location.pathname} // Stays on the same dashboard
        className="bg-green-600 text-white px-4 py-2 rounded-lg uppercase font-semibold hover:bg-green-700 transition"
      >
        Dashboard
      </Link>
    </div>
  );
}
