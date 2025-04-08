import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationType, setConfirmationType] = useState("accept");
  const [currentRequestId, setCurrentRequestId] = useState(null);

  // Fetch availability status and requests
  useEffect(() => {
    if (role !== "mentor") {
      navigate("/unauthorized");
    } else {
      const fetchAvailability = async () => {
        try {
          const res = await fetch(
            "http://localhost:5000/api/auth/availability",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (data.success) {
            setIsAvailable(data.isAvailable);
          } else {
            console.error("Error fetching availability:", data.message);
          }
        } catch (err) {
          console.error("Error fetching availability:", err);
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
            console.error("Error fetching requests:", data.message);
          }
        } catch (err) {
          console.error("Error fetching requests:", err);
        }
      };

      fetchAvailability();
      fetchRequests();
    }
  }, [role, navigate, token]);

  // Toggle availability status
  const toggleAvailability = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/toggle-availability",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setIsAvailable(data.isAvailable);
      } else {
        console.error("Error toggling availability");
      }
    } catch (err) {
      console.error("Error toggling availability:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show confirmation dialog
  const showConfirmation = (requestId, type) => {
    setCurrentRequestId(requestId);
    setConfirmationType(type);
    setConfirmationVisible(true);
  };

  // Close confirmation dialog
  const closeConfirmation = () => {
    setConfirmationVisible(false);
  };

  // Confirm action after dialog
  const confirmAction = () => {
    handleRequestResponse(
      currentRequestId,
      confirmationType === "accept" ? "accepted" : "rejected"
    );
    closeConfirmation();
  };

  // Handle request responses (accept/reject)
  const handleRequestResponse = async (requestId, action) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/request/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: action }), // 'accepted' or 'rejected'
        }
      );

      const data = await res.json();
      if (data.success) {
        setRequests(requests.filter((req) => req._id !== requestId)); // Remove processed request
        alert(`Request ${action}`);
      } else {
        console.error("Error responding to request:", data.message);
      }
    } catch (err) {
      console.error("Error responding to request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-800">Mentor Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-7">
        {/* Status Card */}
        <div className="bg-white shadow-lg rounded-xl p-7 mb-7 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-5 lg:mb-0">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Status
              </h2>
              <div className="mt-3 flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-3 ${
                    isAvailable ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <p className="text-base text-gray-700">
                  {isAvailable
                    ? "You are currently available for chat sessions"
                    : "You are not available for chat sessions"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={loading}
              className={`px-5 py-2.5 rounded-lg font-medium text-base text-white shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-50 transform transition-all duration-300 hover:scale-105 ${
                isAvailable
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
            >
              {loading
                ? "Updating..."
                : isAvailable
                ? "Set as Unavailable"
                : "Set as Available"}
            </button>
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-white shadow-lg rounded-xl p-7">
          <div className="border-b border-gray-200 pb-4 mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Incoming Requests
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Review and respond to pending session requests
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="py-10 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-500">
                No pending requests
              </p>
              <p className="mt-2 text-base text-gray-400">
                All caught up! Check back later for new requests.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {requests.map((request) => (
                <li
                  key={request._id}
                  className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {request.student.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {request.student.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Requesting a mentoring session
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => showConfirmation(request._id, "reject")}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm transition-all duration-300"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => showConfirmation(request._id, "accept")}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-300"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmationVisible && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6">
            <div className="text-center">
              <div
                className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                  confirmationType === "accept" ? "bg-green-100" : "bg-red-100"
                } mb-4`}
              >
                {confirmationType === "accept" ? (
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {confirmationType === "accept"
                  ? "Accept this request?"
                  : "Decline this request?"}
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                {confirmationType === "accept"
                  ? "You are about to accept this mentoring session request. This will notify the student and start a chat session."
                  : "You are about to decline this mentoring session request. The student will be notified that you're unavailable."}
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
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    confirmationType === "accept"
                      ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  }`}
                >
                  {confirmationType === "accept"
                    ? "Yes, Accept"
                    : "Yes, Decline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
