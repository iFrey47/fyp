import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Added confirmation state variables
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [currentMentorId, setCurrentMentorId] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);

  useEffect(() => {
    if (role !== "student") {
      navigate("/unauthorized");
    } else {
      const fetchMentors = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/auth/mentors", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (data.success) {
            setMentors(data.mentors);
          } else {
            console.error("Error fetching mentors");
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };

      const fetchRequests = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/auth/requests", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (data.success) {
            setRequests(data.requests);
          } else {
            console.error("Error fetching requests");
          }
        } catch (err) {
          console.error("Request fetch error:", err);
        }
      };

      fetchMentors();
      fetchRequests();
    }
  }, [role, navigate, token]);

  // Show confirmation dialog
  const showConfirmation = (mentorId) => {
    const mentor = mentors.find((m) => m._id === mentorId);
    setCurrentMentor(mentor);
    setCurrentMentorId(mentorId);
    setConfirmationVisible(true);
  };

  // Close confirmation dialog
  const closeConfirmation = () => {
    setConfirmationVisible(false);
    setCurrentMentorId(null);
  };

  // Confirm action and send request
  const confirmAction = () => {
    sendRequest(currentMentorId);
    closeConfirmation();
  };

  const sendRequest = async (mentorId) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorId }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Request sent successfully!");
        setRequests((prev) => [...prev, data.request]); // Add new request to local state
      } else {
        console.error("Error sending request");
      }
    } catch (err) {
      console.error("Request error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to find request status by mentorId
  const getRequestStatus = (mentorId) => {
    // Check if requests are available and mentorId exists
    const req = requests.find((r) => {
      if (r.mentor && typeof r.mentor === "object") {
        return r.mentor._id === mentorId;
      }
      return false;
    });

    return req ? req.status : null; // Return request status or null if not found
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] p-10 text-white">
      <h2 className="text-5xl font-extrabold mb-12 text-center text-white tracking-tight">
        Find Your Mentor
      </h2>

      <div className="flex justify-center mb-10">
        <Link
          to="/add-fyp-idea"
          className="px-8 py-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
        >
          + Add Your FYP Idea
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {mentors.map((mentor) => {
          const status = getRequestStatus(mentor._id);
          const isAvailable = mentor.isAvailable;

          return (
            <div
              key={mentor._id}
              className="bg-[#22223a] shadow-xl rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-[#2e2e4d]"
            >
              <div className="flex items-center gap-5 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                  {mentor.username[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {mentor.username}
                  </h3>
                  <p className="text-sm text-gray-400">{mentor.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-block px-4 py-1 text-sm font-bold uppercase tracking-wide rounded-full ${
                    isAvailable
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }`}
                >
                  {isAvailable ? "Available" : "Not Available"}
                </span>
              </div>

              <div>
                {status === "pending" && (
                  <p className="text-yellow-400 font-medium animate-pulse">
                    Pending Request...
                  </p>
                )}

                {status === "accepted" && (
                  <button
                    className="w-full py-3 mt-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      console.log("Mentor username:", mentor.username);
                      navigate("/chat", {
                        state: { recipientUser: mentor.username },
                      });
                    }}
                  >
                    Chat
                  </button>
                )}

                {status === "rejected" && (
                  <p className="text-red-500 font-semibold">Request Rejected</p>
                )}

                {!status && isAvailable && (
                  <button
                    className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:scale-[1.03] transition-transform"
                    onClick={() => showConfirmation(mentor._id)}
                    disabled={loading}
                  >
                    Send Request
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-[#1f1f3a] rounded-xl shadow-xl max-w-lg mx-auto p-8 border border-[#2e2e4d] text-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 mb-6">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-medium text-white mb-4">
                Send Mentorship Request?
              </h3>

              <p className="text-base text-gray-400 mb-6">
                You are about to send a mentorship request to{" "}
                <span className="text-white font-semibold">
                  {currentMentor?.username}
                </span>
                . They will be notified and can accept or decline your request.
              </p>

              <div className="flex justify-center space-x-6">
                <button
                  onClick={closeConfirmation}
                  className="px-5 py-2 text-base font-semibold text-white bg-transparent border border-gray-500 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className="px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-600 rounded-lg hover:brightness-110"
                >
                  Yes, Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
