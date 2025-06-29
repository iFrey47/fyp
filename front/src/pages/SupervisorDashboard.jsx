import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  User,
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
    <>
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

                      {/* Save Locally Button */}
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
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default DocumentReviewModal;
