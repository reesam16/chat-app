import styles from "./ContactList.module.css";

export default function ContactList({
  contacts,
  activeContact,
  onSelectContact,
  onRemoveContact,
}) {
  return (
    <aside className={styles.contactList}>
      <h2>Contacts</h2>

      <div className={styles.contactItems}>
        {contacts.length === 0 ? (
          <p className={styles.emptyList}>No contacts yet.</p>
        ) : (
          contacts.map((contact) => (
            <div className={styles.contactRow} key={contact.id}>
              <button
                type="button"
                className={`${styles.contactItem} ${
                  activeContact?.id === contact.id ? styles.active : ""
                }`}
                onClick={() => onSelectContact(contact)}
              >
                <img
                  src={contact.avatar}
                  alt=""
                  className={styles.avatar}
                />

                <span>
                  <strong>{contact.name}</strong>
                  <small>@{contact.username}</small>
                </span>
              </button>
              <button
                type="button"
                className={styles.removeContactButton}
                onClick={() => onRemoveContact(contact.id)}
                aria-label={`Remove ${contact.name} from contacts`}
                title={`Remove ${contact.name}`}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
