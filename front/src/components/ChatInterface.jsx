// import { useState, useEffect, useRef } from "react";
// import io from "socket.io-client";
// import VideoCall from "./VideoCall";

// const ChatInterface = ({ currentUser, recipientUser }) => {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const socket = useRef();
//   const messagesEndRef = useRef(null);
//   const [isInCall, setIsInCall] = useState(false);
//   const [incomingCall, setIncomingCall] = useState(false);
//   const [incomingCallData, setIncomingCallData] = useState(null);

//   const chatId = [currentUser, recipientUser].sort().join("-");

//   useEffect(() => {
//     const savedMessages = localStorage.getItem(`chat-messages-${chatId}`);
//     if (savedMessages) {
//       try {
//         const parsedMessages = JSON.parse(savedMessages);
//         setMessages(parsedMessages);
//         console.log(
//           `Loaded ${parsedMessages.length} messages for chat ${chatId}`
//         );
//       } catch (error) {
//         console.error("Error loading messages:", error);
//       }
//     }
//   }, [chatId]);

//   useEffect(() => {
//     if (messages.length > 0) {
//       localStorage.setItem(`chat-messages-${chatId}`, JSON.stringify(messages));
//     }
//   }, [messages, chatId]);

//   useEffect(() => {
//     console.log("[Chat Setup] Current user:", currentUser);
//     console.log("[Chat Setup] Recipient user:", recipientUser);

//     socket.current = io("http://localhost:5000", {
//       withCredentials: true,
//       transports: ["websocket"],
//       reconnectionAttempts: 3,
//     });

//     socket.current.emit("register", currentUser);
//     console.log("Socket registered with username:", currentUser);

//     const handleMessage = (data) => {
//       if (data.from === recipientUser || data.from === currentUser) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             from: data.from,
//             message: data.message,
//             isMine: data.from === currentUser,
//             timestamp: new Date().toISOString(),
//           },
//         ]);
//       }
//     };

//     const handleIncomingCall = (data) => {
//       console.log("Incoming call received:", data);
//       if (data.from === recipientUser) {
//         setIncomingCall(true);
//         setIncomingCallData(data);
//       }
//     };

//     socket.current.on("receive_message", handleMessage);
//     socket.current.on("call_incoming", handleIncomingCall);
//     socket.current.on("connect_error", (err) => {
//       console.error("Connection error:", err);
//     });

//     return () => {
//       socket.current.off("receive_message", handleMessage);
//       socket.current.off("call_incoming", handleIncomingCall);
//       socket.current.disconnect();
//     };
//   }, [currentUser, recipientUser]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;

//     const newMessage = {
//       from: currentUser,
//       message: message.trim(),
//       isMine: true,
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, newMessage]);
//     setMessage("");

//     socket.current.emit("send_message", {
//       from: currentUser,
//       to: recipientUser,
//       message: message.trim(),
//     });
//   };

//   const handleEndCall = () => {
//     setIsInCall(false);
//     setIncomingCall(false);
//     setIncomingCallData(null);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-[#2e2d3e] text-white overflow-hidden">
//       {/* Video Call Component Overlay */}
//       {isInCall && (
//         <VideoCall
//           currentUser={currentUser}
//           recipientUser={recipientUser}
//           onEndCall={handleEndCall}
//           incomingOffer={incomingCallData?.offer}
//         />
//       )}

//       {/* Header */}
//       <div className="bg-[#1e1e2f] border-b border-gray-700 p-4 shadow-sm flex-shrink-0">
//         <div className="flex items-center">
//           <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg">
//             {recipientUser.charAt(0).toUpperCase()}
//           </div>
//           <div className="ml-3">
//             <h2 className="font-medium">{recipientUser}</h2>
//           </div>
//         </div>
//       </div>

//       {/* Incoming Call Prompt */}
//       {incomingCall && !isInCall && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
//           <div className="bg-[#1e1e2f] p-6 rounded-lg text-white text-center">
//             <p className="mb-4 text-lg">{recipientUser} is calling you...</p>
//             <div className="flex justify-center space-x-4">
//               <button
//                 className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
//                 onClick={() => {
//                   setIsInCall(true);
//                   setIncomingCall(false);
//                 }}
//               >
//                 Accept
//               </button>
//               <button
//                 className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
//                 onClick={() => {
//                   setIncomingCall(false);
//                   setIncomingCallData(null);

//                   // Notify the caller that the call was declined
//                   socket.current.emit("call_end", { to: recipientUser });
//                 }}
//               >
//                 Decline
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Messages Display */}
//       <div
//         className="flex-1 p-4 overflow-y-auto"
//         style={{ overscrollBehavior: "contain" }}
//       >
//         <div className="space-y-4">
//           {messages.length === 0 ? (
//             <div className="flex justify-center items-center h-full text-gray-400">
//               <p>No messages yet. Start the conversation!</p>
//             </div>
//           ) : (
//             messages.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   msg.isMine ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
//                     msg.isMine
//                       ? "bg-purple-600 text-white rounded-br-none"
//                       : "bg-[#3a3b5a] text-gray-200 rounded-bl-none"
//                   }`}
//                 >
//                   <p>{msg.message}</p>
//                   <span
//                     className={`text-xs mt-1 block ${
//                       msg.isMine ? "text-purple-300" : "text-gray-400"
//                     }`}
//                   >
//                     {new Date(msg.timestamp).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                 </div>
//               </div>
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input + Call Button */}
//       <div className="bg-[#1e1e2f] border-t border-gray-700 p-4 flex-shrink-0">
//         <div className="flex justify-between mb-2">
//           <button
//             onClick={() => setIsInCall(true)}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
//           >
//             Start Video Call
//           </button>
//         </div>
//         <form onSubmit={sendMessage} className="flex">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type your message..."
//             className="flex-1 bg-[#3c3e5c] text-white border-none px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
//             autoFocus
//           />
//           <button
//             type="submit"
//             className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-r-lg transition"
//           >
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import VideoCall from "./VideoCall";

const ChatInterface = ({ currentUser, recipientUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef();
  const messagesEndRef = useRef(null);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

  const chatId = [currentUser, recipientUser].sort().join("-");

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

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat-messages-${chatId}`, JSON.stringify(messages));
    }
  }, [messages, chatId]);

  useEffect(() => {
    console.log("[Chat Setup] Current user:", currentUser);
    console.log("[Chat Setup] Recipient user:", recipientUser);

    socket.current = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });

    socket.current.emit("register", currentUser);
    console.log("Socket registered with username:", currentUser);

    const handleMessage = (data) => {
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

    const handleIncomingCall = (data) => {
      console.log("Incoming call received:", data);
      if (data.from === recipientUser) {
        setIncomingCall(true);
        setIncomingCallData(data);
      }
    };

    socket.current.on("receive_message", handleMessage);
    socket.current.on("call_incoming", handleIncomingCall);
    socket.current.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    return () => {
      socket.current.off("receive_message", handleMessage);
      socket.current.off("call_incoming", handleIncomingCall);
      socket.current.disconnect();
    };
  }, [currentUser, recipientUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      from: currentUser,
      message: message.trim(),
      isMine: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    socket.current.emit("send_message", {
      from: currentUser,
      to: recipientUser,
      message: message.trim(),
    });
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setIncomingCall(false);
    setIncomingCallData(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#2e2d3e] text-white overflow-hidden">
      {/* Video Call Component Overlay */}
      {isInCall && (
        <VideoCall
          currentUser={currentUser}
          recipientUser={recipientUser}
          onEndCall={handleEndCall}
          incomingOffer={incomingCallData?.offer}
        />
      )}

      {/* Header */}
      <div className="bg-[#1e1e2f] border-b border-gray-700 p-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsInCall(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
              <span className="hidden sm:inline">Video Call</span>
            </button>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg">
                {recipientUser.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <h2 className="font-medium">{recipientUser}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Call Prompt */}
      {incomingCall && !isInCall && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1e1e2f] p-6 rounded-lg text-white text-center">
            <p className="mb-4 text-lg">{recipientUser} is calling you...</p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                onClick={() => {
                  setIsInCall(true);
                  setIncomingCall(false);
                }}
              >
                Accept
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                onClick={() => {
                  setIncomingCall(false);
                  setIncomingCallData(null);

                  // Notify the caller that the call was declined
                  socket.current.emit("call_end", { to: recipientUser });
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* msgs display */}
      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
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
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-[#3a3b5a] text-gray-200 rounded-bl-none"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      msg.isMine ? "text-purple-300" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
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

      {/* Input Area */}
      <div className="bg-[#1e1e2f] border-t border-gray-700 p-4 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#3c3e5c] text-white border-none px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            autoFocus
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-r-lg transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
