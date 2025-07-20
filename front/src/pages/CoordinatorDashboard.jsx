// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Users,
//   UserCheck,
//   Plus,
//   CheckCircle,
//   AlertCircle,
//   Calendar,
//   Clock,
//   X,
//   GraduationCap,
//   UserPlus,
//   CalendarDays,
//   Settings,
//   ChevronRight,
//   Search,
//   Filter,
//   BookOpen,
//   User,
//   Mail,
//   Award,
//   Target,
//   TrendingUp,
//   Activity,
// } from "lucide-react";

// export default function CoordinatorDashboard() {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");
//   const [students, setStudents] = useState([]);
//   const [supervisors, setSupervisors] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [selectedSupervisor, setSelectedSupervisor] = useState("");
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [meetingDate, setMeetingDate] = useState("");
//   const [meetingTime, setMeetingTime] = useState("");
//   const [meetingTitle, setMeetingTitle] = useState("");
//   const [meetingDescription, setMeetingDescription] = useState("");
//   const [panelMembers, setPanelMembers] = useState([]);
//   const [scheduledMeetings, setScheduledMeetings] = useState([]);
//   const [activeTab, setActiveTab] = useState("assignments");

//   const fetchData = async () => {
//     const token = localStorage.getItem("token");

//     try {
//       const studentsRes = await fetch(
//         "http://localhost:5000/api/auth/students/all",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const studentsData = await studentsRes.json();

//       const supervisorsRes = await fetch(
//         "http://localhost:5000/api/auth/supervisors",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const supervisorsData = await supervisorsRes.json();

//       if (studentsData.success && supervisorsData.success) {
//         setStudents(studentsData.students);
//         setSupervisors(supervisorsData.supervisors);
//       } else {
//         throw new Error("Failed to fetch data");
//       }
//     } catch (err) {
//       setMessage({ text: err.message, type: "error" });
//     }
//   };

//   const handleAssign = async () => {
//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(
//         "http://localhost:5000/api/auth/assign-supervisor",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             studentId: selectedStudent,
//             supervisorId: selectedSupervisor,
//           }),
//         },
//       );

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Assignment failed");

//       setMessage({ text: "Assignment successful!", type: "success" });
//       fetchData();
//       setSelectedStudent("");
//       setSelectedSupervisor("");
//     } catch (err) {
//       setMessage({ text: err.message, type: "error" });
//     }
//   };

//   const handleScheduleMeeting = async () => {
//     const token = localStorage.getItem("token");

//     try {
//       const meetingData = {
//         students: selectedStudents,
//         date: meetingDate,
//         time: meetingTime,
//         title: meetingTitle,
//         description: meetingDescription,
//         panelMembers: panelMembers,
//       };

//       const res = await fetch("http://localhost:5000/api/meetings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(meetingData),
//       });

//       const data = await res.json();
//       if (!res.ok)
//         throw new Error(data.message || "Failed to schedule meeting");

//       setScheduledMeetings([...scheduledMeetings, data.meeting]);

//       setSelectedStudents([]);
//       setMeetingDate("");
//       setMeetingTime("");
//       setMeetingTitle("");
//       setMeetingDescription("");
//       setPanelMembers([]);

//       setMessage({ text: "Meeting scheduled successfully!", type: "success" });
//     } catch (err) {
//       setMessage({ text: err.message, type: "error" });
//     }
//   };

//   const handleCancelMeeting = async (meetingId) => {
//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/meetings/${meetingId}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!res.ok) throw new Error("Failed to cancel meeting");

//       setScheduledMeetings(scheduledMeetings.filter((m) => m.id !== meetingId));

//       setMessage({ text: "Meeting cancelled successfully", type: "success" });
//     } catch (err) {
//       setMessage({ text: err.message, type: "error" });
//     }
//   };

//   const fetchMeetings = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:5000/api/meetings", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data.success) setScheduledMeetings(data.meetings);
//     } catch (err) {
//       console.error("Error fetching meetings:", err);
//     }
//   };

//   useEffect(() => {
//     if (role !== "coordinator") navigate("/unauthorized");
//     fetchData();
//     fetchMeetings();
//   }, [role, navigate]);

//   const assignedStudents = students.filter((s) => s.supervisorId);
//   const unassignedStudents = students.filter((s) => !s.supervisorId);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c]">
//       {/* Enhanced Header */}
//       <div className="bg-[#22223a] border border-[#2e2e4d] sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
//                 <UserCheck className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">
//                   Coordinator Dashboard
//                 </h1>
//                 <p className="text-slate-400">
//                   Manage assignments and schedule meetings
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
//                 <Settings className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Enhanced Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-sm font-medium">
//                   Total Students
//                 </p>
//                 <p className="text-3xl font-bold text-white mt-1">
//                   {students.length}
//                 </p>
//                 <p className="text-xs text-slate-500 mt-1">Registered users</p>
//               </div>
//               <div className="bg-blue-500/20 p-3 rounded-xl">
//                 <Users className="w-6 h-6 text-blue-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-sm font-medium">Assigned</p>
//                 <p className="text-3xl font-bold text-white mt-1">
//                   {assignedStudents.length}
//                 </p>
//                 <p className="text-xs text-slate-500 mt-1">With supervisors</p>
//               </div>
//               <div className="bg-green-500/20 p-3 rounded-xl">
//                 <CheckCircle className="w-6 h-6 text-green-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-sm font-medium">Pending</p>
//                 <p className="text-3xl font-bold text-white mt-1">
//                   {unassignedStudents.length}
//                 </p>
//                 <p className="text-xs text-slate-500 mt-1">
//                   Awaiting assignment
//                 </p>
//               </div>
//               <div className="bg-orange-500/20 p-3 rounded-xl">
//                 <Clock className="w-6 h-6 text-orange-400" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-slate-400 text-sm font-medium">Meetings</p>
//                 <p className="text-3xl font-bold text-white mt-1">
//                   {scheduledMeetings.length}
//                 </p>
//                 <p className="text-xs text-slate-500 mt-1">Scheduled</p>
//               </div>
//               <div className="bg-purple-500/20 p-3 rounded-xl">
//                 <Calendar className="w-6 h-6 text-purple-400" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-2 mb-8 border border-slate-700/50">
//           <div className="flex space-x-2">
//             <button
//               onClick={() => setActiveTab("assignments")}
//               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
//                 activeTab === "assignments"
//                   ? "bg-blue-600 text-white shadow-lg"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <UserPlus className="w-4 h-4" />
//               Assignments
//             </button>
//             <button
//               onClick={() => setActiveTab("meetings")}
//               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
//                 activeTab === "meetings"
//                   ? "bg-purple-600 text-white shadow-lg"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <CalendarDays className="w-4 h-4" />
//               Meetings
//             </button>
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
//                 activeTab === "overview"
//                   ? "bg-green-600 text-white shadow-lg"
//                   : "text-slate-400 hover:text-white hover:bg-slate-700/50"
//               }`}
//             >
//               <Activity className="w-4 h-4" />
//               Overview
//             </button>
//           </div>
//         </div>

//         {/* Message Display */}
//         {message.text && (
//           <div
//             className={`mb-6 p-4 rounded-2xl border-l-4 backdrop-blur-md ${
//               message.type === "success"
//                 ? "bg-green-900/30 border-green-500 text-green-100"
//                 : "bg-red-900/30 border-red-500 text-red-100"
//             }`}
//           >
//             <div className="flex items-center gap-2">
//               {message.type === "success" ? (
//                 <CheckCircle className="w-5 h-5 text-green-400" />
//               ) : (
//                 <AlertCircle className="w-5 h-5 text-red-400" />
//               )}
//               <span className="font-medium">{message.text}</span>
//             </div>
//           </div>
//         )}

//         {/* Tab Content */}
//         {activeTab === "assignments" && (
//           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//             {/* Assignment Panel */}
//             <div className="xl:col-span-1">
//               <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
//                 <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
//                   <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                     <Plus className="w-5 h-5" />
//                     New Assignment
//                   </h2>
//                 </div>

//                 <div className="p-6 space-y-6">
//                   <div>
//                     <label className="block text-blue-200 text-sm font-medium mb-3">
//                       Select Student
//                     </label>
//                     <select
//                       className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//                       value={selectedStudent}
//                       onChange={(e) => setSelectedStudent(e.target.value)}
//                     >
//                       <option value="">Choose a student</option>
//                       {students.map((student) => (
//                         <option key={student._id} value={student._id}>
//                           {student.username} ({student.email})
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-blue-200 text-sm font-medium mb-3">
//                       Select Supervisor
//                     </label>
//                     <select
//                       className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//                       value={selectedSupervisor}
//                       onChange={(e) => setSelectedSupervisor(e.target.value)}
//                     >
//                       <option value="">Choose a supervisor</option>
//                       {supervisors.map((supervisor) => (
//                         <option key={supervisor._id} value={supervisor._id}>
//                           {supervisor.username} ({supervisor.email})
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <button
//                     onClick={handleAssign}
//                     disabled={!selectedStudent || !selectedSupervisor}
//                     className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
//                   >
//                     <UserCheck className="w-4 h-4" />
//                     Create Assignment
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Current Assignments Table */}
//             <div className="xl:col-span-2">
//               <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
//                 <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-700/50">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
//                       <Users className="w-5 h-5" />
//                       Current Assignments
//                     </h2>
//                     <div className="flex items-center gap-2">
//                       <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
//                         <Search className="w-4 h-4" />
//                       </button>
//                       <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
//                         <Filter className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                   {assignedStudents.length === 0 ? (
//                     <div className="p-12 text-center">
//                       <div className="bg-slate-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
//                         <Users className="w-10 h-10 text-slate-400" />
//                       </div>
//                       <h3 className="text-lg font-medium text-slate-300 mb-2">
//                         No assignments yet
//                       </h3>
//                       <p className="text-slate-500">
//                         Start by creating your first student-supervisor
//                         assignment
//                       </p>
//                     </div>
//                   ) : (
//                     <table className="w-full">
//                       <thead className="bg-slate-700/30">
//                         <tr>
//                           <th className="text-left p-6 text-blue-200 font-medium">
//                             Student
//                           </th>
//                           <th className="text-left p-6 text-blue-200 font-medium">
//                             Email
//                           </th>
//                           <th className="text-left p-6 text-blue-200 font-medium">
//                             Supervisor
//                           </th>
//                           <th className="text-left p-6 text-blue-200 font-medium">
//                             Status
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-700/50">
//                         {assignedStudents.map((student) => (
//                           <tr
//                             key={student._id}
//                             className="hover:bg-slate-700/30 transition-colors"
//                           >
//                             <td className="p-6">
//                               <div className="flex items-center gap-3">
//                                 <div className="bg-blue-500/20 p-2 rounded-lg">
//                                   <User className="w-4 h-4 text-blue-400" />
//                                 </div>
//                                 <div className="font-medium text-white">
//                                   {student.username}
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="p-6">
//                               <div className="flex items-center gap-2 text-slate-300">
//                                 <Mail className="w-4 h-4 text-slate-400" />
//                                 {student.email}
//                               </div>
//                             </td>
//                             <td className="p-6">
//                               <div className="flex items-center gap-2 text-blue-300 font-medium">
//                                 <Award className="w-4 h-4 text-blue-400" />
//                                 {student.supervisorId?.username || "Unknown"}
//                               </div>
//                             </td>
//                             <td className="p-6">
//                               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800">
//                                 <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
//                                 Assigned
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "meetings" && (
//           <div className="space-y-8">
//             {/* Meeting Scheduling Panel */}
//             <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
//               <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
//                 <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                   <Calendar className="w-5 h-5" />
//                   Schedule Panel Meeting
//                 </h2>
//               </div>

//               <div className="p-6 space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-purple-200 text-sm font-medium mb-3">
//                       Select Students
//                     </label>
//                     <select
//                       multiple
//                       className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white h-[120px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                       onChange={(e) => {
//                         const selected = Array.from(
//                           e.target.selectedOptions,
//                         ).map((option) => option.value);
//                         setSelectedStudents(selected);
//                       }}
//                     >
//                       {students.map((student) => (
//                         <option key={student._id} value={student._id}>
//                           {student.username} ({student.email})
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-purple-200 text-sm font-medium mb-3">
//                       Members
//                     </label>
//                     <select
//                       multiple
//                       className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white h-[120px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                       onChange={(e) => {
//                         const selected = Array.from(
//                           e.target.selectedOptions,
//                         ).map((option) => option.value);
//                         setPanelMembers(selected);
//                       }}
//                     >
//                       {supervisors.map((supervisor) => (
//                         <option key={supervisor._id} value={supervisor._id}>
//                           {supervisor.username} ({supervisor.email})
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-purple-200 text-sm font-medium mb-3">
//                       Meeting Date
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                       value={meetingDate}
//                       onChange={(e) => setMeetingDate(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-purple-200 text-sm font-medium mb-3">
//                       Meeting Time
//                     </label>
//                     <input
//                       type="time"
//                       className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                       value={meetingTime}
//                       onChange={(e) => setMeetingTime(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-purple-200 text-sm font-medium mb-3">
//                     Meeting Title
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                     placeholder="Project Proposal Review"
//                     value={meetingTitle}
//                     onChange={(e) => setMeetingTitle(e.target.value)}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-purple-200 text-sm font-medium mb-3">
//                     Description
//                   </label>
//                   <textarea
//                     className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
//                     rows="3"
//                     placeholder="Meeting agenda and details..."
//                     value={meetingDescription}
//                     onChange={(e) => setMeetingDescription(e.target.value)}
//                   />
//                 </div>

//                 <button
//                   onClick={handleScheduleMeeting}
//                   disabled={
//                     !selectedStudents.length || !meetingDate || !meetingTime
//                   }
//                   className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
//                 >
//                   <Calendar className="w-4 h-4" />
//                   Schedule Meeting
//                 </button>
//               </div>
//             </div>

//             {/* Scheduled Meetings */}
//             <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
//               <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
//                 <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                   <Clock className="w-5 h-5" />
//                   Upcoming Meetings
//                 </h2>
//               </div>

//               <div className="p-6">
//                 {scheduledMeetings.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="bg-slate-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
//                       <Calendar className="w-10 h-10 text-slate-400" />
//                     </div>
//                     <h3 className="text-lg font-medium text-slate-300 mb-2">
//                       No meetings scheduled yet
//                     </h3>
//                     <p className="text-slate-500">
//                       Schedule your first panel meeting above
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {scheduledMeetings.map((meeting) => (
//                       <div
//                         key={meeting.id}
//                         className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-all"
//                       >
//                         <div className="flex justify-between items-start mb-4">
//                           <div>
//                             <h3 className="font-semibold text-white text-lg flex items-center gap-2">
//                               <BookOpen className="w-5 h-5 text-indigo-400" />
//                               {meeting.title}
//                             </h3>
//                             <p className="text-slate-300 mt-1">
//                               {meeting.description}
//                             </p>
//                           </div>
//                           <button
//                             onClick={() => handleCancelMeeting(meeting.id)}
//                             className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
//                           >
//                             <X className="w-5 h-5" />
//                           </button>
//                         </div>

//                         <div className="flex items-center gap-6 text-sm mb-4">
//                           <span className="flex items-center gap-2 text-indigo-300 bg-indigo-900/20 px-3 py-1 rounded-lg">
//                             <Calendar className="w-4 h-4" />
//                             {new Date(meeting.date).toLocaleDateString()}
//                           </span>
//                           <span className="flex items-center gap-2 text-indigo-300 bg-indigo-900/20 px-3 py-1 rounded-lg">
//                             <Clock className="w-4 h-4" />
//                             {meeting.time}
//                           </span>
//                         </div>

//                         <div className="space-y-3">
//                           <div>
//                             <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
//                               Students
//                             </h4>
//                             <div className="flex flex-wrap gap-2">
//                               {meeting.students.map((studentId) => {
//                                 const student = students.find(
//                                   (s) => s._id === studentId,
//                                 );
//                                 return student ? (
//                                   <span
//                                     key={studentId}
//                                     className="flex items-center gap-1 text-xs bg-slate-600/50 px-3 py-1 rounded-lg text-slate-200"
//                                   >
//                                     <User className="w-3 h-3" />
//                                     {student.username}
//                                   </span>
//                                 ) : null;
//                               })}
//                             </div>
//                           </div>

//                           <div>
//                             <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
//                               Panel Members
//                             </h4>
//                             <div className="flex flex-wrap gap-2">
//                               {meeting.panelMembers.map((memberId) => {
//                                 const member = supervisors.find(
//                                   (s) => s._id === memberId,
//                                 );
//                                 return member ? (
//                                   <span
//                                     key={memberId}
//                                     className="flex items-center gap-1 text-xs bg-indigo-900/30 px-3 py-1 rounded-lg text-indigo-200"
//                                   >
//                                     <Award className="w-3 h-3" />
//                                     {member.username}
//                                   </span>
//                                 ) : null;
//                               })}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "overview" && (
//           <div className="space-y-8">
//             {/* Overview Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Students Overview */}
//               <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
//                 <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
//                   <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                     <GraduationCap className="w-5 h-5" />
//                     Students Overview
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-green-500/20 p-2 rounded-lg">
//                           <CheckCircle className="w-4 h-4 text-green-400" />
//                         </div>
//                         <span className="text-slate-300">
//                           Assigned Students
//                         </span>
//                       </div>
//                       <span className="text-2xl font-bold text-green-400">
//                         {assignedStudents.length}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-orange-500/20 p-2 rounded-lg">
//                           <Clock className="w-4 h-4 text-orange-400" />
//                         </div>
//                         <span className="text-slate-300">
//                           Unassigned Students
//                         </span>
//                       </div>
//                       <span className="text-2xl font-bold text-orange-400">
//                         {unassignedStudents.length}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-blue-500/20 p-2 rounded-lg">
//                           <TrendingUp className="w-4 h-4 text-blue-400" />
//                         </div>
//                         <span className="text-slate-300">Assignment Rate</span>
//                       </div>
//                       <span className="text-2xl font-bold text-blue-400">
//                         {students.length > 0
//                           ? Math.round(
//                               (assignedStudents.length / students.length) * 100,
//                             )
//                           : 0}
//                         %
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Supervisors Overview */}
//               <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
//                 <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
//                   <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                     <Target className="w-5 h-5" />
//                     Supervisors Overview
//                   </h2>
//                 </div>
//                 <div className="p-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-purple-500/20 p-2 rounded-lg">
//                           <Users className="w-4 h-4 text-purple-400" />
//                         </div>
//                         <span className="text-slate-300">
//                           Total Supervisors
//                         </span>
//                       </div>
//                       <span className="text-2xl font-bold text-purple-400">
//                         {supervisors.length}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-indigo-500/20 p-2 rounded-lg">
//                           <Calendar className="w-4 h-4 text-indigo-400" />
//                         </div>
//                         <span className="text-slate-300">
//                           Scheduled Meetings
//                         </span>
//                       </div>
//                       <span className="text-2xl font-bold text-indigo-400">
//                         {scheduledMeetings.length}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-cyan-500/20 p-2 rounded-lg">
//                           <Activity className="w-4 h-4 text-cyan-400" />
//                         </div>
//                         <span className="text-slate-300">
//                           Avg. Students per Supervisor
//                         </span>
//                       </div>
//                       <span className="text-2xl font-bold text-cyan-400">
//                         {supervisors.length > 0
//                           ? Math.round(
//                               (assignedStudents.length / supervisors.length) *
//                                 10,
//                             ) / 10
//                           : 0}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
//               <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
//                 <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                   <Activity className="w-5 h-5" />
//                   Quick Actions
//                 </h2>
//               </div>
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <button
//                     onClick={() => setActiveTab("assignments")}
//                     className="flex items-center gap-3 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-colors group"
//                   >
//                     <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500/30 transition-colors">
//                       <UserPlus className="w-5 h-5 text-blue-400" />
//                     </div>
//                     <div className="text-left">
//                       <h3 className="font-medium text-white">New Assignment</h3>
//                       <p className="text-sm text-slate-400">
//                         Assign students to supervisors
//                       </p>
//                     </div>
//                     <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
//                   </button>

//                   <button
//                     onClick={() => setActiveTab("meetings")}
//                     className="flex items-center gap-3 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-colors group"
//                   >
//                     <div className="bg-purple-500/20 p-3 rounded-lg group-hover:bg-purple-500/30 transition-colors">
//                       <Calendar className="w-5 h-5 text-purple-400" />
//                     </div>
//                     <div className="text-left">
//                       <h3 className="font-medium text-white">
//                         Schedule Meeting
//                       </h3>
//                       <p className="text-sm text-slate-400">
//                         Create panel meetings
//                       </p>
//                     </div>
//                     <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
//                   </button>

//                   <button className="flex items-center gap-3 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-colors group">
//                     <div className="bg-green-500/20 p-3 rounded-lg group-hover:bg-green-500/30 transition-colors">
//                       <Activity className="w-5 h-5 text-green-400" />
//                     </div>
//                     <div className="text-left">
//                       <h3 className="font-medium text-white">View Reports</h3>
//                       <p className="text-sm text-slate-400">System analytics</p>
//                     </div>
//                     <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Award,
} from "lucide-react";

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    try {
      const studentsRes = await fetch(
        "http://localhost:5000/api/auth/students/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const studentsData = await studentsRes.json();

      const supervisorsRes = await fetch(
        "http://localhost:5000/api/auth/supervisors",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const supervisorsData = await supervisorsRes.json();

      if (studentsData.success && supervisorsData.success) {
        setStudents(studentsData.students);
        setSupervisors(supervisorsData.supervisors);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const handleAssign = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/assign-supervisor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: selectedStudent,
            supervisorId: selectedSupervisor,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Assignment failed");

      setMessage({ text: "Assignment successful!", type: "success" });
      fetchData();
      setSelectedStudent("");
      setSelectedSupervisor("");
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  useEffect(() => {
    if (role !== "coordinator") navigate("/unauthorized");
    fetchData();
  }, [role, navigate]);

  const assignedStudents = students.filter((s) => s.supervisorId);
  const unassignedStudents = students.filter((s) => !s.supervisorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] to-[#1a1a3c]">
      {/* Header */}
      <div className="bg-[#22223a] border border-[#2e2e4d] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Coordinator Dashboard
                </h1>
                <p className="text-slate-400">Manage student assignments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {students.length}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Assigned</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {assignedStudents.length}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {unassignedStudents.length}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-2xl border-l-4 backdrop-blur-md ${
              message.type === "success"
                ? "bg-green-900/30 border-green-500 text-green-100"
                : "bg-red-900/30 border-red-500 text-red-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Assignment Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Assignment Panel */}
          <div className="xl:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  New Assignment
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-3">
                    Select Student
                  </label>
                  <select
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Choose a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.username} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-3">
                    Select Supervisor
                  </label>
                  <select
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={selectedSupervisor}
                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                  >
                    <option value="">Choose a supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor._id} value={supervisor._id}>
                        {supervisor.username} ({supervisor.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAssign}
                  disabled={!selectedStudent || !selectedSupervisor}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <UserCheck className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>
            </div>
          </div>

          {/* Current Assignments Table */}
          <div className="xl:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 border-b border-slate-700/50">
                <h2 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
                  Current Assignments
                </h2>
              </div>

              <div className="overflow-x-auto">
                {assignedStudents.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="bg-slate-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mb-2">
                      No assignments yet
                    </h3>
                    <p className="text-slate-500">
                      Start by creating your first student-supervisor assignment
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-700/30">
                      <tr>
                        <th className="text-left p-6 text-blue-200 font-medium">
                          Student
                        </th>
                        <th className="text-left p-6 text-blue-200 font-medium">
                          Email
                        </th>
                        <th className="text-left p-6 text-blue-200 font-medium">
                          Supervisor
                        </th>
                        <th className="text-left p-6 text-blue-200 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {assignedStudents.map((student) => (
                        <tr
                          key={student._id}
                          className="hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-500/20 p-2 rounded-lg">
                                <User className="w-4 h-4 text-blue-400" />
                              </div>
                              <div className="font-medium text-white">
                                {student.username}
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Mail className="w-4 h-4 text-slate-400" />
                              {student.email}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2 text-blue-300 font-medium">
                              <Award className="w-4 h-4 text-blue-400" />
                              {student.supervisorId?.username || "Unknown"}
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                              Assigned
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
