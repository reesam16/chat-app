import { useEffect, useState } from "react";
import styles from "./ChatDashboard.module.css";
import { chatService } from "../../services/chatService";
import { profileService } from "../../services/profileService";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ContactList from "./ContactList";
import MessageThread from "./MessageThread";
import MessageInput from "./MessageInput";

const mergeMessages = (existing, incoming) => {
  const byId = new Map(existing.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort(
    (first, second) => new Date(first.createdAt) - new Date(second.createdAt)
  );
};

export default function ChatDashboard({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [thread, setThread] = useState({ conversationId: null, messages: [] });
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      profileService.getAllUsers(),
      profileService.getContacts(currentUser.id),
    ])
      .then(([allUsers, userContacts]) => {
        if (!isActive) return;
        setUsers(allUsers);
        setContacts(userContacts);
      })
      .catch((loadError) => {
        if (isActive) {
          setError(loadError.message || "Could not load users and contacts.");
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentUser.id]);

  useEffect(() => {
    const conversationId = activeContact?.conversationId;
    if (!conversationId) return undefined;

    let isActive = true;
    const channel = chatService.subscribeToMessages(
      conversationId,
      (message) => {
        if (!isActive) return;
        setThread((current) =>
          current.conversationId === conversationId
            ? { ...current, messages: mergeMessages(current.messages, [message]) }
            : current
        );
      },
      (subscriptionError) => {
        if (isActive) {
          setError(
            subscriptionError.message || "Live message updates are unavailable."
          );
        }
      }
    );

    chatService
      .getMessages(conversationId)
      .then((loadedMessages) => {
        if (!isActive) return;
        setThread((current) =>
          current.conversationId === conversationId
            ? {
                ...current,
                messages: mergeMessages(current.messages, loadedMessages),
              }
            : current
        );
      })
      .catch((loadError) => {
        if (isActive) {
          setError(loadError.message || "Could not load this conversation.");
        }
      });

    return () => {
      isActive = false;
      chatService.unsubscribe(channel);
    };
  }, [activeContact?.conversationId]);

  const handleAddContact = async (contactId) => {
    setError("");
    try {
      await profileService.addContact(contactId);
      setContacts(await profileService.getContacts(currentUser.id));
    } catch (addError) {
      setError(addError.message || "Could not add that contact.");
    }
  };

  const handleRemoveContact = async (contactId) => {
    setError("");
    try {
      await profileService.removeContact(contactId);
      setContacts((current) =>
        current.filter((contact) => contact.id !== contactId)
      );
      if (activeContact?.id === contactId) {
        setActiveContact(null);
      }
    } catch (removeError) {
      setError(removeError.message || "Could not remove that contact.");
    }
  };

  const handleSelectContact = async (contact) => {
    setError("");
    setActiveContact(null);
    try {
      const conversationId = await chatService.getConversation(contact.id);
      setThread({ conversationId, messages: [] });
      setActiveContact({ ...contact, conversationId });
    } catch (conversationError) {
      setError(conversationError.message || "Could not open that conversation.");
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!activeContact?.conversationId || !messageText.trim()) return false;

    setError("");
    setIsSending(true);
    try {
      const message = await chatService.sendMessage(
        activeContact.conversationId,
        messageText.trim()
      );
      setThread((current) =>
        current.conversationId === activeContact.conversationId
          ? { ...current, messages: mergeMessages(current.messages, [message]) }
          : current
      );
      return true;
    } catch (sendError) {
      setError(sendError.message || "Could not send your message.");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const messages =
    thread.conversationId === activeContact?.conversationId
      ? thread.messages
      : [];

  return (
    <div className={styles.layoutContainer}>
      <Navbar
        currentUser={currentUser}
        users={users}
        contacts={contacts}
        onAddContact={handleAddContact}
        onRemoveContact={handleRemoveContact}
        activeContact={activeContact}
        onSelectContact={handleSelectContact}
        onLogout={onLogout}
      />

      {error && (
        <p className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}

      <div className={styles.mainContent}>
        <ContactList
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={handleSelectContact}
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
            isSending={isSending}
          />
        </section>
      </div>

      <Footer />
    </div>
  );
}
