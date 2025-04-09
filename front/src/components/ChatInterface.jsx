import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const ChatInterface = ({ currentUser, recipientUser, userType }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const socket = useRef();
  const messagesEndRef = useRef(null);

  // Create a unique chat ID to store messages for this conversation
  const chatId = [currentUser, recipientUser].sort().join("-");

  // Load saved messages when component mounts
  useEffect(() => {
    const loadSavedMessages = () => {
      const savedMessages = localStorage.getItem(`chat-messages-${chatId}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
          console.log(
            `Loaded ${parsedMessages.length} saved messages for chat ${chatId}`
          );
        } catch (error) {
          console.error("Error loading saved messages:", error);
        }
      }
    };

    loadSavedMessages();
  }, [chatId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat-messages-${chatId}`, JSON.stringify(messages));
    }
  }, [messages, chatId]);

  useEffect(() => {
    // Connect to socket server
    socket.current = io("http://localhost:5000");

    // Register user with socket
    socket.current.emit("register", currentUser);
    console.log(`Registered as ${currentUser} in socket`);

    // Listen for incoming messages
    socket.current.on("receive_message", (data) => {
      console.log("Received message:", data);
      const newMessage = {
        from: data.from,
        message: data.message,
        isMine: false,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      socket.current.disconnect();
    };
  }, [currentUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate checking if recipient is online
  useEffect(() => {
    // In a real app, you'd get this from the server
    const checkOnlineStatus = async () => {
      // This simulates a server check - replace with real implementation
      setIsOnline(true);
    };

    checkOnlineStatus();

    // Log that we're in a chat with this recipient
    console.log(`Chat initialized with ${recipientUser} as a ${userType}`);
  }, [recipientUser, userType]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (message.trim()) {
      // Create the message object
      const newMessage = { from: currentUser, message, isMine: true };

      // Add message to local state
      setMessages((prev) => [...prev, newMessage]);

      // Send message via socket
      socket.current.emit("send_message", {
        from: currentUser,
        to: recipientUser,
        message,
      });

      console.log(`Sent message to ${recipientUser}: ${message}`);

      // Clear input
      setMessage("");
    }
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
            <div className="flex items-center text-sm text-gray-500">
              <span
                className={`w-2 h-2 rounded-full mr-1 ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
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
