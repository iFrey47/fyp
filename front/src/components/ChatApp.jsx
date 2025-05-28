import { useState, useEffect } from "react";
import ChatInterface from "./ChatInterface";

const ChatApp = ({ currentUser, userType, initialSelectedContact }) => {
  console.log("Current user prop:", currentUser);
  console.log("Initial contact prop:", initialSelectedContact);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  // Set up contacts list with the initial selected contact
  useEffect(() => {
    if (initialSelectedContact) {
      const newContact = {
        id: `contact-${Date.now()}`,
        name: initialSelectedContact,
        lastMessage: "Start chatting",
        unread: 0,
        isOnline: true,
      };

      setContacts([newContact]);
      setSelectedContact(newContact);

      console.log("Chat initialized with:", initialSelectedContact);
    }
  }, [initialSelectedContact]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1f1c2c] via-[#302b63] to-[#24243e] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-[#1e1e2f] border-r border-gray-700 flex flex-col">
        <div className="p-5 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-2xl font-semibold text-purple-300">Messages</h1>
          <p className="text-sm text-gray-400">
            {userType === "mentor" ? "Your Students" : "Your Mentors"}
          </p>
        </div>

        {/* Contacts */}
        <div className="overflow-y-auto flex-1">
          {contacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b border-gray-800 hover:bg-[#2c2f4a] cursor-pointer transition ${
                  selectedContact?.id === contact.id ? "bg-[#393a60]" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e2f]"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white">{contact.name}</h3>
                      {contact.unread > 0 && (
                        <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        {selectedContact ? (
          <ChatInterface
            currentUser={currentUser}
            recipientUser={selectedContact.name}
            userType={userType}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-[#2e2d3e]">
            <div className="text-center">
              <div className="text-gray-500 text-6xl mb-4">💬</div>
              <h2 className="text-xl font-medium text-white">
                {contacts.length === 0
                  ? "No chats available"
                  : "Select a conversation"}
              </h2>
              <p className="text-gray-400 mt-2">
                {contacts.length === 0
                  ? "Start a new chat from the dashboard"
                  : "Choose a contact to begin chatting"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatApp;
