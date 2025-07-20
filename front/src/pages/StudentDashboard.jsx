// import { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   FileText,
//   UploadCloud,
//   Download,
//   X,
//   Plus,
//   FolderOpen,
//   MessageSquare,
// } from "lucide-react";

// export default function StudentDashboard() {
//   const navigate = useNavigate();
//   const [mentors, setMentors] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const role = localStorage.getItem("role");
//   const token = localStorage.getItem("token");

//   const [confirmationVisible, setConfirmationVisible] = useState(false);
//   const [currentMentorId, setCurrentMentorId] = useState(null);
//   const [currentMentor, setCurrentMentor] = useState(null);

//   // Document modal states
//   const [documentModalVisible, setDocumentModalVisible] = useState(false);
//   const [documents, setDocuments] = useState([]);
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [hasAssignedSupervisor, setHasAssignedSupervisor] = useState(false);

//   const [supervisor, setSupervisor] = useState(null);

//   useEffect(() => {
//     if (role !== "student") {
//       navigate("/unauthorized");
//     } else {
//       fetchMentors();
//       fetchRequests();
//       fetchDocuments();
//       fetchSupervisor(); // Add this
//     }
//   }, [role, navigate, token]);

//   const fetchMentors = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/mentors", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success) setMentors(data.mentors);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     }
//   };

//   const fetchSupervisor = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/supervisor", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // First check if the response is ok
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const data = await res.json();

//       // Check if the request was successful and we have data
//       if (data.success) {
//         setSupervisor(data.supervisor);
//       } else {
//         setSupervisor(null);
//       }
//     } catch (err) {
//       console.error("Error fetching supervisor:", err);
//       setSupervisor(null);
//     }
//   };
//   useEffect(() => {
//     if (role !== "student") {
//       navigate("/unauthorized");
//     } else {
//       fetchMentors();
//       fetchRequests();
//       fetchDocuments();
//       fetchSupervisor();
//     }
//   }, [role, navigate, token]);

//   const fetchRequests = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/requests", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success) setRequests(data.requests);
//     } catch (err) {
//       console.error("Request fetch error:", err);
//     }
//   };

//   const fetchDocuments = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/documents/student", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success) {
//         setDocuments(data.documents);
//         setHasAssignedSupervisor(true);
//       } else {
//         // If fetch fails due to no supervisor assignment, show the message
//         if (data.message && data.message.includes("supervisor")) {
//           setHasAssignedSupervisor(false);
//         }
//       }
//     } catch (err) {
//       console.error("Document fetch error:", err);
//       // If there's an error, check if it's related to supervisor assignment
//       setHasAssignedSupervisor(false);
//     }
//   };

//   const showConfirmation = (mentorId) => {
//     const mentor = mentors.find((m) => m._id === mentorId);
//     setCurrentMentor(mentor);
//     setCurrentMentorId(mentorId);
//     setConfirmationVisible(true);
//   };

//   const closeConfirmation = () => {
//     setConfirmationVisible(false);
//     setCurrentMentorId(null);
//   };

//   const confirmAction = () => {
//     sendRequest(currentMentorId);
//     closeConfirmation();
//   };

//   const sendRequest = async (mentorId) => {
//     setLoading(true);
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/send-request", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ mentorId }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         alert("Request sent successfully!");
//         setRequests((prev) => [...prev, data.request]);
//       }
//     } catch (err) {
//       console.error("Request error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getRequestStatus = (mentorId) => {
//     const req = requests.find((r) => r.mentor && r.mentor._id === mentorId);
//     return req ? req.status : null;
//   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setUploading(true);
//     const formData = new FormData();
//     formData.append("document", file);

//     try {
//       const res = await fetch("http://localhost:5000/api/documents/upload", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (data.success) {
//         fetchDocuments();
//         setFile(null);
//         // Reset file input
//         const fileInput = document.querySelector('input[type="file"]');
//         if (fileInput) fileInput.value = "";
//       } else {
//         // Handle supervisor assignment error
//         if (data.message && data.message.includes("supervisor")) {
//           setHasAssignedSupervisor(false);
//         }
//         alert(data.message || "Upload failed");
//       }
//     } catch (err) {
//       console.error("Upload error:", err);
//       alert("Upload failed. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDownload = (docId) => {
//     window.open(`http://localhost:5000/api/documents/${docId}/file`, "_blank");
//   };

//   const openDocumentModal = () => {
//     setDocumentModalVisible(true);
//   };

//   const closeDocumentModal = () => {
//     setDocumentModalVisible(false);
//     setFile(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] p-10 text-white">
//       <h2 className="text-5xl font-extrabold mb-12 text-center tracking-tight">
//         Find Your Mentor
//       </h2>

//       {/* Action Buttons */}
//       <div className="flex justify-center gap-6 mb-10">
//         <Link
//           to="/add-fyp-idea"
//           className="px-8 py-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
//         >
//           <Plus className="w-5 h-5" />
//           Add Your FYP Idea
//         </Link>

//         <button
//           onClick={openDocumentModal}
//           className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
//         >
//           <FolderOpen className="w-5 h-5" />
//           Manage Documents
//         </button>
//       </div>

//       {/* Mentors Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
//         {mentors.map((mentor) => {
//           const status = getRequestStatus(mentor._id);
//           const isAvailable = mentor.isAvailable;

//           return (
//             <div
//               key={mentor._id}
//               className="bg-[#22223a] shadow-xl rounded-xl p-6 hover:scale-105 transition-all duration-300 border border-[#2e2e4d]"
//             >
//               <div className="flex items-center gap-5 mb-5">
//                 <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
//                   {mentor.username[0]?.toUpperCase()}
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-semibold">{mentor.username}</h3>
//                   <p className="text-sm text-gray-400">{mentor.email}</p>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <span
//                   className={`inline-block px-4 py-1 text-sm font-bold rounded-full ${
//                     isAvailable
//                       ? "bg-green-900 text-green-300"
//                       : "bg-red-900 text-red-300"
//                   }`}
//                 >
//                   {isAvailable ? "Available" : "Not Available"}
//                 </span>
//               </div>

//               <div>
//                 {status === "pending" && (
//                   <p className="text-yellow-400 font-medium animate-pulse">
//                     Pending Request...
//                   </p>
//                 )}

//                 {status === "accepted" && (
//                   <button
//                     className="w-full py-3 mt-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl hover:shadow-lg"
//                     onClick={() =>
//                       navigate("/chat", {
//                         state: { recipientUser: mentor.username },
//                       })
//                     }
//                   >
//                     Chat
//                   </button>
//                 )}

//                 {status === "rejected" && (
//                   <p className="text-red-500 font-semibold">Request Rejected</p>
//                 )}

//                 {!status && isAvailable && (
//                   <button
//                     className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:scale-[1.03]"
//                     onClick={() => showConfirmation(mentor._id)}
//                     disabled={loading}
//                   >
//                     Send Request
//                   </button>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Document Management Modal */}
//       {documentModalVisible && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
//           <div className="bg-[#1f1f3a] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2e2e4d] text-white">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-6 border-b border-[#2e2e4d]">
//               <h3 className="text-2xl font-semibold flex items-center gap-3">
//                 <FileText className="w-7 h-7 text-blue-400" />
//                 Project Documents
//               </h3>
//               <button
//                 onClick={closeDocumentModal}
//                 className="p-2 hover:bg-[#2e2e4d] rounded-lg transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="p-6">
//               {!hasAssignedSupervisor ? (
//                 /* No Supervisor Assigned Message */
//                 <div className="text-center py-16">
//                   <div className="mx-auto w-24 h-24 bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
//                     <svg
//                       className="w-12 h-12 text-orange-400"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                       />
//                     </svg>
//                   </div>
//                   <h4 className="text-xl font-semibold mb-4 text-orange-400">
//                     Supervisor Not Assigned Yet
//                   </h4>
//                   <p className="text-gray-300 mb-6 max-w-md mx-auto leading-relaxed">
//                     A supervisor hasn't been assigned to you by your coordinator
//                     yet. You'll be able to upload and manage your project
//                     documents once a supervisor is assigned.
//                   </p>
//                   <div className="bg-[#22223a] p-4 rounded-lg border border-orange-900/30 max-w-md mx-auto">
//                     <p className="text-sm text-orange-300">
//                       💡 <strong>What to do:</strong> Contact your program
//                       coordinator or wait for supervisor assignment
//                       notification.
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 /* Normal Document Management Interface */
//                 <>
//                   {/* Supervisor Info Section */}
//                   <div className="mb-8 p-6 bg-[#22223a] rounded-xl border border-[#2e2e4d]">
//                     <div className="flex items-center justify-between mb-4">
//                       <h4 className="text-lg font-semibold text-purple-400">
//                         Your Supervisor
//                       </h4>
//                       {supervisor ? (
//                         <button
//                           onClick={() =>
//                             navigate("/chat", {
//                               state: { recipientUser: supervisor.username },
//                             })
//                           }
//                           className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center gap-2 hover:brightness-110 transition-all"
//                         >
//                           <MessageSquare className="w-4 h-4" />
//                           Start Chat
//                         </button>
//                       ) : null}
//                     </div>

//                     {supervisor ? (
//                       <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-center text-xl font-bold">
//                           {supervisor.username[0]?.toUpperCase()}
//                         </div>
//                         <div>
//                           <h3 className="font-medium text-white">
//                             {supervisor.username}
//                           </h3>
//                           <p className="text-sm text-gray-400">
//                             {supervisor.email}
//                           </p>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="text-center py-4 text-yellow-400">
//                         <p>Supervisor information not available</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Upload Section */}
//                   <div className="mb-8 p-6 bg-[#22223a] rounded-xl border border-[#2e2e4d]">
//                     <h4 className="text-lg font-semibold mb-4 text-blue-400">
//                       Upload New Document
//                     </h4>
//                     <div className="space-y-4">
//                       <div className="flex items-center gap-4">
//                         <input
//                           type="file"
//                           name="document"
//                           onChange={(e) => setFile(e.target.files[0])}
//                           className="flex-1 file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 file:cursor-pointer file:hover:bg-blue-700 file:transition-colors"
//                           accept=".pdf,.doc,.docx"
//                         />
//                         <button
//                           onClick={handleUpload}
//                           disabled={uploading || !file}
//                           className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors min-w-[120px] justify-center"
//                         >
//                           <UploadCloud className="w-4 h-4" />
//                           {uploading ? "Uploading..." : "Upload"}
//                         </button>
//                       </div>
//                       <p className="text-sm text-gray-400">
//                         📄 Accepted formats: PDF, DOC, DOCX • Max file size:
//                         10MB
//                       </p>
//                     </div>
//                   </div>

//                   {/* Documents List */}
//                   <div>
//                     <h4 className="text-lg font-semibold mb-4 text-emerald-400">
//                       Your Documents ({documents.length})
//                     </h4>
//                     <div className="space-y-3 max-h-96 overflow-y-auto">
//                       {documents.length === 0 ? (
//                         <div className="text-center py-12 text-gray-400">
//                           <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                           <p className="text-lg">No documents uploaded yet</p>
//                           <p className="text-sm">
//                             Upload your first project document to get started
//                           </p>
//                         </div>
//                       ) : (
//                         documents.map((doc) => (
//                           <div
//                             key={doc._id}
//                             className="flex justify-between items-center p-4 bg-[#2e2e4d] rounded-lg hover:bg-[#3a3a5a] transition-colors"
//                           >
//                             <div className="flex items-center gap-4 flex-1">
//                               <div className="p-2 bg-blue-600/20 rounded-lg">
//                                 <FileText className="text-blue-400 w-6 h-6" />
//                               </div>
//                               <div className="flex-1">
//                                 <p className="font-medium text-white mb-1">
//                                   {doc.originalName}
//                                 </p>
//                                 <div className="flex items-center gap-3">
//                                   <span
//                                     className={`text-xs px-3 py-1 rounded-full font-medium ${
//                                       doc.status === "approved"
//                                         ? "bg-green-900/40 text-green-300 border border-green-700/50"
//                                         : doc.status === "rejected"
//                                           ? "bg-red-900/40 text-red-300 border border-red-700/50"
//                                           : "bg-yellow-900/40 text-yellow-300 border border-yellow-700/50"
//                                     }`}
//                                   >
//                                     {doc.status.charAt(0).toUpperCase() +
//                                       doc.status.slice(1)}
//                                   </span>
//                                   {doc.feedback && (
//                                     <span className="text-xs text-gray-400 italic">
//                                       "{doc.feedback}"
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                             <button
//                               onClick={() => handleDownload(doc._id)}
//                               className="p-3 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
//                               title="Download Document"
//                             >
//                               <Download className="w-5 h-5" />
//                             </button>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Confirmation Modal */}
//       {confirmationVisible && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
//           <div className="bg-[#1f1f3a] rounded-xl shadow-xl max-w-lg mx-auto p-8 border border-[#2e2e4d] text-white">
//             <div className="text-center">
//               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 mb-6">
//                 <svg
//                   className="h-8 w-8 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                   />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-medium mb-4">
//                 Send Mentorship Request?
//               </h3>
//               <p className="text-base text-gray-400 mb-6">
//                 You are about to send a mentorship request to{" "}
//                 <span className="font-semibold">{currentMentor?.username}</span>
//                 .
//               </p>
//               <div className="flex justify-center space-x-6">
//                 <button
//                   onClick={closeConfirmation}
//                   className="px-5 py-2 text-base font-semibold text-white bg-transparent border border-gray-500 rounded-lg hover:bg-gray-700"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmAction}
//                   className="px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-600 rounded-lg hover:brightness-110"
//                 >
//                   Yes, Send Request
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  UploadCloud,
  Download,
  X,
  Plus,
  FolderOpen,
  MessageSquare,
  Calendar,
  Clock,
  Users,
} from "lucide-react";

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

  // Document modal states
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [hasAssignedSupervisor, setHasAssignedSupervisor] = useState(false);

  const [supervisor, setSupervisor] = useState(null);
  const [meetings, setMeetings] = useState([]); // New state for meetings

  useEffect(() => {
    if (role !== "student") {
      navigate("/unauthorized");
    } else {
      fetchMentors();
      fetchRequests();
      fetchDocuments();
      fetchSupervisor();
      fetchMeetings(); // Fetch meetings
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

  const fetchSupervisor = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/supervisor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setSupervisor(data.supervisor);
      } else {
        setSupervisor(null);
      }
    } catch (err) {
      console.error("Error fetching supervisor:", err);
      setSupervisor(null);
    }
  };

  // New function to fetch meetings
  const fetchMeetings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/meetings/student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch meetings");

      const data = await res.json();
      if (data.success) {
        setMeetings(data.meetings);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
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
      if (data.success) {
        setDocuments(data.documents);
        setHasAssignedSupervisor(true);
      } else {
        if (data.message && data.message.includes("supervisor")) {
          setHasAssignedSupervisor(false);
        }
      }
    } catch (err) {
      console.error("Document fetch error:", err);
      setHasAssignedSupervisor(false);
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
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        if (data.message && data.message.includes("supervisor")) {
          setHasAssignedSupervisor(false);
        }
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (docId) => {
    window.open(`http://localhost:5000/api/documents/${docId}/file`, "_blank");
  };

  const openDocumentModal = () => {
    setDocumentModalVisible(true);
  };

  const closeDocumentModal = () => {
    setDocumentModalVisible(false);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c] p-10 text-white">
      <h2 className="text-5xl font-extrabold mb-12 text-center tracking-tight">
        Find Your Mentor
      </h2>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mb-10">
        <Link
          to="/add-fyp-idea"
          className="px-8 py-4 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Your FYP Idea
        </Link>

        <button
          onClick={openDocumentModal}
          className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300 font-semibold flex items-center gap-2"
        >
          <FolderOpen className="w-5 h-5" />
          Manage Documents
        </button>
      </div>

      {/* Upcoming Meetings Section */}
      {meetings.length > 0 && (
        <div className="mb-10 bg-[#22223a] rounded-xl p-6 border border-[#2e2e4d]">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-purple-400">
            <Calendar className="w-6 h-6" />
            Upcoming Meetings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="bg-[#2e2e4d] p-4 rounded-lg border border-[#3a3a5a] hover:border-purple-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{meeting.title}</h4>
                  <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                    With Supervisor
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  {meeting.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-blue-300">
                    <Calendar className="w-4 h-4" />
                    {new Date(meeting.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <Clock className="w-4 h-4" />
                    {meeting.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Grid */}
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

      {/* Document Management Modal */}
      {documentModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f3a] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2e2e4d] text-white">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#2e2e4d]">
              <h3 className="text-2xl font-semibold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-400" />
                Project Documents
              </h3>
              <button
                onClick={closeDocumentModal}
                className="p-2 hover:bg-[#2e2e4d] rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!hasAssignedSupervisor ? (
                /* No Supervisor Assigned Message */
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-12 h-12 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-orange-400">
                    Supervisor Not Assigned Yet
                  </h4>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto leading-relaxed">
                    A supervisor hasn't been assigned to you by your coordinator
                    yet. You'll be able to upload and manage your project
                    documents once a supervisor is assigned.
                  </p>
                  <div className="bg-[#22223a] p-4 rounded-lg border border-orange-900/30 max-w-md mx-auto">
                    <p className="text-sm text-orange-300">
                      💡 <strong>What to do:</strong> Contact your program
                      coordinator or wait for supervisor assignment
                      notification.
                    </p>
                  </div>
                </div>
              ) : (
                /* Normal Document Management Interface */
                <>
                  {/* Supervisor Info Section */}
                  <div className="mb-8 p-6 bg-[#22223a] rounded-xl border border-[#2e2e4d]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-purple-400">
                        Your Supervisor
                      </h4>
                      {supervisor ? (
                        <button
                          onClick={() =>
                            navigate("/chat", {
                              state: { recipientUser: supervisor.username },
                            })
                          }
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center gap-2 hover:brightness-110 transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Start Chat
                        </button>
                      ) : null}
                    </div>

                    {supervisor ? (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-center text-xl font-bold">
                          {supervisor.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {supervisor.username}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {supervisor.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-yellow-400">
                        <p>Supervisor information not available</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Section */}
                  <div className="mb-8 p-6 bg-[#22223a] rounded-xl border border-[#2e2e4d]">
                    <h4 className="text-lg font-semibold mb-4 text-blue-400">
                      Upload New Document
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          name="document"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="flex-1 file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 file:cursor-pointer file:hover:bg-blue-700 file:transition-colors"
                          accept=".pdf,.doc,.docx"
                        />
                        <button
                          onClick={handleUpload}
                          disabled={uploading || !file}
                          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors min-w-[120px] justify-center"
                        >
                          <UploadCloud className="w-4 h-4" />
                          {uploading ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                      <p className="text-sm text-gray-400">
                        📄 Accepted formats: PDF, DOC, DOCX • Max file size:
                        10MB
                      </p>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-emerald-400">
                      Your Documents ({documents.length})
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {documents.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No documents uploaded yet</p>
                          <p className="text-sm">
                            Upload your first project document to get started
                          </p>
                        </div>
                      ) : (
                        documents.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex justify-between items-center p-4 bg-[#2e2e4d] rounded-lg hover:bg-[#3a3a5a] transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="p-2 bg-blue-600/20 rounded-lg">
                                <FileText className="text-blue-400 w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-white mb-1">
                                  {doc.originalName}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                                      doc.status === "approved"
                                        ? "bg-green-900/40 text-green-300 border border-green-700/50"
                                        : doc.status === "rejected"
                                          ? "bg-red-900/40 text-red-300 border border-red-700/50"
                                          : "bg-yellow-900/40 text-yellow-300 border border-yellow-700/50"
                                    }`}
                                  >
                                    {doc.status.charAt(0).toUpperCase() +
                                      doc.status.slice(1)}
                                  </span>
                                  {doc.feedback && (
                                    <span className="text-xs text-gray-400 italic">
                                      "{doc.feedback}"
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(doc._id)}
                              className="p-3 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Download Document"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
