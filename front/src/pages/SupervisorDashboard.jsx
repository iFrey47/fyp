// import { useEffect, useState } from "react";
// import {
//   Users,
//   GraduationCap,
//   MessageSquare,
//   FileText,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Download,
// } from "lucide-react";

// // DocumentReviewModal defined first, used inside SupervisorDashboard
// function DocumentReviewModal({ studentId, onClose }) {
//   const [documents, setDocuments] = useState([]);
//   const [feedback, setFeedback] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       try {
//         const res = await fetch(
//           // `http://localhost:5000/api/documents/supervisor?studentId=${studentId}`,
//           `http://localhost:5000/api/documents/supervisor`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           },
//         );
//         const data = await res.json();
//         if (data.success) setDocuments(data.documents);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDocuments();
//   }, [studentId]);

//   const handleReview = async (docId, status) => {
//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/documents/${docId}/review`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ status, feedback }),
//         },
//       );
//       if (res.ok) {
//         const { document: updatedDoc } = await res.json();
//         setDocuments((prevDocs) =>
//           prevDocs.map((doc) =>
//             doc._id === updatedDoc._id ? updatedDoc : doc,
//           ),
//         );
//         setFeedback(""); // optional: clear textarea after action
//       }
//     } catch (err) {
//       console.error("Review error:", err);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
//       <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-semibold">Document Review</h3>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-white"
//             >
//               &times;
//             </button>
//           </div>

//           {loading ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//             </div>
//           ) : documents.length === 0 ? (
//             <p className="text-gray-400 text-center py-8">No documents found</p>
//           ) : (
//             <div className="space-y-4">
//               {documents.map((doc) => (
//                 <div key={doc._id} className="bg-gray-700/50 rounded-lg p-4">
//                   <div className="flex justify-between items-center mb-3">
//                     <div className="flex items-center gap-2">
//                       <FileText className="text-blue-400" />
//                       <span className="font-medium">{doc.originalName}</span>
//                     </div>
//                     <a
//                       href={`http://localhost:5000/api/documents/${doc._id}/file`}
//                       target="_blank"
//                       className="text-blue-400 hover:underline text-sm flex items-center gap-1"
//                     >
//                       <Download className="w-4 h-4" /> Download
//                     </a>
//                   </div>

//                   <textarea
//                     placeholder="Add feedback..."
//                     value={feedback}
//                     onChange={(e) => setFeedback(e.target.value)}
//                     className="w-full p-3 bg-gray-700 rounded mb-3 text-sm"
//                     rows={3}
//                   />

//                   <div className="flex gap-2 justify-end">
//                     <button
//                       onClick={() => handleReview(doc._id, "approved")}
//                       className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2 text-sm"
//                     >
//                       <CheckCircle className="w-4 h-4" /> Approve
//                     </button>
//                     <button
//                       onClick={() => handleReview(doc._id, "rejected")}
//                       className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 text-sm"
//                     >
//                       <XCircle className="w-4 h-4" /> Reject
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function SupervisorDashboard() {
//   const navigate = (path) => console.log(`Navigate to: ${path}`);
//   const role = "supervisor";
//   const [students, setStudents] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [reviewingStudent, setReviewingStudent] = useState(null);

//   useEffect(() => {
//     if (role !== "supervisor") navigate("/unauthorized");

//     const fetchAssignedStudents = async () => {
//       const token = localStorage.getItem("token");
//       try {
//         const res = await fetch(
//           "http://localhost:5000/api/auth/students/assigned-to-me",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         const data = await res.json();
//         if (data.success) setStudents(data.students);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAssignedStudents();
//   }, [role]);

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100">
//       {/* Header */}
//       <div className="bg-gray-800 border-b border-gray-700 px-8 py-6">
//         <div className="max-w-7xl mx-auto">
//           <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
//             <GraduationCap className="w-8 h-8" />
//             Supervisor Dashboard
//           </h1>
//           <p className="text-gray-400 mt-2">
//             Manage and oversee your assigned students
//           </p>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="max-w-7xl mx-auto px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           {[
//             {
//               label: "Assigned Students",
//               count: students.length,
//               icon: <Users className="w-6 h-6 text-blue-400" />,
//               bg: "bg-blue-900/30",
//             },
//             {
//               label: "Active Supervisions",
//               count: students.length,
//               icon: <GraduationCap className="w-6 h-6 text-green-400" />,
//               bg: "bg-green-900/30",
//             },
//           ].map((card, index) => (
//             <div
//               key={index}
//               className="bg-gray-800 rounded-xl p-6 border border-gray-700"
//             >
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-400 text-sm font-medium">
//                     {card.label}
//                   </p>
//                   <p className="text-2xl font-bold text-blue-400">
//                     {card.count}
//                   </p>
//                 </div>
//                 <div className={`${card.bg} p-3 rounded-lg`}>{card.icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Students Table */}
//         <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
//           <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 border-b border-gray-700">
//             <h2 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
//               <Users className="w-5 h-5" />
//               Your Assigned Students
//             </h2>
//           </div>

//           <div className="overflow-x-auto">
//             {isLoading ? (
//               <div className="p-12 text-center">
//                 <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
//                   <Clock className="w-8 h-8 text-gray-400 animate-spin" />
//                 </div>
//                 <p className="text-gray-400">Loading students...</p>
//               </div>
//             ) : students.length === 0 ? (
//               <div className="p-12 text-center">
//                 <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
//                   <Users className="w-8 h-8 text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-300 mb-2">
//                   No students assigned yet
//                 </h3>
//                 <p className="text-gray-500">
//                   You'll see your assigned students here once they're allocated
//                   to you
//                 </p>
//               </div>
//             ) : (
//               <table className="w-full">
//                 <thead className="bg-gray-700/50">
//                   <tr>
//                     {["Student Name", "Email", "Status", "Actions"].map((h) => (
//                       <th
//                         key={h}
//                         className="text-left p-6 text-blue-200 font-medium"
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-700">
//                   {students.map((student) => (
//                     <tr
//                       key={student._id}
//                       className="hover:bg-gray-700/30 transition-colors"
//                     >
//                       <td className="p-6">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                             <span className="text-white font-medium text-sm">
//                               {student.username.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                           <div className="font-medium text-white">
//                             {student.username}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-6 text-gray-300">{student.email}</td>
//                       <td className="p-6">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800">
//                           <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
//                           Active
//                         </span>
//                       </td>
//                       <td className="p-6">
//                         <button
//                           onClick={() => setReviewingStudent(student._id)}
//                           className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
//                         >
//                           <FileText className="w-4 h-4" />
//                           Documents
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>

//       {reviewingStudent && (
//         <DocumentReviewModal
//           studentId={reviewingStudent}
//           onClose={() => setReviewingStudent(null)}
//         />
//       )}
//     </div>
//   );
// }

// export default SupervisorDashboard;

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  Eye,
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

// Loading spinner component
function LoadingSpinner({ size = "w-6 h-6" }) {
  return (
    <div
      className={`animate-spin rounded-full ${size} border-2 border-t-transparent border-blue-400`}
    ></div>
  );
}

// Document status badge component
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

// DocumentReviewModal with enhanced UX
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
          // Initialize feedback state for each document
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

        // Update feedback state
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

  const handleFeedbackChange = (docId, value) => {
    setFeedback((prev) => ({
      ...prev,
      [docId]: value,
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-blue-300 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Document Review
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Review and provide feedback on student submissions
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
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
              <div className="text-center py-12">
                <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No documents found
                </h3>
                <p className="text-gray-500">
                  No documents have been submitted for review yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-blue-600/20 p-2 rounded-lg">
                          <FileText className="text-blue-400 w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg">
                            {doc.originalName}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
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
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={doc.status || "pending"} />
                        <a
                          href={`http://localhost:5000/api/documents/${doc._id}/file`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
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
                        placeholder="Provide detailed feedback for the student..."
                        value={feedback[doc._id] || ""}
                        onChange={(e) =>
                          handleFeedbackChange(doc._id, e.target.value)
                        }
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => handleReview(doc._id, "approved")}
                        disabled={
                          actionLoading[doc._id] || doc.status === "approved"
                        }
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
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
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
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

function SupervisorDashboard() {
  const navigate = (path) => console.log(`Navigate to: ${path}`);
  const role = "supervisor";
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingStudent, setReviewingStudent] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (role !== "supervisor") navigate("/unauthorized");

    const fetchAssignedStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/auth/students/assigned-to-me",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        } else {
          setToast({ message: "Failed to load students", type: "error" });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setToast({
          message: "Network error while loading students",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedStudents();
  }, [role]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
        {/* Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-8 py-6 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              Supervisor Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Manage and oversee your assigned students' progress
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                label: "Assigned Students",
                count: students.length,
                icon: <Users className="w-6 h-6 text-blue-400" />,
                bg: "bg-gradient-to-r from-blue-900/30 to-blue-800/30",
                border: "border-blue-700/50",
              },
              {
                label: "Active Supervisions",
                count: students.length,
                icon: <GraduationCap className="w-6 h-6 text-green-400" />,
                bg: "bg-gradient-to-r from-green-900/30 to-green-800/30",
                border: "border-green-700/50",
              },
            ].map((card, index) => (
              <div
                key={index}
                className={`${card.bg} rounded-xl p-6 border ${card.border} backdrop-blur-sm hover:scale-105 transition-transform duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {card.count}
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Students Table */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-700/80 to-gray-800/80 px-6 py-5 border-b border-gray-600">
              <h2 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Assigned Students
              </h2>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-16 text-center">
                  <LoadingSpinner size="w-16 h-16" />
                  <p className="text-gray-400 mt-4 text-lg">
                    Loading students...
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="bg-gray-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-3">
                    No students assigned yet
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You'll see your assigned students here once they're
                    allocated to you by the administration.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-700/30">
                    <tr>
                      {["Student", "Contact", "Status", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="text-left p-6 text-blue-200 font-semibold uppercase tracking-wider text-sm"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {students.map((student, index) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-700/20 transition-colors duration-200"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold">
                                {student.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-white text-lg">
                                {student.username}
                              </div>
                              <div className="text-gray-400 text-sm">
                                Student #{index + 1}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-gray-300">{student.email}</div>
                        </td>
                        <td className="p-6">
                          <StatusBadge status="active" />
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => setReviewingStudent(student._id)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <FileText className="w-4 h-4" />
                            Review Documents
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {reviewingStudent && (
          <DocumentReviewModal
            studentId={reviewingStudent}
            onClose={() => setReviewingStudent(null)}
          />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default SupervisorDashboard;
