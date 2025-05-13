import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader,
  Sparkles,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const genAI = new GoogleGenerativeAI(
    "AIzaSyDIesxDzQnSHh2psaJnLWQxxfQAHtnJ52o"
  );

  const fetchAiRecommendations = async () => {
    setIsAiLoading(true);
    setAiRecommendations([]);
    try {
      // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 1, // Higher temperature for more randomness
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
        },
      });

      const prompt = `Suggest 5 unique and innovative final-year project ideas for Computer Science students. Return each idea on a new line prefixed with a bullet point (-). Include both the project title and a brief 5-7 word description. Timestamp: ${Date.now()}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Format the response
      const ideas = text
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((idea) => idea.replace(/^-/, "").trim());

      if (ideas.length > 0) {
        setAiRecommendations(ideas);
      } else {
        // Generate random fallback ideas if API response format was unexpected
        const fallbackIdeas = [
          "AI-based course recommendation system - Personalized learning path using ML",
          "Blockchain student credential verifier - Secure verification of academic achievements",
          "AR campus navigation assistant - Virtual guide for university facilities",
          "IoT classroom environment monitor - Optimize learning conditions automatically",
          "Voice-controlled lecture transcription system - Accessible notes for all students",
        ];

        // Shuffle the fallback ideas to ensure randomness
        setAiRecommendations(shuffleArray([...fallbackIdeas]));
      }
    } catch (error) {
      console.error("Gemini error:", error);
      // Generate random fallback ideas if API call fails
      const fallbackIdeas = [
        "AI-based plagiarism detection tool - Find similarities between documents",
        "Smart attendance using facial recognition - Automate classroom attendance tracking",
        "E-commerce recommendation engine - Personalized shopping experience",
        "Mental health chatbot for students - Support system using NLP",
        "Automated exam scheduling system - Optimize timetables using algorithms",
        "Virtual reality laboratory simulator - Practice experiments safely",
        "Blockchain-based academic credential system - Tamper-proof certificates",
        "ML-powered career guidance platform - Data-driven career decisions",
        "Predictive analytics for student performance - Early intervention system",
        "Augmented reality campus tour - Interactive exploration experience",
      ];

      // Randomly select 5 unique ideas from the fallback list
      setAiRecommendations(getRandomElements(fallbackIdeas, 5));
    } finally {
      setIsAiLoading(false);
    }
  };

  const getRandomElements = (array, count) => {
    const shuffled = shuffleArray([...array]);
    return shuffled.slice(0, count);
  };

  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-center text-white">
          Final Year Project Ideas
        </h2>
        <p className="text-center text-gray-400 mb-10">
          Submit and manage your project proposals
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-800/20 border-l-4 border-red-500 text-red-400 flex items-center">
            <AlertCircle className="mr-2 flex-shrink-0" size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-800/20 border-l-4 border-green-500 text-green-300 flex items-center">
            <CheckCircle className="mr-2 flex-shrink-0" size={20} />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Submit Form */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-white border-b border-[#2e2e4d] pb-2">
              Submit New Proposal
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block mb-2 text-white font-medium">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#22223a] text-white border ${
                    isDuplicate ? "border-yellow-400" : "border-[#2e2e4d]"
                  } focus:ring-2 focus:ring-indigo-600 outline-none`}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-white font-medium">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-3 h-40 bg-[#22223a] text-white border ${
                    isDuplicate ? "border-yellow-400" : "border-[#2e2e4d]"
                  } focus:ring-2 focus:ring-indigo-600 outline-none`}
                  placeholder="Describe your project idea"
                  required
                />
              </div>

              {isDuplicate && duplicateMatches.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-900/20 text-yellow-300 border border-yellow-600">
                  <h4 className="font-semibold flex items-center">
                    <AlertCircle className="mr-2" size={16} />
                    Duplicate Detected
                  </h4>
                  <ul className="mt-2 ml-4 list-disc">
                    {duplicateMatches.slice(0, 2).map((match) => (
                      <li key={match._id}>
                        "{match.title}" ({(match.similarity * 100).toFixed(0)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {checkingDuplicate && (
                <div className="mb-4 flex items-center text-gray-300">
                  <Loader className="animate-spin mr-2" size={16} />
                  <span className="text-sm">
                    Checking for duplicate ideas...
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-600 hover:brightness-125 text-white font-semibold transition-all disabled:opacity-50 flex justify-center items-center rounded-xl"
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

            <div className="mt-8">
              <button
                onClick={fetchAiRecommendations}
                disabled={isAiLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:brightness-125 text-white font-semibold transition-all flex justify-center items-center rounded-xl"
              >
                {isAiLoading ? (
                  <Loader className="animate-spin mr-2" size={18} />
                ) : (
                  <Sparkles className="mr-2" size={18} />
                )}
                Generate AI Suggestions
              </button>

              {aiRecommendations.length > 0 && (
                <div className="mt-6 space-y-3">
                  {aiRecommendations.map((idea, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#22223a] hover:bg-[#2e2e4d] cursor-pointer transition border border-[#2e2e4d]"
                      onClick={() => {
                        const parts = idea.split(":");
                        setTitle(parts[0].trim());
                        setDescription(parts[1]?.trim() || "");
                      }}
                    >
                      <span className="text-white">{idea}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Existing Ideas */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-white border-b border-[#2e2e4d] pb-2">
              Existing Proposals
            </h3>

            {existingIdeas.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <p>No existing proposals found.</p>
                <p className="text-sm mt-1">Be the first to submit one!</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-700 scrollbar-track-transparent">
                {existingIdeas.map((idea) => (
                  <div
                    key={idea._id}
                    className="bg-[#22223a] p-4 transition hover:bg-[#2e2e4d] border border-[#2e2e4d] rounded-xl"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-medium text-white">
                        {idea.title}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchRecommendations(idea._id)}
                          disabled={recommendLoading === idea._id}
                          className="text-indigo-300 hover:text-indigo-400 transition"
                          title="Get similar ideas"
                        >
                          {recommendLoading === idea._id ? (
                            <Loader className="animate-spin" size={18} />
                          ) : (
                            <Sparkles size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(idea._id)}
                          disabled={deleteLoading === idea._id}
                          className="text-red-400 hover:text-red-500 transition"
                          title="Delete idea"
                        >
                          {deleteLoading === idea._id ? (
                            <Loader className="animate-spin" size={18} />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 mt-2">{idea.description}</p>
                    <div className="mt-3 text-xs text-gray-500">
                      <span className="mr-2">
                        {idea.submittedBy?.username || "Unknown"}
                      </span>
                      | {new Date(idea.createdAt).toLocaleDateString()}
                    </div>
                    {recommendations.length > 0 && lastQueried === idea._id && (
                      <div className="mt-4 border-t border-[#2e2e4d] pt-3">
                        <h5 className="text-sm text-indigo-400 mb-2 flex items-center">
                          <Sparkles className="mr-1" size={14} />
                          Similar Ideas
                        </h5>
                        <div className="space-y-2 text-gray-300">
                          {recommendations.slice(0, 3).map((rec) => (
                            <div
                              key={rec._id}
                              className="pl-2 border-l-2 border-indigo-600"
                            >
                              <p className="font-medium">{rec.title}</p>
                              <p className="text-xs text-gray-400">
                                {rec.description?.substring(0, 60)}...
                                <br />
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
