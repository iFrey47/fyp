import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useState(() => {
    setFadeIn(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("API Response:", data); // Debugging API response

      if (!res.ok || data.success === false) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role); //Fix: Storing correct role
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.user.username,
          role: data.user.role,
          email: data.user.email,
        })
      );
      console.log(JSON.parse(localStorage.getItem("user")));
      setLoading(false);
      setError(null);

      //Redirect based on role
      switch (data.user.role) {
        case "student":
          navigate("/student-dashboard");
          break;
        case "supervisor":
          navigate("/supervisor-dashboard");
          break;
        case "mentor":
          navigate("/mentor-dashboard");
          break;
        case "coordinator":
          navigate("/coordinator-dashboard");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/unauthorized");
      }
    } catch (error) {
      setLoading(false);
      setError("Network error, please try again.", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] px-4 sm:px-6 lg:px-8">
      <div
        className={`w-full max-w-xl transform transition-all duration-700 ${
          fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="px-6 sm:px-10 pt-10 pb-8 bg-[#22223a] rounded-xl shadow-2xl shadow-indigo-900/20 border border-[#2e2e4d]">
          {/* Logo Icon - Glowing Accent */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-3 shadow-lg shadow-indigo-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Headings */}
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Sign In
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Welcome back to the AI FYP navigation platform
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  onChange={handleChange}
                  placeholder="abc@iiui.edu"
                  className="w-full pl-10 pr-4 py-3 bg-[#1f1f3a] border border-[#2e2e4d] rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-white placeholder-gray-400 transition duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#1f1f3a] border border-[#2e2e4d] rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-white placeholder-gray-400 transition duration-200"
                />
              </div>
            </div>

            {/* Submit Button - Hover Glow */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-indigo-500/30 focus:ring-4 focus:ring-indigo-500/50 focus:outline-none transition-all duration-300 flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Error Message - Dark Red */}
          {error && (
            <div className="mt-6 bg-red-900/20 text-red-300 border border-red-800 p-4 rounded-lg flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* Sign Up Redirect - Subtle Link */}
          <div className="mt-6 flex items-center justify-center">
            <p className="text-gray-400">Don't have an account?</p>
            <button
              onClick={() => navigate("/sign-up")}
              className="ml-2 font-medium text-indigo-400 hover:text-indigo-300 transition duration-200 hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
