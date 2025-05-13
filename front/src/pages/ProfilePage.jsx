import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/sign-in");
          return;
        }

        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to fetch user data");
          return;
        }
        setFormData({ name: data.name || "", password: "" });
      } catch (error) {
        setError(`Network error, please try again. ${error.message}`);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }
      setSuccess("Profile updated successfully");
    } catch (error) {
      setLoading(false);
      setError(`Network error, please try again.${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/delete-profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to delete account");
        return;
      }
      localStorage.removeItem("token");
      navigate("/sign-in");
    } catch (error) {
      setError(`Network error, please try again. ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/sign-in");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] p-8 text-white">
      <div className="w-full max-w-lg p-8 space-y-8 bg-[#1f1f3a] border border-[#2e2e4d] rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Profile</h1>
          <p className="text-lg text-gray-400">Update your account details</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-5 py-4 bg-[#2a2a45] text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-700 border border-[#3a3a5c] shadow-inner transition"
              id="name"
              value={formData.name || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-5 py-4 bg-[#2a2a45] text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-700 border border-[#3a3a5c] shadow-inner transition"
              id="password"
              value={formData.password || ""}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-lg font-semibold hover:brightness-110 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
                Updating...
              </span>
            ) : (
              "Update Profile"
            )}
          </button>
        </form>

        <div className="space-y-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-4 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 active:scale-95 transition"
          >
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-[#3a3a5c] text-white rounded-lg font-semibold hover:bg-[#4a4a6d] active:scale-95 transition"
          >
            Logout
          </button>
        </div>

        {/* Messages */}
        {error && (
          <p className="mt-4 p-4 bg-red-900 text-red-300 text-center rounded-lg shadow-md">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 p-4 bg-green-900 text-green-300 text-center rounded-lg shadow-md">
            {success}
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-6 z-50">
          <div className="bg-[#1f1f3a] border border-[#3a3a5c] p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-400 mb-6">
              Are you sure? This will permanently delete your account.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
