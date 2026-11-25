import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import styles from './AuthPage.module.css';

export default function AuthPage({ onLoginSuccess, initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgotPassword = mode === 'forgot';
  const isResetPassword = mode === 'reset';

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        const result = await authService.requestPasswordReset(email);
        if (result.error) {
          setError(result.error);
        } else {
          setMessage('If an account exists for this email, a reset link is on its way.');
        }
        return;
      }

      if (isResetPassword) {
        if (password !== confirmPassword) {
          setError('The passwords do not match.');
          return;
        }

        const result = await authService.updatePassword(password);
        if (result.error) {
          setError(result.error);
        } else {
          setMessage('Your password has been updated. Continue to sign in.');
        }
        return;
      }

      const result = isLogin
        ? await authService.loginUser(email, password)
        : await authService.registerUser(name, username, email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.confirmationRequired) {
        setMessage('Check your email to confirm your account, then log in.');
        setMode('login');
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
        <h1 className={styles.title}>
          {isForgotPassword
            ? 'Reset your password'
            : isResetPassword
              ? 'Choose a new password'
              : 'Messaging App'}
        </h1>

        {(isLogin || isRegister) && (
          <div className={styles.tabGroup}>
            <button
              type="button"
              className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
              onClick={() => changeMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`${styles.tab} ${isRegister ? styles.activeTab : ''}`}
              onClick={() => changeMode('register')}
            >
              Register
            </button>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegister && (
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

          {isRegister && (
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

          {(isLogin || isRegister || isForgotPassword) && (
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
          )}

          {!isForgotPassword && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {isResetPassword ? 'New password' : 'Password'}
              </label>
              <input
                type="password"
                className={styles.input}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {isResetPassword && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm new password</label>
              <input
                type="password"
                className={styles.input}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {message && <p className={styles.hint} role="status">{message}</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : isLogin
                ? 'Log In'
                : isRegister
                  ? 'Create Account'
                  : isForgotPassword
                    ? 'Send reset link'
                    : 'Update password'}
          </button>
        </form>

        {isLogin && (
          <button
            type="button"
            className={styles.textButton}
            onClick={() => changeMode('forgot')}
          >
            Forgot password?
          </button>
        )}

        {isForgotPassword && (
          <button
            type="button"
            className={styles.textButton}
            onClick={() => changeMode('login')}
          >
            Back to login
          </button>
        )}

        {isResetPassword && message && (
          <button
            type="button"
            className={styles.textButton}
            onClick={() => navigate('/login')}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
