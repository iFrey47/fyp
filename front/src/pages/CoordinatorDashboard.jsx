import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "coordinator") {
      navigate("/unauthorized");
    }
  }, [role, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100">
      <h1 className="text-3xl font-semibold">
        Welcome to Coordinator Dashboard
      </h1>
    </div>
  );
}
