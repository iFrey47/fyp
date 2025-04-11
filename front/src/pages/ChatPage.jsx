import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatApp from "../components/ChatApp";

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const recipientUser = location.state?.recipientUser;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      console.log("Loaded user :", userData);
    }

    // Check if we're coming from a page that provided user details
    if (location.state?.user) {
      setUser(location.state.user);
      console.log("User from navigation state:", location.state.user);
      return;
    }
  }, [navigate, location.state]);

  // Loading state
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatApp
        currentUser={user.username}
        userType={user.role || "student"}
        initialSelectedContact={recipientUser}
      />
    </div>
  );
};

export default ChatPage;
