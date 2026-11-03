import { useEffect, useRef } from "react";
import styles from "./MessageThread.module.css";

export default function MessageThread({
  activeContact,
  messages,
  currentUser,
}) {
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const autoScrollRef = useRef(true);

  // Force scroll to bottom immediately when active contact changes
  useEffect(() => {
    autoScrollRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [activeContact?.id]);

  // Scroll to bottom when messages update, if autoScroll is enabled
  useEffect(() => {
    if (autoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!activeContact) {
    return (
      <section className={styles.messageThread}>
        <p>Select a contact to start messaging.</p>
      </section>
    );
  }

  const contactMessages = messages;

  // Track scroll position to decide whether to continue auto-scrolling
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // User is within 100px of the bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    autoScrollRef.current = isNearBottom;
  };
  return (
    <section className={styles.messageThread}>
      <div
        className={styles.messages}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className={styles.threadHeader}>
          <img src={activeContact.avatar} alt="" />
          <div>
            <h2>{activeContact.name}</h2>
            <span>@{activeContact.username}</span>
          </div>
        </div>

        <div className={styles.messageList}>
          {contactMessages.length === 0 ? (
            <p className={styles.emptyMessage}>No messages yet.</p>
          ) : (
            contactMessages.map((message, index) => {
              const messageDate = new Date(
                message.createdAt || message.created_at,
              );
              const today = new Date();
              // Check if the message was sent today
              const isToday =
                messageDate.toDateString() === today.toDateString();

              // Get the previous message to compare against
              const prevMessage = index > 0 ? contactMessages[index - 1] : null;
              const prevDate = prevMessage
                ? new Date(prevMessage.createdAt || prevMessage.created_at)
                : null;

              // Grouping conditions
              const isFirstMessage = index === 0;
              const senderChanged =
                prevMessage && prevMessage.senderId !== message.senderId;
              const isDifferentDay =
                prevDate &&
                messageDate.toDateString() !== prevDate.toDateString();

              // Calculate time difference in minutes between this message and the previous one
              const timeDiffMinutes = prevDate
                ? (messageDate - prevDate) / (1000 * 60)
                : 0;
              const isLongGap = timeDiffMinutes > 5;

              // Decide whether to show the timestamp for this message
              const showTimestamp =
                isFirstMessage || senderChanged || isDifferentDay || isLongGap;

                // Is this message part of an ongoing stream from the same sender?
              const isConsecutive = prevMessage && prevMessage.senderId === message.senderId && !showTimestamp;

              const timeString = messageDate.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              });

              const dateString = messageDate.toLocaleDateString([], {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
              });

              return (
                <div
                  key={message.id}
                  className={`
                    ${message.senderId === currentUser.id ? styles.sentWrapper : styles.receivedWrapper}
                    ${isConsecutive ? styles.consecutive : ""}
                  `}
                >
                  {showTimestamp && (
                    <span className={styles.messageTimestamp}>
                      {!isToday && `${dateString} `}
                      {timeString}
                    </span>
                  )}
                  <div
                    className={
                      message.senderId === currentUser.id
                        ? styles.sentMessage
                        : styles.receivedMessage
                    }
                  >
                    {message.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </section>
  );
}
