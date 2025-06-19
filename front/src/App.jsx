import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/Signup";
import SignIn from "./pages/Signin";
import StudentDashboard from "./pages/StudentDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/ProfilePage";
import ProfileButton from "./components/ProfileButton";
import DashboardButton from "./components/DashoardButton";
import ChatPage from "./pages/ChatPage";
import AddFypIdea from "./pages/AddFypIdea";
import { Navigate } from "react-router-dom";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";

function App() {
  return (
    <>
      <ProfileButton /> {/* Profile button for authenticated users */}
      <DashboardButton />{" "}
      {/* Dashboard button, appears only on dashboard pages or profile page */}
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up" replace />} />

        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
                "supervisor",
                "mentor",
                "admin",
                "coordinator",
              ]}
            />
          }
        >
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        {/* effing around */}
        {/* <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route> */}

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/add-fyp-idea" element={<AddFypIdea />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["supervisor"]} />}>
          <Route
            path="/supervisor-dashboard"
            element={<SupervisorDashboard />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
          <Route
            path="/coordinator-dashboard"
            element={<CoordinatorDashboard />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
