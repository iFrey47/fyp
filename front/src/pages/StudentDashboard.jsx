import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "student") {
      navigate("/unauthorized");
    }
  }, [role, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <h1 className="text-3xl font-semibold">Welcome to Student Dashboard</h1>
    </div>
  );
}
