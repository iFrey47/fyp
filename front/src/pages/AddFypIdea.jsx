import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader,
  Sparkles,
  Code,
  Smartphone,
  Brain,
  Server,
  Shield,
  Globe,
  Database,
  Gamepad2,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import projectData from "../../package-project-json";

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

  // New state for interest selection
  const [showInterestModal, setShowInterestModal] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [hasSelectedInterest, setHasSelectedInterest] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const checkForRAGDuplicates = (projectTitle) => {
    if (!projectTitle.trim()) return { isDuplicate: false, matches: [] };

    const searchTitle = projectTitle.toLowerCase().trim();
    const matches = projectData
      .filter(
        (project) =>
          project.title && project.title.toLowerCase().includes(searchTitle),
      )
      .slice(0, 3);

    return {
      isDuplicate: matches.length > 0,
      matches: matches.map((match) => ({
        title: match.title,
        name: match.name,
        reg_no: match.reg_no,
        supervisor: match.supervisor || "Not assigned",
      })),
    };
  };

  const checkForDuplicates = async () => {
    if (!title.trim()) return;

    setCheckingDuplicate(true);
    setIsDuplicate(false);
    setDuplicateMatches([]);

    // 1. First check JSON (RAG-style)
    const ragResult = checkForRAGDuplicates(title);
    if (ragResult.isDuplicate) {
      setIsDuplicate(true);
      setDuplicateMatches(ragResult.matches);
      setError("[FROM RAG] Similar project found in records:");
      setCheckingDuplicate(false);
      return;
    }

    // 2. Fallback to your original API check
    try {
      const res = await fetch("http://localhost:5000/api/auth/checkID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.isDuplicate) {
        setIsDuplicate(true);
        setDuplicateMatches(data.matches || []);
        setError("Duplicate detected in our database");
      }
    } catch (err) {
      console.error("API check error:", err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Interest categories with icons and descriptions
  const interests = [
    {
      id: "web-dev",
      name: "Web Development",
      icon: <Globe className="w-6 h-6" />,
      description: "Frontend, Backend, Full-stack applications",
      keywords:
        "web development, React, Node.js, HTML, CSS, JavaScript, full-stack, frontend, backend",
    },
    {
      id: "mobile-app",
      name: "Mobile App Development",
      icon: <Smartphone className="w-6 h-6" />,
      description: "iOS, Android, Cross-platform apps",
      keywords:
        "mobile app development, React Native, Flutter, iOS, Android, cross-platform",
    },
    {
      id: "ai-ml",
      name: "AI/Machine Learning",
      icon: <Brain className="w-6 h-6" />,
      description: "AI, ML, Deep Learning, Data Science",
      keywords:
        "artificial intelligence, machine learning, deep learning, neural networks, data science, NLP",
    },
    {
      id: "system-programming",
      name: "System Programming",
      icon: <Server className="w-6 h-6" />,
      description: "Operating Systems, Networks, Low-level",
      keywords:
        "system programming, operating systems, networks, distributed systems, low-level programming",
    },
    {
      id: "cybersecurity",
      name: "Cybersecurity",
      icon: <Shield className="w-6 h-6" />,
      description: "Security, Encryption, Penetration Testing",
      keywords:
        "cybersecurity, encryption, penetration testing, security analysis, blockchain security",
    },
    {
      id: "database",
      name: "Database Systems",
      icon: <Database className="w-6 h-6" />,
      description: "Database Design, Big Data, Analytics",
      keywords:
        "database systems, big data, data analytics, SQL, NoSQL, data warehousing",
    },
    {
      id: "software-engineering",
      name: "Software Engineering",
      icon: <Code className="w-6 h-6" />,
      description: "Software Architecture, DevOps, Testing",
      keywords:
        "software engineering, software architecture, DevOps, testing, agile development",
    },
    {
      id: "game-development",
      name: "Game Development",
      icon: <Gamepad2 className="w-6 h-6" />,
      description: "Game Design, Graphics, VR/AR",
      keywords:
        "game development, game design, graphics programming, virtual reality, augmented reality",
    },
  ];

  // Debug output
  useEffect(() => {
    console.log("Current userId:", userId);
    console.log("Existing Ideas:", existingIdeas);
    console.log("Recommendations:", recommendations);
    console.log("Last Queried:", lastQueried);
    console.log("Selected Interest:", selectedInterest);
  }, [userId, existingIdeas, recommendations, lastQueried, selectedInterest]);

  const genAI = new GoogleGenerativeAI(
    "AIzaSyDIesxDzQnSHh2psaJnLWQxxfQAHtnJ52o",
  );

  const handleInterestSelection = (interest) => {
    setSelectedInterest(interest);
    setHasSelectedInterest(true);
    setShowInterestModal(false);
  };

  const fetchAiRecommendations = async () => {
    if (!selectedInterest) {
      setError("Please select your interest first!");
      return;
    }

    setIsAiLoading(true);
    setAiRecommendations([]);
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        },
      });

      const prompt = `Generate 5 unique and innovative final-year project ideas specifically for ${
        selectedInterest.name
      } in Computer Science. Focus on projects related to: ${
        selectedInterest.keywords
      }.

Each suggestion should be practical for final-year students and include:
- A clear, descriptive title
- A brief 8-12 word description of the project

Format each idea on a new line starting with a dash (-). Make sure the ideas are current, feasible, and demonstrate technical skills relevant to ${
        selectedInterest.name
      }.

Timestamp: ${Date.now()}`;

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
        // Generate interest-specific fallback ideas
        const fallbackIdeas = getFallbackIdeas(selectedInterest.id);
        setAiRecommendations(shuffleArray([...fallbackIdeas]));
      }
    } catch (error) {
      console.error("Gemini error:", error);
      // Generate interest-specific fallback ideas if API call fails
      const fallbackIdeas = getFallbackIdeas(selectedInterest.id);
      setAiRecommendations(getRandomElements(fallbackIdeas, 5));
    } finally {
      setIsAiLoading(false);
    }
  };

  const getFallbackIdeas = (interestId) => {
    const fallbackIdeasByInterest = {
      "web-dev": [
        "E-commerce platform with real-time inventory - Full-stack online shopping solution",
        "Social media dashboard with analytics - Track multiple platforms performance",
        "Real-time collaboration workspace - Team productivity and communication tool",
        "Progressive web app for local businesses - Offline-first business management",
        "Interactive learning management system - Online education platform with gamification",
        "Restaurant management system with QR menus - Digital dining experience",
        "Personal finance tracker with AI insights - Smart budgeting and expense analysis",
        "Event management platform with ticketing - Complete event organization solution",
      ],
      "mobile-app": [
        "Health monitoring app with wearable integration - Track fitness and wellness metrics",
        "AR-based interior design mobile app - Visualize furniture in real spaces",
        "Location-based social networking app - Connect with nearby users and events",
        "Personal safety app with emergency features - Quick help and location sharing",
        "Language learning app with speech recognition - Interactive pronunciation practice",
        "Expense splitting app for groups - Smart bill management and payment tracking",
        "Plant care reminder app with AI diagnosis - Smart gardening assistant",
        "Public transport tracker with live updates - Real-time commuting assistance",
      ],
      "ai-ml": [
        "Emotion recognition system using facial analysis - Real-time mood detection technology",
        "Predictive maintenance system for equipment - IoT-based failure prediction using ML",
        "Automated essay grading system with feedback - NLP-powered academic assessment tool",
        "Stock price prediction using sentiment analysis - Financial forecasting with social media data",
        "Medical diagnosis assistant using image recognition - AI-powered healthcare support system",
        "Smart home automation with behavior learning - Adaptive IoT control system",
        "Recommendation engine for personalized learning - AI-driven educational content curation",
        "Voice-controlled virtual assistant for accessibility - Speech recognition for disabled users",
      ],
      "system-programming": [
        "Distributed file storage system - Fault-tolerant data replication across nodes",
        "Custom operating system kernel module - Low-level system functionality enhancement",
        "Network packet analyzer and security monitor - Real-time traffic inspection tool",
        "Memory management optimizer for applications - Dynamic allocation and garbage collection",
        "Peer-to-peer file sharing protocol - Decentralized data exchange system",
        "Multi-threaded task scheduler for clusters - Efficient resource allocation system",
        "Custom database engine with indexing - High-performance data storage solution",
        "System monitoring dashboard with performance metrics - Real-time resource tracking",
      ],
      cybersecurity: [
        "Network intrusion detection system with ML - Automated threat identification",
        "Password manager with biometric authentication - Secure credential storage solution",
        "Blockchain-based secure voting system - Tamper-proof election platform",
        "Vulnerability scanner for web applications - Automated security assessment tool",
        "Encrypted messaging app with perfect forward secrecy - Privacy-focused communication",
        "Digital forensics toolkit for incident response - Evidence collection and analysis",
        "Secure file sharing with access control - End-to-end encrypted document management",
        "Two-factor authentication system with mobile app - Enhanced login security solution",
      ],
      database: [
        "NoSQL database performance optimization tool - Query analysis and indexing suggestions",
        "Data warehouse for business intelligence - ETL pipeline with analytics dashboard",
        "Real-time data synchronization across databases - Multi-master replication system",
        "Graph database for social network analysis - Relationship mapping and community detection",
        "Time-series database for IoT sensor data - Efficient storage for temporal information",
        "Database migration toolkit with schema conversion - Automated platform switching tool",
        "Data quality monitoring and cleansing system - Automated error detection and correction",
        "Distributed database with automatic sharding - Scalable data partitioning solution",
      ],
      "software-engineering": [
        "Automated code review system with quality metrics - Static analysis and best practices",
        "CI/CD pipeline with automated testing framework - DevOps workflow optimization",
        "Microservices architecture monitoring dashboard - Service health and performance tracking",
        "Code documentation generator using AST analysis - Automated technical documentation",
        "Software project estimation tool with AI - Accurate timeline and resource prediction",
        "Automated bug triage system with ML classification - Intelligent issue prioritization",
        "Performance profiling tool for applications - Bottleneck identification and optimization",
        "Software dependency management and security scanner - Package vulnerability detection",
      ],
      "game-development": [
        "3D multiplayer racing game with physics engine - Real-time racing simulation",
        "VR educational game for historical exploration - Immersive learning experience",
        "AI-powered procedural world generation - Dynamic game environment creation",
        "Augmented reality treasure hunt mobile game - Location-based gaming experience",
        "Real-time strategy game with intelligent AI - Advanced computer opponents",
        "Interactive story game with branching narratives - Player choice-driven storytelling",
        "2D platformer with level editor and sharing - Community-created content platform",
        "Virtual reality fitness game with motion tracking - Exercise gamification system",
      ],
    };

    return (
      fallbackIdeasByInterest[interestId] || fallbackIdeasByInterest["web-dev"]
    );
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
  // const checkForDuplicates = async () => {
  //   if (!title.trim() || !description.trim()) return;

  //   setCheckingDuplicate(true);
  //   setIsDuplicate(false);
  //   setDuplicateMatches([]);

  //   try {
  //     console.log("Checking for duplicates...");
  //     const res = await fetch("http://localhost:5000/api/auth/checkID", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ title, description }),
  //     });

  //     const data = await res.json();
  //     console.log("Duplicate check response:", data);

  //     if (data.isDuplicate) {
  //       setIsDuplicate(true);
  //       setDuplicateMatches(data.matches || []);
  //       if (data.matches && data.matches.length > 0) {
  //         setError(
  //           `This idea is too similar to: ${data.matches[0].title} ` +
  //             `(${(data.matches[0].similarity * 100).toFixed(0)}% similar)`,
  //         );
  //       } else {
  //         setError(
  //           "This idea appears to be a duplicate of an existing proposal.",
  //         );
  //       }
  //     } else {
  //       setError("");
  //     }
  //   } catch (err) {
  //     console.error("Duplicate check error:", err);
  //   } finally {
  //     setCheckingDuplicate(false);
  //   }
  // };

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
        },
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
        },
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
        "This idea appears similar to an existing proposal. Do you still want to submit it?",
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
                0,
              )}% similar)`,
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
      {/* Interest Selection Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a3c] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">
              Choose Your Interest
            </h2>
            <p className="text-center text-gray-400 mb-8">
              Select the area you're most interested in to get personalized
              project suggestions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestSelection(interest)}
                  className="p-6 bg-[#22223a] hover:bg-[#2e2e4d] rounded-xl border border-[#2e2e4d] hover:border-indigo-500 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center mb-3">
                    <div className="text-indigo-400 group-hover:text-indigo-300 mr-3">
                      {interest.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {interest.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {interest.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-center text-white">
          Final Year Project Ideas
        </h2>
        <p className="text-center text-gray-400 mb-4">
          Submit and manage your project proposals
        </p>

        {/* Selected Interest Display */}
        {hasSelectedInterest && selectedInterest && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-[#22223a] px-4 py-2 rounded-full border border-indigo-500">
              <div className="text-indigo-400 mr-2">
                {selectedInterest.icon}
              </div>
              <span className="text-white font-medium">
                {selectedInterest.name}
              </span>
              <button
                onClick={() => setShowInterestModal(true)}
                className="ml-3 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Change
              </button>
            </div>
          </div>
        )}

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
                <div className="mb-4 p-3 bg-yellow-900/20 text-yellow-300 border border-yellow-600 rounded-lg">
                  <h4 className="font-semibold flex items-center">
                    <AlertCircle className="mr-2" size={16} />
                    {error || "Duplicate Detected"}
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {duplicateMatches.map((match, i) => (
                      <li key={i} className="text-sm">
                        • <span className="font-medium">"{match.title}"</span>
                        {match.name && (
                          <>
                            <br />
                            <span className="text-gray-400">
                              Submitted by: {match.name} (Reg: {match.reg_no})
                            </span>
                            <br />
                            <span className="text-gray-400">
                              Supervisor: {match.supervisor}
                            </span>
                          </>
                        )}
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
                disabled={isAiLoading || !hasSelectedInterest}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:brightness-125 text-white font-semibold transition-all flex justify-center items-center rounded-xl disabled:opacity-50"
              >
                {isAiLoading ? (
                  <Loader className="animate-spin mr-2" size={18} />
                ) : (
                  <Sparkles className="mr-2" size={18} />
                )}
                {hasSelectedInterest
                  ? `Generate AI Suggestions for ${selectedInterest?.name}`
                  : "Select Interest First"}
              </button>

              {aiRecommendations.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm text-indigo-400 font-medium flex items-center">
                    <Sparkles className="mr-1" size={14} />
                    AI Suggestions for {selectedInterest?.name}
                  </h4>
                  {aiRecommendations.map((idea, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#22223a] hover:bg-[#2e2e4d] cursor-pointer transition border border-[#2e2e4d] rounded-lg"
                      onClick={() => {
                        const parts = idea.split(":");
                        setTitle(parts[0].trim());
                        setDescription(parts[1]?.trim() || "");
                      }}
                    >
                      <span className="text-white text-sm">{idea}</span>
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
