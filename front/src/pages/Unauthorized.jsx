import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
      <p className="mt-4">You do not have permission to view this page.</p>
      <Link to="/sign-in" className="mt-4 text-blue-500">
        Go to Sign In
      </Link>
    </div>
  );
}
