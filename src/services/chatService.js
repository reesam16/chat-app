import { MOCK_USERS, CURRENT_USER } from '../data/users';

const STORAGE_KEY = 'chat_app_messages';

const getThreadId = (firstUserId, secondUserId) =>
  [firstUserId, secondUserId].sort().join(':');

const getStoredMessages = () => {
  try {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
};

export const chatService = {
  // Returns the currently logged in user
  getCurrentUser: () => CURRENT_USER,

  // Returns all contacts except yourself
  getContacts: () => MOCK_USERS.filter((user) => user.id !== CURRENT_USER.id),

  // Fetches a direct-message thread for either participant
  getMessages: (currentUserId, contactId) => {
    const threadId = getThreadId(currentUserId, contactId);
    return getStoredMessages().filter((message) => {
      if (message.threadId) return message.threadId === threadId;

      const sameParticipants =
        (message.senderId === currentUserId && message.recipientId === contactId) ||
        (message.senderId === contactId && message.recipientId === currentUserId);
      const legacyConversation =
        (message.conversationId === contactId && message.senderId === currentUserId) ||
        (message.conversationId === currentUserId && message.senderId === contactId);

      return sameParticipants || legacyConversation;
    });
  },

  // Saves a new message to localStorage
  sendMessage: (senderId, recipientId, text) => {
    const threadId = getThreadId(senderId, recipientId);
    const allMessages = getStoredMessages();
    const newMessage = {
      id: `msg_${Date.now()}`,
      threadId,
      conversationId: threadId,
      senderId,
      recipientId,
      text,
      createdAt: new Date().toISOString()
    };

    allMessages.push(newMessage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages));
    return newMessage;
  }
};