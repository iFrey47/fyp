import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationType, setConfirmationType] = useState("accept");
  const [currentRequestId, setCurrentRequestId] = useState(null);

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
          if (data.success) setIsAvailable(data.isAvailable);
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
          if (data.success) setRequests(data.requests);
        } catch (err) {
          console.error("Error fetching requests:", err);
        }
      };

      const fetchAcceptedStudents = async () => {
        try {
          const res = await fetch(
            "http://localhost:5000/api/auth/accepted-students",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (data.success) {
            // Ensure each student has a username at the top level
            const students = data.students.map((student) => ({
              ...student,
              username: student.username || student.user?.username,
            }));
            setAcceptedStudents(students);
          }
        } catch (err) {
          console.error("Error fetching accepted students:", err);
        }
      };

      fetchAvailability();
      fetchRequests();
      fetchAcceptedStudents();
    }
  }, [role, navigate, token]);

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
      if (data.success) setIsAvailable(data.isAvailable);
    } catch (err) {
      console.error("Error toggling availability:", err);
    } finally {
      setLoading(false);
    }
  };

  const showConfirmation = (requestId, type) => {
    setCurrentRequestId(requestId);
    setConfirmationType(type);
    setConfirmationVisible(true);
  };

  const closeConfirmation = () => {
    setConfirmationVisible(false);
  };

  const confirmAction = () => {
    handleRequestResponse(
      currentRequestId,
      confirmationType === "accept" ? "accepted" : "rejected"
    );
    closeConfirmation();
  };

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
          body: JSON.stringify({ status: action }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setRequests(requests.filter((req) => req._id !== requestId));
        if (action === "accepted") {
          const accepted = requests.find((req) => req._id === requestId);
          if (accepted) {
            // Ensure the student object has username at top level
            const studentWithUsername = {
              ...accepted.student,
              username:
                accepted.student.username || accepted.student.user?.username,
            };
            setAcceptedStudents((prev) => [...prev, studentWithUsername]);
          }
        }
        alert(`Request ${action}`);
      }
    } catch (err) {
      console.error("Error handling request:", err);
    } finally {
      setLoading(false);
    }
  };

  // const startChat = (student) => {
  //   console.log("Student username:", student.username);
  //   navigate("/chat", {
  //     state: { recipientUser: student.username },
  //   });
  // };

  const startChat = (student) => {
    const username = student.username || student.user?.username;
    console.log("Starting chat with:", username);
    if (!username) {
      console.error("No username found for student:", student);
      return;
    }
    navigate("/chat", { state: { recipientUser: username } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-1">
              Mentor Dashboard
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span>Status:</span>
              <span
                className={`px-3 py-1 rounded-full font-semibold tracking-wide text-xs uppercase
              ${
                isAvailable
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
              >
                {isAvailable ? "Available" : "Not Available"}
              </span>
            </div>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={loading}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Set Your Status"}
          </button>
        </div>

        {/* Accepted Students Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Students You Can Chat With
          </h2>
          {acceptedStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {acceptedStudents.map((student) => (
                <div
                  key={student._id}
                  className="bg-white/10 border border-white/10 rounded-xl p-5 shadow hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center">
                      {student.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {student.username}
                      </h3>
                      <p className="text-sm text-gray-400">{student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => startChat(student)}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:brightness-110 text-white rounded-xl shadow transition"
                  >
                    Chat with {student.username}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              No accepted students yet. Accept mentorship requests to start
              chatting.
            </p>
          )}
        </div>

        {/* Pending Requests Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Pending Mentorship Requests
          </h2>
          {requests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white/10 border border-white/10 rounded-xl p-5 shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center">
                      {request.student?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {request.student?.username || "Student"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {request.student?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => showConfirmation(request._id, "accept")}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => showConfirmation(request._id, "reject")}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              No pending requests at this time.
            </p>
          )}
        </div>

        {/* Confirmation Dialog */}
        {confirmationVisible && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-6">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Are you sure you want to {confirmationType} this request?
              </h2>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={confirmAction}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={closeConfirmation}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
