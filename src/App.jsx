import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./features/auth/AuthPage";
import ChatDashboard from "./features/chat/ChatDashboard";
import { authService } from "./services/authService";
import styles from "./App.module.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const subscription = authService.onAuthStateChange((sessionUser) => {
      setUser(sessionUser);
      setIsAuthLoading(false);
      setAuthError("");
    });

    authService.getCurrentUser().then(({ user: sessionUser, error }) => {
      if (error) {
        setAuthError(error);
      } else {
        setUser(sessionUser);
      }
      setIsAuthLoading(false);
    }).catch((error) => {
      setAuthError(error.message || "Unable to restore your Supabase session.");
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => setUser(userData);

  const handleLogout = async () => {
    const { error } = await authService.logoutUser();
    if (error) setAuthError(error);
  };

  return (
    <BrowserRouter>
      <div className={styles.appWrapper}>
        <div className={styles.appContainer}>
          <main className={styles.mainContent}>
            {isAuthLoading ? (
              <p role="status">Connecting to Supabase...</p>
            ) : (
              <>
                {authError && <p role="alert">{authError}</p>}
                <Routes>
                  <Route
                    path="/login"
                    element={
                      !user ? (
                        <AuthPage onLoginSuccess={handleLoginSuccess} />
                      ) : (
                        <Navigate to="/chat" replace />
                      )
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      user ? (
                        <ChatDashboard
                          currentUser={user}
                          onLogout={handleLogout}
                        />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate to={user ? "/chat" : "/login"} replace />
                    }
                  />
                </Routes>
              </>
            )}
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
