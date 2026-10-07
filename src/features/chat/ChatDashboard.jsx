import { useState, useEffect } from "react";
import styles from "./ChatDashboard.module.css";
import { chatService } from "../../services/chatService";
import { profileService } from "../../services/profileService";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ContactList from "./ContactList";
import MessageThread from "./MessageThread";
import MessageInput from "./MessageInput";

export default function ChatDashboard({ currentUser, onLogout }) {
  const [users] = useState(() => profileService.getAllUsers());
  const [contacts, setContacts] = useState(() =>
    profileService.getContacts(currentUser.id)
  );
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleAddContact = (contactId) => {
    setContacts(profileService.addContact(currentUser.id, contactId));
  };

  const handleRemoveContact = (contactId) => {
    setContacts(profileService.removeContact(currentUser.id, contactId));
    if (activeContact?.id === contactId) {
      setActiveContact(null);
    }
  };

    useEffect(() => {
  if (activeContact) {
    const loadedMessages = chatService.getMessages(currentUser.id, activeContact.id);
    setMessages(loadedMessages);
  } else {
    setMessages([]);
  }
}, [activeContact]);

  const handleSendMessage = (messageText) => {
    if (!activeContact || !messageText.trim()) {
      return;
    }

    const newMessage = chatService.sendMessage(
      currentUser.id,
      activeContact.id,
      messageText.trim()
    );

    setMessages((previousMessages) => [...previousMessages, newMessage]);
  };



  return (
    <div className={styles.layoutContainer}>
      <Navbar
        currentUser={currentUser}
        users={users}
        contacts={contacts}
        onAddContact={handleAddContact}
        onRemoveContact={handleRemoveContact}
        activeContact={activeContact}
        onSelectContact={setActiveContact}
        onLogout={onLogout}
      />

      <div className={styles.mainContent}>
        <ContactList
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={setActiveContact}
          onRemoveContact={handleRemoveContact}
        />

        <section className={styles.chatArea}>
          <MessageThread
            activeContact={activeContact}
            messages={messages}
            currentUser={currentUser}
          />
          <MessageInput
            activeContact={activeContact}
            onSendMessage={handleSendMessage}
          />
        </section>
      </div>

      <Footer />
    </div>
  );
}
