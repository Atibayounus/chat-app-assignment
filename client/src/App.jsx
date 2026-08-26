import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Chat from "./pages/Chat.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ask the server who is logged in.
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center">Loading...</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/chat" /> : <Login onLogin={setUser} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/chat" /> : <Register onLogin={setUser} />}
      />
      <Route
        path="/chat"
        element={user ? <Chat user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/chat" />} />
    </Routes>
  );
}
