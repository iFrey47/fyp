import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader,
  Sparkles,
} from "lucide-react";

export default function AddFypIdea() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingIdeas, setExistingIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [lastQueried, setLastQueried] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  // Debug output
  useEffect(() => {
    console.log("Current userId:", userId);
    console.log("Existing Ideas:", existingIdeas);
    console.log("Recommendations:", recommendations);
    console.log("Last Queried:", lastQueried);
  }, [userId, existingIdeas, recommendations, lastQueried]);

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
        console.log("Fetched projects:", data.projects);
        setExistingIdeas(data.projects);
      } else {
        console.error("Error fetching existing ideas");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [token]);

  // Check for duplicate ideas
  const checkForDuplicates = async () => {
    if (!title.trim() || !description.trim()) return;

    setCheckingDuplicate(true);
    setIsDuplicate(false);
    setDuplicateMatches([]);

    try {
      console.log("Checking for duplicates...");
      const res = await fetch("http://localhost:5000/api/auth/checkID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      console.log("Duplicate check response:", data);

      if (data.isDuplicate) {
        setIsDuplicate(true);
        setDuplicateMatches(data.matches || []);
        if (data.matches && data.matches.length > 0) {
          setError(
            `This idea is too similar to: ${data.matches[0].title} ` +
              `(${(data.matches[0].similarity * 100).toFixed(0)}% similar)`
          );
        } else {
          setError(
            "This idea appears to be a duplicate of an existing proposal."
          );
        }
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Duplicate check error:", err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Debounce the duplicate check (only check after user stops typing for 1 second)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.trim() && description.trim()) {
        checkForDuplicates();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, description]);

  // Fetch recommendations
  const fetchRecommendations = async (ideaId) => {
    setRecommendLoading(ideaId);
    setRecommendations([]);
    setLastQueried(ideaId);
    try {
      console.log("Fetching recommendations for:", ideaId);
      const res = await fetch(
        `http://localhost:5000/api/auth/projects/recommend/${ideaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log("Recommendation response:", data);
      if (data.recommendations) {
        // Add the source idea ID to each recommendation
        const recsWithSource = data.recommendations.map((rec) => ({
          ...rec,
          sourceIdeaId: ideaId,
        }));
        setRecommendations(recsWithSource);
      }
    } catch (err) {
      console.error("Recommendation error:", err);
    } finally {
      setRecommendLoading(null);
    }
  };

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
        `http://localhost:5000/api/auth/delete-projects/${ideaId}`,
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

    // Basic client-side validation
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      setIsLoading(false);
      return;
    }

    // Check for duplicates one more time before submission
    await checkForDuplicates();

    // If duplicate was found, ask for confirmation
    if (isDuplicate) {
      const confirmSubmit = window.confirm(
        "This idea appears similar to an existing proposal. Do you still want to submit it?"
      );
      if (!confirmSubmit) {
        setIsLoading(false);
        return;
      }
    }

    try {
      // Submit the idea
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
        // Handle different error types
        if (submitData.error?.includes("similar to existing")) {
          setError(
            `This idea is too similar to: ${submitData.matches[0].title} ` +
              `(${(submitData.matches[0].similarity * 100).toFixed(
                0
              )}% similar)`
          );
        } else if (submitData.error?.includes("already submitted")) {
          setError("You can only submit one project idea!");
          setTimeout(() => navigate("/student-dashboard"), 2000);
        } else {
          throw new Error(submitData.error || "Failed to submit idea");
        }
      } else {
        // Success case
        setSuccess("Idea submitted successfully!");
        fetchExistingIdeas(); // Refresh the list
        setTitle("");
        setDescription("");
        setIsDuplicate(false);
        setDuplicateMatches([]);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to submit idea. Please try again.");
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

        {/* Debug info - remove in production */}
        <div className="mb-4 p-2 bg-gray-100 text-xs">
          <p>Current user ID: {userId || "Not logged in"}</p>
        </div>

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
                  className={`w-full px-4 py-3 border ${
                    isDuplicate
                      ? "border-amber-300 bg-amber-50"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
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
                  className={`w-full px-4 py-3 border ${
                    isDuplicate
                      ? "border-amber-300 bg-amber-50"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-40`}
                  placeholder="Describe your project idea, goals, and expected outcomes"
                  required
                />
              </div>

              {/* Duplicate warning */}
              {isDuplicate && duplicateMatches.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 flex items-center">
                    <AlertCircle className="mr-1" size={16} />
                    Duplicate Detection
                  </h4>
                  <p className="text-amber-700 text-sm mt-1">
                    Your idea is similar to existing proposals:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {duplicateMatches.slice(0, 2).map((match) => (
                      <li key={match._id} className="text-sm text-amber-800">
                        "{match.title}" ({(match.similarity * 100).toFixed(0)}%
                        similar)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {checkingDuplicate && (
                <div className="mb-4 flex items-center text-blue-600">
                  <Loader className="animate-spin mr-2" size={16} />
                  <span className="text-sm">
                    Checking for duplicate ideas...
                  </span>
                </div>
              )}

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

                      <div className="flex gap-2">
                        {/* Recommendation Button */}
                        <button
                          onClick={() => fetchRecommendations(idea._id)}
                          disabled={recommendLoading === idea._id}
                          className="flex items-center justify-center bg-purple-50 text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-colors"
                          title="Get similar ideas"
                        >
                          {recommendLoading === idea._id ? (
                            <Loader className="animate-spin" size={18} />
                          ) : (
                            <Sparkles size={18} />
                          )}
                        </button>

                        {/* Delete button - show for ALL ideas during development */}
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

                        {/* Delete button - only show for the owner's ideas */}
                        {/* {idea.submittedBy?._id === userId && (
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
                        )} */}
                      </div>
                    </div>

                    <p className="text-gray-600 mt-2">{idea.description}</p>

                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {idea.submittedBy?.username || "Unknown"}
                      </span>
                      <span className="ml-2">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Owner info for debugging */}
                    <div className="mt-1 text-xs text-gray-400">
                      Idea ID: {idea._id} | Owner ID:{" "}
                      {idea.submittedBy?._id || "none"}
                    </div>

                    {/* Recommendations Section - Show based on lastQueried */}
                    {recommendations.length > 0 && lastQueried === idea._id && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Sparkles className="mr-1" size={14} />
                          Similar Ideas
                        </h5>
                        <div className="space-y-2">
                          {recommendations.slice(0, 3).map((rec) => (
                            <div
                              key={rec._id}
                              className="pl-3 border-l-2 border-purple-200"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                {rec.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {rec.description && (
                                  <span className="block mb-1">
                                    {rec.description.substring(0, 60)}...
                                  </span>
                                )}
                                Similarity: {(rec.similarity * 100).toFixed(1)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
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
