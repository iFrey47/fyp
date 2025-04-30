import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, AlertCircle, CheckCircle, Loader } from "lucide-react";

export default function AddFypIdea() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingIdeas, setExistingIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
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
  }, [token]);

  // Check role and fetch existing ideas
  useEffect(() => {
    if (role !== "student") {
      navigate("/unauthorized");
    } else {
      fetchExistingIdeas();
    }
  }, [role, navigate, fetchExistingIdeas]);

  const handleDelete = async (ideaId) => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;

    setDeleteLoading(ideaId);
    setError("");

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

      setSuccess("Idea deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchExistingIdeas(); // Refresh the list
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

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
        setIsLoading(false);
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
        if (submitData.error?.includes("already submitted")) {
          setError("You can only submit one project idea!");
          setTimeout(() => {
            navigate("/student-dashboard");
          }, 2000);
        } else {
          throw new Error(submitData.error || "Failed to submit idea");
        }
      } else {
        setSuccess("Idea submitted successfully!");
        fetchExistingIdeas(); // Refresh the list after submission
        setTitle("");
        setDescription("");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to submit idea. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Final Year Project Ideas
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Submit and manage your project proposals
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
            <AlertCircle className="mr-2 flex-shrink-0" size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center">
            <CheckCircle className="mr-2 flex-shrink-0" size={20} />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Idea Submission Form */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">
              Submit New Proposal
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter a descriptive title"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-40"
                  placeholder="Describe your project idea, goals, and expected outcomes"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Submitting...
                  </>
                ) : (
                  "Submit Proposal"
                )}
              </button>
            </form>
          </div>

          {/* Existing Ideas List */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">
              Existing Proposals
            </h3>

            {existingIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="text-center">No existing proposals found.</p>
                <p className="text-center text-sm mt-2">
                  Be the first to submit a project idea!
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {existingIdeas.map((idea) => (
                  <div
                    key={idea._id}
                    className="p-5 border border-gray-100 rounded-lg hover:shadow-md transition-all bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-lg text-gray-800">
                        {idea.title}
                      </h4>

                      {/* Delete button - only shows for the idea owner */}
                      {idea.submittedBy?._id === userId && (
                        <button
                          onClick={() => handleDelete(idea._id)}
                          disabled={deleteLoading === idea._id}
                          className="flex items-center justify-center bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete idea"
                        >
                          {deleteLoading === idea._id ? (
                            <Loader className="animate-spin" size={18} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-gray-600 mt-2">{idea.description}</p>

                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {idea.submittedBy?.username || "Unknown"}
                      </span>
                      <span className="ml-2">
                        {new Date(
                          idea.createdAt || Date.now()
                        ).toLocaleDateString()}
                      </span>
                    </div>
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
