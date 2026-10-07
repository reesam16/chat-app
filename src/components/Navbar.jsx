import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar({
  currentUser,
  users,
  contacts,
  onAddContact,
  onRemoveContact,
  activeContact,
  onSelectContact,
  onLogout,
}) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const contactIds = new Set(contacts.map((contact) => contact.id));
  const results = normalizedQuery
    ? users.filter(
        (user) =>
          user.id !== currentUser.id &&
          (user.name.toLowerCase().includes(normalizedQuery) ||
            user.username.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const handleAddContact = (userId) => {
    onAddContact(userId);
    setQuery("");
  };

  const handleSelectContact = () => {
    setMenuOpen(false);
    setContactsOpen(false);
  };

  const renderUserSearch = (id) => (
    <div className={styles.userSearch}>
      <label className={styles.srOnly} htmlFor={id}>
        Search users
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find users by name or username"
        autoComplete="off"
      />
      {normalizedQuery && (
        <div className={styles.searchResults} role="region" aria-label="User search results">
          {results.length ? (
            results.map((user) => {
              const isContact = contactIds.has(user.id);
              return (
                <div className={styles.searchResult} key={user.id}>
                  <span>
                    <strong>{user.name}</strong>
                    <small>@{user.username}</small>
                  </span>
                  <button
                    type="button"
                    disabled={isContact}
                    onClick={() => handleAddContact(user.id)}
                  >
                    {isContact ? "Added" : "Add"}
                  </button>
                </div>
              );
            })
          ) : (
            <p className={styles.noResults}>No users found.</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className={styles.header}>
      <h2 className={styles.brand}>Messaging App</h2>
      {currentUser && (
        <span className={styles.mobileHeaderUser}>
          {currentUser.username || currentUser.email}
        </span>
      )}

      <div className={styles.desktopSearch}>
        {renderUserSearch("desktop-user-search")}
      </div>

      <div className={styles.navbarActions}>
        {currentUser && (
          <span className={styles.username}>
            {currentUser.username || currentUser.email}
          </span>
        )}
        <button
          type="button"
          className={styles.logoutButton}
          onClick={onLogout}
        >
          Log Out
        </button>
      </div>

      <button
        type="button"
        className={`${styles.menuButton} ${menuOpen ? styles.open : ""}`}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setMenuOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className={styles.mobileMenu} id="mobile-navigation-menu">
          {renderUserSearch("mobile-user-search")}
          <button
            type="button"
            className={styles.contactsToggle}
            aria-expanded={contactsOpen}
            aria-controls="mobile-contact-list"
            onClick={() => setContactsOpen((isOpen) => !isOpen)}
          >
            Contacts <span>{contacts.length}</span>
          </button>

          {contactsOpen && (
            <div className={styles.mobileContacts} id="mobile-contact-list">
              {contacts.length ? (
                contacts.map((contact) => (
                    <div className={styles.mobileContactRow} key={contact.id}>
                      <button
                        type="button"
                        className={`${styles.mobileContact} ${
                          activeContact?.id === contact.id ? styles.activeMobileContact : ""
                        }`}
                        aria-current={activeContact?.id === contact.id ? "true" : undefined}
                        onClick={() => {
                          onSelectContact(contact);
                          handleSelectContact();
                        }}
                      >
                        <img src={contact.avatar} alt="" />
                        <span>
                          <strong>{contact.name}</strong>
                          <small>@{contact.username}</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={styles.removeMobileContact}
                        aria-label={`Remove ${contact.name} from contacts`}
                        onClick={() => onRemoveContact(contact.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
              ) : (
                <p className={styles.noContacts}>No contacts yet.</p>
              )}
            </div>
          )}

          {currentUser && (
            <p className={styles.mobileUsername}>
              Signed in as {currentUser.username || currentUser.email}
            </p>
          )}
          <button
            type="button"
            className={styles.mobileLogout}
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>
      )}
    </header>
  );
}
