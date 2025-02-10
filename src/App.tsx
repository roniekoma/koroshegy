import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import routes from "tempo-routes";
import AuthListener from "./components/auth/AuthListener"; // 🔹 Ezt kell hozzáadni!

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <AuthListener /> {/* 🔹 Meghívjuk itt, hogy figyelje az eseményeket */}
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
