import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, UploadCloud, Download } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [currentMentorId, setCurrentMentorId] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (role !== "student") {
      navigate("/unauthorized");
    } else {
      fetchMentors();
      fetchRequests();
      fetchDocuments();
    }
  }, [role, navigate, token]);

  const fetchMentors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/mentors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMentors(data.mentors);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) {
      console.error("Request fetch error:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/documents/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
    } catch (err) {
      console.error("Document fetch error:", err);
    }
  };

  const showConfirmation = (mentorId) => {
    const mentor = mentors.find((m) => m._id === mentorId);
    setCurrentMentor(mentor);
    setCurrentMentorId(mentorId);
    setConfirmationVisible(true);
  };

  const closeConfirmation = () => {
    setConfirmationVisible(false);
    setCurrentMentorId(null);
  };

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
        setRequests((prev) => [...prev, data.request]);
      }
    } catch (err) {
      console.error("Request error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRequestStatus = (mentorId) => {
    const req = requests.find((r) => r.mentor && r.mentor._id === mentorId);
    return req ? req.status : null;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch("http://localhost:5000/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        fetchDocuments();
        setFile(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (docId) => {
    window.open(`http://localhost:5000/api/documents/${docId}/file`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] p-10 text-white">
      <h2 className="text-5xl font-extrabold mb-12 text-center tracking-tight">
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
              className="bg-[#22223a] shadow-xl rounded-xl p-6 hover:scale-105 transition-all duration-300 border border-[#2e2e4d]"
            >
              <div className="flex items-center gap-5 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                  {mentor.username[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">{mentor.username}</h3>
                  <p className="text-sm text-gray-400">{mentor.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-block px-4 py-1 text-sm font-bold rounded-full ${
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
                    className="w-full py-3 mt-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl hover:shadow-lg"
                    onClick={() =>
                      navigate("/chat", {
                        state: { recipientUser: mentor.username },
                      })
                    }
                  >
                    Chat
                  </button>
                )}

                {status === "rejected" && (
                  <p className="text-red-500 font-semibold">Request Rejected</p>
                )}

                {!status && isAvailable && (
                  <button
                    className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:scale-[1.03]"
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

      {/* Document Upload Section */}
      <div className="mt-12 bg-[#22223a] p-6 rounded-xl border border-[#2e2e4d]">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Project Documents
        </h3>

        <div className="mb-8 p-4 bg-[#2e2e4d] rounded-lg">
          <div className="flex items-center gap-4">
            <input
              type="file"
              name="document"
              onChange={(e) => setFile(e.target.files[0])}
              className="file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4"
              accept=".pdf,.doc,.docx"
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Accepted formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>

        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No documents uploaded yet
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc._id}
                className="flex justify-between items-center p-4 bg-[#2e2e4d] rounded-lg hover:bg-[#3a3a5a]"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-400" />
                  <div>
                    <p className="font-medium">{doc.originalName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === "approved"
                            ? "bg-green-900/30 text-green-400"
                            : doc.status === "rejected"
                              ? "bg-red-900/30 text-red-400"
                              : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {doc.status.charAt(0).toUpperCase() +
                          doc.status.slice(1)}
                      </span>
                      {doc.feedback && (
                        <span className="text-xs text-gray-400">
                          {doc.feedback}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(doc._id)}
                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
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
              <h3 className="text-xl font-medium mb-4">
                Send Mentorship Request?
              </h3>
              <p className="text-base text-gray-400 mb-6">
                You are about to send a mentorship request to{" "}
                <span className="font-semibold">{currentMentor?.username}</span>
                .
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
