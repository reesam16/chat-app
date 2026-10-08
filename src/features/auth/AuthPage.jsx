import { useState } from 'react';
import { authService } from '../../services/authService';
import styles from './AuthPage.module.css';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const result = isLogin
        ? await authService.loginUser(email, password)
        : await authService.registerUser(name, username, email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.confirmationRequired) {
        setMessage('Check your email to confirm your account, then log in.');
        setIsLogin(true);
        return;
      }

      onLoginSuccess?.(result.user);
    } catch (submitError) {
      setError(submitError.message || 'Unable to connect to Supabase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Messaging App</h1>

        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setMessage('');
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setMessage('');
            }}
          >
            Register
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                className={styles.input}
                placeholder="janedoe"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="jane@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className={styles.hint} role="status">{message}</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}