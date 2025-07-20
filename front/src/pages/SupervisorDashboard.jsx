import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Calendar,
  User,
  MessageSquare,
  Users,
  BookOpen,
  Bell,
  AlertCircle,
  Clock,
  X,
  ChevronRight,
  Search,
  Filter,
  Mail,
  Award,
  Plus,
  UserCheck,
} from "lucide-react";

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-blue-600";
  const icon =
    type === "success" ? (
      <CheckCircle className="w-5 h-5" />
    ) : type === "error" ? (
      <XCircle className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in`}
    >
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
        ×
      </button>
    </div>
  );
}

// Loading spinner
function LoadingSpinner({ size = "w-6 h-6" }) {
  return (
    <div
      className={`animate-spin rounded-full ${size} border-2 border-t-transparent border-blue-400`}
    ></div>
  );
}

// Status badge
function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      bg: "bg-yellow-900/30",
      text: "text-yellow-300",
      border: "border-yellow-800",
      dot: "bg-yellow-400",
    },
    approved: {
      bg: "bg-green-900/30",
      text: "text-green-300",
      border: "border-green-800",
      dot: "bg-green-400",
    },
    rejected: {
      bg: "bg-red-900/30",
      text: "text-red-300",
      border: "border-red-800",
      dot: "bg-red-400",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
    >
      <div className={`w-2 h-2 ${config.dot} rounded-full mr-2`}></div>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DocumentReviewModal({ studentId, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/documents/supervisor`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await res.json();
        if (data.success) {
          setDocuments(data.documents);
          const initialFeedback = {};
          data.documents.forEach((doc) => {
            initialFeedback[doc._id] = doc.feedback || "";
          });
          setFeedback(initialFeedback);
        }
      } catch (error) {
        setToast({ message: "Failed to load documents", type: "error" });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [studentId]);

  const handleFeedbackChange = (docId, value) => {
    setFeedback((prev) => ({
      ...prev,
      [docId]: value,
    }));
  };

  const handleReview = async (docId, status) => {
    setActionLoading((prev) => ({ ...prev, [docId]: status }));

    try {
      const res = await fetch(
        `http://localhost:5000/api/documents/${docId}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status,
            feedback: feedback[docId] || "",
          }),
        },
      );

      if (res.ok) {
        const { document: updatedDoc } = await res.json();
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc._id === updatedDoc._id ? updatedDoc : doc,
          ),
        );

        setToast({
          message: `Document ${status === "approved" ? "approved" : "rejected"} successfully!`,
          type: "success",
        });

        setFeedback((prev) => ({
          ...prev,
          [docId]: updatedDoc.feedback || "",
        }));
      } else {
        throw new Error("Review failed");
      }
    } catch (err) {
      console.error("Review error:", err);
      setToast({
        message: `Failed to ${status} document. Please try again.`,
        type: "error",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [docId]: null }));
    }
  };

  const handleSaveToLocalStorage = (doc) => {
    const existing = JSON.parse(localStorage.getItem("studentFeedbacks")) || {};
    const studentFeedback = existing[doc.studentId._id] || {};
    studentFeedback[doc._id] = feedback[doc._id] || "";

    localStorage.setItem(
      "studentFeedbacks",
      JSON.stringify({
        ...existing,
        [doc.studentId._id]: studentFeedback,
      }),
    );

    setToast({
      message: "Feedback saved locally for this student!",
      type: "success",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-blue-300 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Document Review
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="w-12 h-12" />
              <p className="text-gray-400 mt-4">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-gray-400">No documents found.</p>
          ) : (
            <div className="space-y-6">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-gray-700/30 rounded-xl p-6 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-white text-lg">
                        {doc.originalName}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {doc.studentId?.username || "Unknown Student"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={doc.status || "pending"} />
                      <a
                        href={`http://localhost:5000/api/documents/${doc._id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Feedback
                    </label>
                    <textarea
                      placeholder="Provide detailed feedback..."
                      value={feedback[doc._id] || ""}
                      onChange={(e) =>
                        handleFeedbackChange(doc._id, e.target.value)
                      }
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      rows={4}
                    />

                    <button
                      onClick={() => handleSaveToLocalStorage(doc)}
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Save Feedback Locally
                    </button>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => handleReview(doc._id, "approved")}
                      disabled={
                        actionLoading[doc._id] || doc.status === "approved"
                      }
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                    >
                      {actionLoading[doc._id] === "approved" ? (
                        <LoadingSpinner size="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {doc.status === "approved" ? "Approved" : "Approve"}
                    </button>

                    <button
                      onClick={() => handleReview(doc._id, "rejected")}
                      disabled={
                        actionLoading[doc._id] || doc.status === "rejected"
                      }
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                    >
                      {actionLoading[doc._id] === "rejected" ? (
                        <LoadingSpinner size="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {doc.status === "rejected" ? "Rejected" : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const [toast, setToast] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Meeting scheduling state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [scheduledMeetings, setScheduledMeetings] = useState([]);

  // Slot calendar state
  const [slots, setSlots] = useState([
    { day: "Monday", time: "00:00-00:00", available: true },
    { day: "Tuesday", time: "00:00-00:00", available: true },
    { day: "Wednesday", time: "00:00-00:00", available: true },
    { day: "Thursday", time: "00:00-00:00", available: false },
    { day: "Friday", time: "00:00-00:00", available: true },
  ]);

  // New slot form state
  const [newSlot, setNewSlot] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "11:00",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch assigned students
        const studentsRes = await fetch(
          "http://localhost:5000/api/auth/supervisor/students",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const studentsData = await studentsRes.json();
        if (studentsData.success) setStudents(studentsData.students);

        // Fetch documents needing review
        const docsRes = await fetch(
          "http://localhost:5000/api/documents/supervisor",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const docsData = await docsRes.json();
        if (docsData.success) setDocuments(docsData.documents);

        // Fetch meetings
        const meetingsRes = await fetch(
          "http://localhost:5000/api/meetings/supervisor",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const meetingsData = await meetingsRes.json();
        if (meetingsData.success) setScheduledMeetings(meetingsData.meetings);
      } catch (error) {
        setToast({ message: "Failed to load data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const startChat = (student) => {
    navigate("/chat", {
      state: { recipientUser: student.username },
    });
  };

  const openDocumentReview = (student) => {
    setSelectedStudent(student);
    setShowDocumentModal(true);
  };

  const handleScheduleMeeting = async () => {
    const token = localStorage.getItem("token");

    try {
      const meetingData = {
        students: selectedStudents,
        date: meetingDate,
        time: meetingTime,
        title: meetingTitle,
        description: meetingDescription,
      };

      const res = await fetch("http://localhost:5000/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(meetingData),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to schedule meeting");

      setScheduledMeetings([...scheduledMeetings, data.meeting]);

      setSelectedStudents([]);
      setMeetingDate("");
      setMeetingTime("");
      setMeetingTitle("");
      setMeetingDescription("");

      setToast({ text: "Meeting scheduled successfully!", type: "success" });
    } catch (err) {
      setToast({ text: err.message, type: "error" });
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5000/api/meetings/${meetingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to cancel meeting");

      setScheduledMeetings(
        scheduledMeetings.filter((m) => m._id !== meetingId),
      );

      setToast({ text: "Meeting cancelled successfully", type: "success" });
    } catch (err) {
      setToast({ text: err.message, type: "error" });
    }
  };

  const toggleSlotAvailability = (index) => {
    const updatedSlots = [...slots];
    updatedSlots[index].available = !updatedSlots[index].available;
    setSlots(updatedSlots);
  };

  const handleAddSlot = () => {
    const { day, startTime, endTime } = newSlot;

    if (!day || !startTime || !endTime) {
      setToast({ message: "Please fill all slot fields", type: "error" });
      return;
    }

    const timeRange = `${startTime}-${endTime}`;
    const newSlotEntry = {
      day,
      time: timeRange,
      available: true,
    };

    setSlots([...slots, newSlotEntry]);
    setToast({ message: "New slot added successfully!", type: "success" });

    // Reset form
    setNewSlot({
      day: "Monday",
      startTime: "09:00",
      endTime: "11:00",
    });
  };

  const handleNewSlotChange = (e) => {
    const { name, value } = e.target;
    setNewSlot((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Supervisor Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 font-medium ${
              activeTab === "students"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            My Students
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 font-medium ${
              activeTab === "documents"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            Documents Review
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            className={`px-4 py-2 font-medium ${
              activeTab === "meetings"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            Meetings
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`px-4 py-2 font-medium ${
              activeTab === "availability"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            My Availability
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="w-12 h-12" />
          </div>
        ) : activeTab === "students" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student._id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                      {student.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{student.username}</h3>
                      <p className="text-gray-400 text-sm">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => startChat(student)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
                    <button
                      onClick={() => openDocumentReview(student)}
                      className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Review
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-400">
                No students assigned to you yet.
              </div>
            )}
          </div>
        ) : activeTab === "documents" ? (
          <div className="space-y-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{doc.originalName}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        From: {doc.studentId?.username || "Unknown"} •
                        Submitted:{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={doc.status || "pending"} />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() =>
                        window.open(
                          `http://localhost:5000/api/documents/${doc._id}/file`,
                          "_blank",
                        )
                      }
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudent(doc.studentId);
                        setShowDocumentModal(true);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm"
                    >
                      Review Document
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                No documents need review at this time.
              </div>
            )}
          </div>
        ) : activeTab === "meetings" ? (
          <div className="space-y-8">
            {/* Meeting Scheduling Panel */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Meeting
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-3">
                    Select Students
                  </label>
                  <select
                    multiple
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white h-[120px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(
                        (option) => option.value,
                      );
                      setSelectedStudents(selected);
                    }}
                  >
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.username} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-3">
                      Meeting Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-blue-200 text-sm font-medium mb-3">
                      Meeting Time
                    </label>
                    <input
                      type="time"
                      className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-3">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Project Discussion"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-3">
                    Description
                  </label>
                  <textarea
                    className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    rows="3"
                    placeholder="Meeting agenda and details..."
                    value={meetingDescription}
                    onChange={(e) => setMeetingDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleScheduleMeeting}
                  disabled={
                    !selectedStudents.length || !meetingDate || !meetingTime
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Meeting
                </button>
              </div>
            </div>

            {/* Scheduled Meetings */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Meetings
                </h2>
              </div>

              <div className="p-6">
                {scheduledMeetings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No meetings scheduled yet
                    </h3>
                    <p className="text-gray-500">
                      Schedule your first meeting above
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledMeetings.map((meeting) => (
                      <div
                        key={meeting._id}
                        className="bg-gray-700/30 p-6 rounded-xl border border-gray-600/50 hover:border-indigo-500/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-indigo-400" />
                              {meeting.title}
                            </h3>
                            <p className="text-gray-300 mt-1">
                              {meeting.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCancelMeeting(meeting._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-6 text-sm mb-4">
                          <span className="flex items-center gap-2 text-indigo-300 bg-indigo-900/20 px-3 py-1 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2 text-indigo-300 bg-indigo-900/20 px-3 py-1 rounded-lg">
                            <Clock className="w-4 h-4" />
                            {meeting.time}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                            Students
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {meeting.students.map((studentId) => {
                              const student = students.find(
                                (s) => s._id === studentId,
                              );
                              return student ? (
                                <span
                                  key={studentId}
                                  className="flex items-center gap-1 text-xs bg-gray-600/50 px-3 py-1 rounded-lg text-gray-200"
                                >
                                  <User className="w-3 h-3" />
                                  {student.username}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "availability" ? (
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                My Availability
              </h2>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  Weekly Availability Slots
                </h3>
                <p className="text-gray-400 mb-4">
                  Set your weekly availability for student meetings. Click on a
                  slot to toggle availability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot, index) => (
                  <div
                    key={`${slot.day}-${slot.time}`}
                    onClick={() => toggleSlotAvailability(index)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      slot.available
                        ? "bg-green-900/30 border-green-800 hover:border-green-600"
                        : "bg-red-900/30 border-red-800 hover:border-red-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{slot.day}</h4>
                        <p className="text-sm text-gray-300">{slot.time}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full ${
                          slot.available ? "bg-green-400" : "bg-red-400"
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-4">
                  Add New Slot
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Day
                    </label>
                    <select
                      name="day"
                      value={newSlot.day}
                      onChange={handleNewSlotChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={newSlot.startTime}
                      onChange={handleNewSlotChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={newSlot.endTime}
                      onChange={handleNewSlotChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddSlot}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Slot
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Document Review Modal */}
      {showDocumentModal && selectedStudent && (
        <DocumentReviewModal
          studentId={selectedStudent._id}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
