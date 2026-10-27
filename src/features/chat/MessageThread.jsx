import { useState, useEffect, useRef } from "react";
import styles from "./MessageThread.module.css";

export default function MessageThread({
  activeContact,
  messages,
  currentUser,
}) {
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

    // Force scroll to bottom immediately when active contact changes
  useEffect(() => {
    setAutoScroll(true);
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [activeContact?.id]);

  // Scroll to bottom when messages update, if autoScroll is enabled
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

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

    setAutoScroll(isNearBottom);
  };



  // return (
  //   <section
  //     className={styles.messageThread}
  //     ref={scrollContainerRef}
  //     onScroll={handleScroll}
  //   >
  //     <div className={styles.threadHeader}>
  //       <img src={activeContact.avatar} alt="" />
  //       <div>
  //         <h2>{activeContact.name}</h2>
  //         <span>@{activeContact.username}</span>
  //       </div>
  //     </div>

  //     <div className={styles.messages}>
  //       {contactMessages.length === 0 ? (
  //         <p className={styles.emptyMessage}>No messages yet.</p>
  //       ) : (
  //         contactMessages.map((message) => (
  //           <div
  //             key={message.id}
  //             className={
  //               message.senderId === currentUser.id
  //                 ? styles.sentMessage
  //                 : styles.receivedMessage
  //             }
  //           >
  //             {message.text}
  //           </div>
  //         ))
  //       )}
  //       {/* Invisible anchor element at the bottom */}
  //       <div ref={messagesEndRef} />
  //     </div>
  //   </section>
  // );

return (
    <section className={styles.messageThread}>
      <div className={styles.threadHeader}>
        <img src={activeContact.avatar} alt="" />
        <div>
          <h2>{activeContact.name}</h2>
          <span>@{activeContact.username}</span>
        </div>
      </div>

      {/* Scrolling and bottom-alignment happen here */}
      <div
        className={styles.messages}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {contactMessages.length === 0 ? (
          <p className={styles.emptyMessage}>No messages yet.</p>
        ) : (
          contactMessages.map((message) => (
            <div
              key={message.id}
              className={
                message.senderId === currentUser.id
                  ? styles.sentMessage
                  : styles.receivedMessage
              }
            >
              {message.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </section>
  );

}
