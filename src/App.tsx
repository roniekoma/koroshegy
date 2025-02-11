import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import ProfilePage from "./pages/ProfilePage";
import PasswordChangedPage from "./pages/PasswordChangedPage";
import LogoutPage from "./pages/LogoutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import routes from "tempo-routes";
import AuthListener from "./components/auth/AuthListener";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <AuthListener />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/password-changed" element={<PasswordChangedPage />} />
          <Route path="/logout" element={<ProtectedRoute><LogoutPage /></ProtectedRoute>} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
