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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-10">
      <h2 className="text-4xl font-extrabold mb-12 text-center text-gray-800">
        Find Your Mentor
      </h2>

      <div className="flex justify-center mb-8">
        <Link
          to="/add-fyp-idea"
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
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
              className="bg-white/60 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-inner">
                  {mentor.username[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {mentor.username}
                  </h3>
                  <p className="text-sm text-gray-500">{mentor.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${
                    isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isAvailable ? "Available" : "Not Available"}
                </span>
              </div>

              <div>
                {status === "pending" && (
                  <p className="text-yellow-600 font-medium animate-pulse">
                    Pending Request...
                  </p>
                )}

                {status === "accepted" && (
                  <button
                    className="w-full py-2 mt-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:brightness-110 transition"
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
                    className="w-full py-2 mt-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl hover:scale-[1.02] transition-transform"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <svg
                  className="h-6 w-6 text-purple-600"
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

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Send Mentorship Request?
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                You are about to send a mentorship request to{" "}
                {currentMentor?.username}. They will be notified and can accept
                or decline your request.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={closeConfirmation}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
