import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const ChatInterface = ({ currentUser, recipientUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef();
  const messagesEndRef = useRef(null);

  // Create a unique chat ID for localStorage (sorted to ensure consistency)
  const chatId = [currentUser, recipientUser].sort().join("-");

  // Load saved messages when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat-messages-${chatId}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        console.log(
          `Loaded ${parsedMessages.length} messages for chat ${chatId}`
        );
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
  }, [chatId]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat-messages-${chatId}`, JSON.stringify(messages));
    }
  }, [messages, chatId]);

  // Socket connection and message handling
  useEffect(() => {
    console.log("[Chat Setup] Current user:", currentUser);
    console.log("[Chat Setup] Recipient user:", recipientUser);
    // Initialize socket connection
    socket.current = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });

    console.log("Registering with username:", currentUser);
    // Register user with socket server
    socket.current.emit("register", currentUser);
    console.log("Socket registering with:", currentUser); // Should be "iamstudent"

    console.log("Socket registered with username:", currentUser); // Verify real username

    console.log(`User registered: ${currentUser}`);

    // Message reception handler
    const handleMessage = (data) => {
      // Only add if message is for current chat
      if (data.from === recipientUser || data.from === currentUser) {
        setMessages((prev) => [
          ...prev,
          {
            from: data.from,
            message: data.message,
            isMine: data.from === currentUser,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    // Set up event listeners
    socket.current.on("receive_message", handleMessage);
    socket.current.on("connect_error", (err) =>
      console.error("Connection error:", err)
    );

    // Cleanup function
    return () => {
      socket.current.off("receive_message", handleMessage);
      socket.current.disconnect();
    };
  }, [currentUser, recipientUser]); // Add recipientUser to dependencies

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Debug: Verify usernames before sending
    console.log("[Message Send] Current user:", currentUser);
    console.log("[Message Send] Recipient user:", recipientUser);

    // Create message object
    const newMessage = {
      from: currentUser,
      message: message.trim(),
      isMine: true,
      timestamp: new Date().toISOString(),
    };

    // Update UI immediately
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Send via socket
    socket.current.emit("send_message", {
      from: currentUser,
      to: recipientUser, // This must match the exact recipient username
      message: message.trim(),
    });
  };
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
            {recipientUser.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h2 className="font-medium text-gray-800">{recipientUser}</h2>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    msg.isMine
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      msg.isMine ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
