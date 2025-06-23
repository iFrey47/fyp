import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Plus, CheckCircle, AlertCircle } from "lucide-react";

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
      // Fetch ALL students (assigned + unassigned)
      const studentsRes = await fetch(
        "http://localhost:5000/api/auth/students/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const studentsData = await studentsRes.json();

      // Fetch supervisors
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

  // Handle supervisor assignment
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
  // const unassignedStudents = students.filter((s) => !s.supervisorId);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-3">
            <UserCheck className="w-8 h-8" />
            Coordinator Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Manage student-supervisor assignments
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {students.length}
                </p>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Assigned</p>
                <p className="text-2xl font-bold text-green-400">
                  {assignedStudents.length}
                </p>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          {/* <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Unassigned</p>
                <p className="text-2xl font-bold text-yellow-400">{unassignedStudents.length}</p>
              </div>
              <div className="bg-yellow-900/30 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div> */}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Assignment Panel */}
          <div className="xl:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Assignment
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-3">
                    Select Student
                  </label>
                  <select
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Create Assignment
                </button>

                {message.text && (
                  <div
                    className={`p-4 rounded-lg border-l-4 ${
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
              </div>
            </div>
          </div>

          {/* Current Assignments Table */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Current Assignments
                </h2>
              </div>

              <div className="overflow-x-auto">
                {assignedStudents.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No assignments yet
                    </h3>
                    <p className="text-gray-500">
                      Start by creating your first student-supervisor assignment
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
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
                    <tbody className="divide-y divide-gray-700">
                      {assignedStudents.map((student) => (
                        <tr
                          key={student._id}
                          className="hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="p-6">
                            <div className="font-medium text-white">
                              {student.username}
                            </div>
                          </td>
                          <td className="p-6 text-gray-300">{student.email}</td>
                          <td className="p-6">
                            <div className="text-blue-300 font-medium">
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
