import { Link, useLocation } from "react-router-dom";

export default function ProfileButton() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const location = useLocation();

  // Define pages where the button should be hidden
  const authPages = ["/sign-in", "/sign-up"];

  // If user is not authenticated OR on auth pages, don't show button
  if (!isAuthenticated || authPages.includes(location.pathname)) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link
        to="/profile"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg uppercase font-semibold hover:bg-blue-700 transition"
      >
        Profile
      </Link>
    </div>
  );
}
