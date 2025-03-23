import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "mentor") {
      navigate("/unauthorized");
    }
  }, [role, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      <h1 className="text-3xl font-semibold">Welcome to Mentor Dashboard</h1>
    </div>
  );
}
