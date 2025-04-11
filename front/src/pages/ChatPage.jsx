import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatApp from "../components/ChatApp";

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const recipientUser = location.state?.recipientUser;

  // const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // consst token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      console.log("Loaded user :", userData);
    }

    // If we didn't find user in authData, check other locations
    // const storedUser = localStorage.getItem("user");

    // if (storedUser) {
    //   try {
    //     const parsedUser = JSON.parse(storedUser);
    //     setUser(parsedUser);
    //     console.log("User authenticated from user data:", parsedUser);
    //     return;
    //   } catch (error) {
    //     console.error("Error parsing user data:", error);
    //   }
    // }

    // If we have a token but no user, try to get user from JWT payload
    // if (token) {
    //   try {
    //     // Extract user info from token if possible (simplified approach)
    //     const tokenPayload = token.split(".")[1];
    //     const decodedPayload = JSON.parse(atob(tokenPayload));

    //     if (decodedPayload.role) {
    //       // If we have role in token, create minimal user object
    //       setUser({
    //         username: decodedPayload.name || "User",
    //         role: decodedPayload.role,
    //       });
    //       console.log("User created from token payload");
    //       return;
    //     }
    //   } catch (error) {
    //     console.error("Error extracting user from token:", error);
    //   }
    // }

    // Check if we're coming from a page that provided user details
    if (location.state?.user) {
      setUser(location.state.user);
      console.log("User from navigation state:", location.state.user);
      return;
    }

    // Only redirect if all attempts failed
    // console.log("Authentication failed, redirecting to sign-in");
    // navigate("/sign-in");
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
