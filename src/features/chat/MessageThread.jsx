import styles from "./MessageThread.module.css";

export default function MessageThread( { activeContact, messages, currentUser } ) {
  if (!activeContact) {
    return (
      <section className={styles.messageThread}>
        <p>Select a contact to start messaging.</p>
      </section>
    );
  }

  const contactMessages = messages;

  return (
    <section className={styles.messageThread}>
     <div className={styles.threadHeader}>
        <h2>{activeContact.name}</h2>
        <span>@{activeContact.username}</span>
      </div>

      <div className={styles.messages}>
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
      </div>
    </section>
  );
}
