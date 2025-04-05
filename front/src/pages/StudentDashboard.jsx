import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
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

      fetchMentors();
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
      } else {
        console.error("Error sending request");
      }
    } catch (err) {
      console.error("Request error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Available Mentors
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
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
            {mentor.isAvailable && (
              <button
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                onClick={() => sendRequest(mentor._id)}
                disabled={loading}
              >
                {loading ? "Sending Request..." : "Send Request"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
