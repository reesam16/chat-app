// MessageInput.jsx
import { useState } from "react";
import styles from "./MessageInput.module.css";


export default function MessageInput({
  activeContact,
  onSendMessage,
  isSending = false,
}) {
  const [messageText, setMessageText] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeContact || !messageText.trim() || isSending) {
      return;
    }

    if (await onSendMessage(messageText)) {
      setMessageText("");
    }
  };
  return (
    <form className={styles.messageInput}  onSubmit={handleSubmit}>
      <input
        type="text"
        value={messageText}
        onChange={(event) => setMessageText(event.target.value)}
        placeholder={
          activeContact 
            ? `Message ${activeContact.name}...`
            : "Select a contact first"
        }
        disabled={!activeContact}
        aria-label="Write a message"
      />
      <button
        type="submit"
        disabled={!activeContact || !messageText.trim() || isSending}
      >
        {isSending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
