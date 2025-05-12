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
        name: initialSelectedContact, // Make sure this is the actual username
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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col overflow-hidden">
        <div className="p-4 border-b flex-shrink-0">
          <h1 className="font-semibold text-xl">Messages</h1>
          <p className="text-gray-600 text-sm">
            {userType === "mentor" ? "Your Students" : "Your Mentors"}
          </p>
        </div>

        {/* Contact list with proper overflow handling */}
        <div className="overflow-y-auto flex-1">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  selectedContact?.id === contact.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{contact.name}</h3>
                      {contact.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
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
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h2 className="text-xl font-medium text-gray-700">
                {contacts.length === 0
                  ? "No chats available"
                  : "Select a conversation"}
              </h2>
              <p className="text-gray-500 mt-2">
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
