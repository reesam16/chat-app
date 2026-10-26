import { useRef, useState } from "react";
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
  onAvatarChange,
  error,
}) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInput = useRef(null);
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

  const handleAvatarSelected = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      await onAvatarChange(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const renderProfileControl = () => (
    <div className={styles.profileControl}>
      <input
        ref={avatarInput}
        className={styles.srOnly}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleAvatarSelected}
        aria-label="Choose a profile picture"
      />
      <button
        type="button"
        className={styles.profileButton}
        onClick={() => avatarInput.current?.click()}
        disabled={isUploadingAvatar}
        aria-label={isUploadingAvatar ? "Uploading profile picture" : "Change profile picture"}
        title={isUploadingAvatar ? "Uploading..." : "Change profile picture"}
      >
        <img src={currentUser.avatar} alt="" className={styles.profileAvatar} />
        <span>{isUploadingAvatar ? "Uploading..." : currentUser.username || currentUser.email}</span>
      </button>
    </div>
  );

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
                    <img src={user.avatar} alt="" className={styles.searchAvatar} />
                    <span className={styles.searchResultText}>
                    <strong>{user.name}</strong>
                    <small>@{user.username}</small>
                    </span>
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

      <div className={styles.desktopSearch}>
        {renderUserSearch("desktop-user-search")}
      </div>

      {currentUser && renderProfileControl()}

      <div className={styles.navbarActions}>
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
          {isUploadingAvatar && <p className={styles.mobileUsername}>Uploading profile picture...</p>}
          {error && <p className={styles.mobileError}>{error}</p>}
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
