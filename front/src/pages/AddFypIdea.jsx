import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function AddFypIdea() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingIdeas, setExistingIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  // Wrap fetchExistingIdeas in useCallback to prevent unnecessary recreations
  const fetchExistingIdeas = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setExistingIdeas(data.projects);
      } else {
        console.error("Error fetching existing ideas");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [token]); // Add token as dependency

  // Check role and fetch existing ideas
  useEffect(() => {
    if (role !== "student") {
      navigate("/unauthorized");
    } else {
      fetchExistingIdeas();
    }
  }, [role, navigate, fetchExistingIdeas]); // Add fetchExistingIdeas to dependencies

  const handleDelete = async (ideaId) => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/projects/${ideaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Delete failed");

      alert("Idea deleted successfully!");
      fetchExistingIdeas(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First check for duplicates
      const checkRes = await fetch("http://localhost:5000/api/auth/checkID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const checkData = await checkRes.json();

      if (checkData.isDuplicate) {
        setError(
          "Similar project idea already exists! Please modify your idea."
        );
        return;
      }

      // If no duplicates, submit the idea
      const submitRes = await fetch("http://localhost:5000/api/auth/submitID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const submitData = await submitRes.json();

      if (!submitRes.ok) {
        if (submitData.error.includes("already submitted")) {
          alert("You can only submit one project idea!");
          navigate("/student-dashboard");
        }
        throw new Error(submitData.error);
      }

      alert("Idea submitted successfully!");
      fetchExistingIdeas(); // Refresh the list after submission
      setTitle("");
      setDescription("");
    } catch (err) {
      setError("Failed to submit idea. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Submit Your FYP Idea
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Idea Submission Form */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-32"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit Idea"}
              </button>
            </form>
          </div>

          {/* Existing Ideas List */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Existing FYP Ideas
            </h3>

            {existingIdeas.length === 0 ? (
              <p className="text-gray-500">No existing ideas found.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {existingIdeas.map((idea) => (
                  <div
                    key={idea._id}
                    className="p-4 border-b border-gray-100 last:border-0 relative"
                  >
                    <h4 className="font-medium text-lg text-gray-800">
                      {idea.title}
                    </h4>
                    <p className="text-gray-600 mt-1 text-sm">
                      {idea.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted by: {idea.submittedBy?.username || "Unknown"}
                    </p>

                    {/* Delete button - only shows for the idea owner */}
                    {idea.submittedBy?._id === userId && (
                      <button
                        onClick={() => handleDelete(idea._id)}
                        className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                      >
                        Delete Idea
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
