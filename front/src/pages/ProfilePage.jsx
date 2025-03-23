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
          navigate("/login");
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-8 max-w-md w-full bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl text-center font-bold mb-6 text-gray-700">
          Profile
        </h1>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <label className="font-medium text-gray-600">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="name"
            value={formData.name || ""}
            onChange={handleChange}
          />

          <label className="font-medium text-gray-600">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="password"
            value={formData.password || ""}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded-lg uppercase font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white p-3 rounded-lg uppercase font-semibold hover:bg-red-700 transition"
          >
            Delete Account
          </button>

          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white p-3 rounded-lg uppercase font-semibold hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-500 mt-5 text-center">{error}</p>}
        {success && (
          <p className="text-green-500 mt-5 text-center">{success}</p>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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
