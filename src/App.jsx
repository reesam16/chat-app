import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./features/auth/AuthPage";
import ChatDashboard from "./features/chat/ChatDashboard";
import { authService } from "./services/authService";
import styles from "./App.module.css";

export default function App() {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const handleLoginSuccess = (userData) => {
    authService.saveCurrentUser(userData);
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logoutUser();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className={styles.appWrapper}>
        <div className={styles.appContainer}>
          <main className={styles.mainContent}>
            <Routes>
              {/* Auth Route */}
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

              {/* Dashboard Route */}
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

              {/* Catch-all redirect to login or chat */}
              <Route
                path="*"
                element={
                  <Navigate to={user ? "/chat" : "/login"} replace />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
