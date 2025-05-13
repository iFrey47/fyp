import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] text-white p-6">
      <div className="bg-[#22223a] border border-[#2e2e4d] rounded-xl p-10 shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Unauthorized Access
        </h1>

        <p className="text-gray-400 mb-6">
          You do not have permission to view this page.
        </p>

        <Link
          to="/sign-in"
          className="inline-block py-3 px-8 bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold rounded-xl hover:brightness-125 transition-all duration-300"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
