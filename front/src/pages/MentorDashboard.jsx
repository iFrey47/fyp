import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

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
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold mb-6">Mentor Dashboard</h1>
        <p className="text-lg mb-4">
          {isAvailable
            ? "You are available for chat"
            : "You are not available for chat"}
        </p>
        <button
          onClick={toggleAvailability}
          disabled={loading}
          className={`mt-4 px-6 py-2 rounded ${
            isAvailable ? "bg-red-600" : "bg-green-600"
          } text-white hover:bg-opacity-80`}
        >
          {loading
            ? "Updating..."
            : isAvailable
            ? "Set as Not Available"
            : "Set as Available"}
        </button>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Incoming Requests</h2>
        {requests.length === 0 ? (
          <p>No requests at the moment.</p>
        ) : (
          <div>
            {requests.map((request) => (
              <div key={request._id} className="mb-4">
                <p className="font-medium">
                  {request.student.username} is requesting a session
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleRequestResponse(request._id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="mt-2 ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleRequestResponse(request._id, "rejected")}
                >
                  Reject
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
