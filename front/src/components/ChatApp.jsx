import { useState, useEffect } from "react";
import ChatInterface from "./ChatInterface";

const ChatApp = ({ currentUser, userType, initialSelectedContact }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  // Load real contacts instead of demo data
  useEffect(() => {
    const loadContacts = async () => {
      // If we have an initialSelectedContact, make sure it's in our contact list
      if (initialSelectedContact) {
        // This should be the mentor the student clicked on
        const newContact = {
          id: `contact-${Date.now()}`, // Generate a temporary ID
          name: initialSelectedContact,
          lastMessage: "Start chatting now",
          unread: 0,
        };

        setContacts((prevContacts) => {
          // Check if this contact already exists
          const exists = prevContacts.some(
            (c) => c.name === initialSelectedContact
          );
          if (!exists) {
            // Add this new contact to the list
            return [...prevContacts, newContact];
          }
          return prevContacts;
        });

        // Select this contact
        setSelectedContact(newContact);
      } else {
        // Load basic contacts based on user type if no initialSelectedContact
        if (userType === "mentor") {
          setContacts([
            {
              id: 1,
              name: "Student1",
              lastMessage: "I need help with React hooks",
              unread: 0,
            },
            {
              id: 2,
              name: "Student2",
              lastMessage: "When can we schedule the next session?",
              unread: 0,
            },
          ]);
        } else {
          setContacts([
            {
              id: 1,
              name: "Mentor1",
              lastMessage: "Let me know if you have any questions",
              unread: 0,
            },
          ]);
        }
      }
    };

    loadContacts();
  }, [userType, initialSelectedContact]);

  // The rest of the component remains the same...

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="font-semibold text-xl">Messages</h1>
          <p className="text-gray-600 text-sm">
            {userType === "mentor" ? "Your Students" : "Your Mentors"}
          </p>
        </div>

        {/* Contact list */}
        <div className="overflow-y-auto h-full pb-20">
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
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {contact.name.charAt(0).toUpperCase()}
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
      <div className="flex-1">
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
                Select a conversation
              </h2>
              <p className="text-gray-500 mt-2">
                Choose from your contacts to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
