// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// export default function MentorDashboard() {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");
//   const token = localStorage.getItem("token");

//   const [isAvailable, setIsAvailable] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [requests, setRequests] = useState([]);
//   const [acceptedStudents, setAcceptedStudents] = useState([]);
//   const [confirmationVisible, setConfirmationVisible] = useState(false);
//   const [confirmationType, setConfirmationType] = useState("accept");
//   const [currentRequestId, setCurrentRequestId] = useState(null);

//   // Fetch availability status and requests
//   useEffect(() => {
//     if (role !== "mentor") {
//       navigate("/unauthorized");
//     } else {
//       const fetchAvailability = async () => {
//         try {
//           const res = await fetch(
//             "http://localhost:5000/api/auth/availability",
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );
//           const data = await res.json();
//           if (data.success) {
//             setIsAvailable(data.isAvailable);
//           } else {
//             console.error("Error fetching availability:", data.message);
//           }
//         } catch (err) {
//           console.error("Error fetching availability:", err);
//         }
//       };

//       const fetchRequests = async () => {
//         try {
//           const res = await fetch("http://localhost:5000/api/auth/requests", {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
//           const data = await res.json();
//           if (data.success) {
//             setRequests(data.requests);
//           } else {
//             console.error("Error fetching requests:", data.message);
//           }
//         } catch (err) {
//           console.error("Error fetching requests:", err);
//         }
//       };
//       const fetchAcceptedStudents = async () => {
//         try {
//           const res = await fetch(
//             "http://localhost:5000/api/auth/accepted-students",
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );
//           const data = await res.json();
//           if (data.success) {
//             setAcceptedStudents(data.students);
//           } else {
//             console.error("Error fetching accepted students:", data.message);
//           }
//         } catch (err) {
//           console.error("Error fetching accepted students:", err);
//         }
//       };

//       fetchAcceptedStudents();
//       fetchAvailability();
//       fetchRequests();
//     }
//   }, [role, navigate, token]);

//   // Toggle availability status
//   const toggleAvailability = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         "http://localhost:5000/api/auth/toggle-availability",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await res.json();
//       if (data.success) {
//         setIsAvailable(data.isAvailable);
//       } else {
//         console.error("Error toggling availability");
//       }
//     } catch (err) {
//       console.error("Error toggling availability:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show confirmation dialog
//   const showConfirmation = (requestId, type) => {
//     setCurrentRequestId(requestId);
//     setConfirmationType(type);
//     setConfirmationVisible(true);
//   };

//   // Close confirmation dialog
//   const closeConfirmation = () => {
//     setConfirmationVisible(false);
//   };

//   // Confirm action after dialog
//   const confirmAction = () => {
//     handleRequestResponse(
//       currentRequestId,
//       confirmationType === "accept" ? "accepted" : "rejected"
//     );
//     closeConfirmation();
//   };

//   // Handle request responses (accept/reject)
//   const handleRequestResponse = async (requestId, action) => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/auth/request/${requestId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ status: action }), // 'accepted' or 'rejected'
//         }
//       );

//       const data = await res.json();
//       if (data.success) {
//         setRequests(requests.filter((req) => req._id !== requestId)); // Remove processed request

//         // If accepted, add to the accepted students list
//         if (action === "accepted") {
//           const studentRequest = requests.find((req) => req._id === requestId);
//           if (studentRequest) {
//             setAcceptedStudents((prevStudents) => [
//               ...prevStudents,
//               studentRequest,
//             ]);
//           }
//         }
//         alert(`Request ${action}`);
//       } else {
//         console.error("Error responding to request:", data.message);
//       }
//     } catch (err) {
//       console.error("Error responding to request:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-md border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-5">
//           <h1 className="text-2xl font-bold text-gray-800">Mentor Dashboard</h1>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-6 py-7">
//         {/* Status Card */}
//         <div className="bg-white shadow-lg rounded-xl p-7 mb-7 transform transition-all duration-300 hover:shadow-xl">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//             <div className="mb-5 lg:mb-0">
//               <h2 className="text-xl font-semibold text-gray-800">
//                 Your Status
//               </h2>
//               <div className="mt-3 flex items-center">
//                 <div
//                   className={`h-3 w-3 rounded-full mr-3 ${
//                     isAvailable ? "bg-green-500" : "bg-red-500"
//                   }`}
//                 ></div>
//                 <p className="text-base text-gray-700">
//                   {isAvailable
//                     ? "You are currently available for chat sessions"
//                     : "You are not available for chat sessions"}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={toggleAvailability}
//               disabled={loading}
//               className={`px-5 py-2.5 rounded-lg font-medium text-base text-white shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-50 transform transition-all duration-300 hover:scale-105 ${
//                 isAvailable
//                   ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
//                   : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
//               }`}
//             >
//               {loading
//                 ? "Updating..."
//                 : isAvailable
//                 ? "Set as Unavailable"
//                 : "Set as Available"}
//             </button>
//           </div>
//         </div>

//         {/* Requests Section */}
//         <div className="bg-white shadow-lg rounded-xl p-7">
//           <div className="border-b border-gray-200 pb-4 mb-5">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Incoming Requests
//             </h2>
//             <p className="mt-2 text-base text-gray-600">
//               Review and respond to pending session requests
//             </p>
//           </div>

//           {requests.length === 0 ? (
//             <div className="py-10 text-center">
//               <svg
//                 className="mx-auto h-16 w-16 text-gray-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                 />
//               </svg>
//               <p className="mt-4 text-lg font-medium text-gray-500">
//                 No pending requests
//               </p>
//               <p className="mt-2 text-base text-gray-400">
//                 All caught up! Check back later for new requests.
//               </p>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {requests.map((request) => (
//                 <li
//                   key={request._id}
//                   className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300"
//                 >
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                     <div className="mb-4 sm:mb-0">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
//                           {request.student.username.charAt(0).toUpperCase()}
//                         </div>
//                         <div className="ml-4">
//                           <h3 className="text-lg font-semibold text-gray-800">
//                             {request.student.username}
//                           </h3>
//                           <p className="text-sm text-gray-600">
//                             Requesting a mentoring session
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex space-x-4">
//                       <button
//                         onClick={() => showConfirmation(request._id, "reject")}
//                         className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm transition-all duration-300"
//                       >
//                         Decline
//                       </button>
//                       <button
//                         onClick={() => showConfirmation(request._id, "accept")}
//                         className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-300"
//                       >
//                         Accept
//                       </button>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </main>

//       {/* Confirmation Modal */}
//       {confirmationVisible && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
//           <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6">
//             <div className="text-center">
//               <div
//                 className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
//                   confirmationType === "accept" ? "bg-green-100" : "bg-red-100"
//                 } mb-4`}
//               >
//                 {confirmationType === "accept" ? (
//                   <svg
//                     className="h-6 w-6 text-green-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M5 13l4 4L19 7"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     className="h-6 w-6 text-red-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 )}
//               </div>

//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 {confirmationType === "accept"
//                   ? "Accept this request?"
//                   : "Decline this request?"}
//               </h3>

//               <p className="text-sm text-gray-500 mb-6">
//                 {confirmationType === "accept"
//                   ? "You are about to accept this mentoring session request. This will notify the student and start a chat session."
//                   : "You are about to decline this mentoring session request. The student will be notified that you're unavailable."}
//               </p>

//               <div className="flex justify-center space-x-4">
//                 <button
//                   onClick={closeConfirmation}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmAction}
//                   className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//                     confirmationType === "accept"
//                       ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
//                       : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
//                   }`}
//                 >
//                   {confirmationType === "accept"
//                     ? "Yes, Accept"
//                     : "Yes, Decline"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

//current shit

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Mentor Dashboard
          </h1>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <span className="mr-2 text-gray-700">Status:</span>
              <span
                className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${
                  isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isAvailable ? "Available" : "Not Available"}
              </span>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition shadow-sm"
            >
              {loading ? "Updating..." : "Toggle Availability"}
            </button>
          </div>
        </div>

        {/* Students You Can Chat With */}
        <div className="mb-12 bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Students You Can Chat With
          </h2>
          {acceptedStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {acceptedStudents.map((student) => (
                <div
                  key={student._id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {student.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {student.username}
                      </h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => startChat(student)}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:brightness-110 transition shadow"
                  >
                    Chat with {student.username}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>
                No accepted students yet. Accept mentorship requests to start
                chatting.
              </p>
            </div>
          )}
        </div>

        {/* Pending Requests Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Pending Mentorship Requests
          </h2>
          {requests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                      {request.student?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.student?.username || "Student"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request.student?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2">
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
            <div className="text-center py-8 text-gray-500">
              <p>No pending requests at this time.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog*/}
      {confirmationVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg text-center">
            <p className="text-lg font-medium text-gray-800 mb-4">
              Are you sure you want to {confirmationType} this request?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Confirm
              </button>
              <button
                onClick={closeConfirmation}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
