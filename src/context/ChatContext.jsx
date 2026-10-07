import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);

  // Initialize current user and contacts list on mount
  useEffect(() => {
    const user = chatService.getCurrentUser();
    const allUsers = chatService.getContacts();

    // Filter out the logged-in user from contacts
    const contactList = allUsers.filter((u) => u.id !== user.id);

    setCurrentUser(user);
    setContacts(contactList);

    if (contactList.length > 0) {
      setActiveContact(contactList[0]); // Default to first contact
    }
  }, []);

  // Fetch thread messages whenever activeContact changes
  useEffect(() => {
    if (activeContact) {
      const thread = chatService.getMessages(activeContact.id);
      setMessages(thread);
    }
  }, [activeContact]);

  // Send message function
  const sendMessage = (text) => {
    if (!activeContact || !text.trim()) return;

    const newMessage = chatService.sendMessage(activeContact.id, text);
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    
      {children}
    
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};