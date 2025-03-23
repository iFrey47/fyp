import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "supervisor") {
      navigate("/unauthorized");
    }
  }, [role, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <h1 className="text-3xl font-semibold">
        Welcome to Supervisor Dashboard
      </h1>
    </div>
  );
}
