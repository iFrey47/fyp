import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

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
    <div className="min-h-screen bg-white p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Available Mentors
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => {
          const status = getRequestStatus(mentor._id); // Get request status for each mentor

          return (
            <div
              key={mentor._id}
              className="border rounded-lg p-4 shadow-sm bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-gray-700">
                {mentor.username}
              </h3>
              <p className="text-sm text-gray-600">{mentor.email}</p>
              <p className="mt-2 text-sm font-medium">
                Status:{" "}
                <span
                  className={`${
                    mentor.isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {mentor.isAvailable ? "Available" : "Not Available"}
                </span>
              </p>

              {/* Show appropriate UI based on request status */}
              <div className="mt-4">
                {status === "pending" && (
                  <p className="text-yellow-600 font-semibold">Pending...</p>
                )}

                {status === "accepted" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Chat
                  </button>
                )}

                {status === "rejected" && (
                  <p className="text-red-600 font-semibold">Request Rejected</p>
                )}

                {!status && mentor.isAvailable && (
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    onClick={() => sendRequest(mentor._id)}
                    disabled={loading}
                  >
                    {loading ? "Sending Request..." : "Send Request"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
