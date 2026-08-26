import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../socket";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      setError("");
      const res = await api.post("/auth/login", form);
      socket.connect(); // open the socket only after login
      onLogin(res.data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">C</div>
        <h2>ChatApp Login</h2>
        <p className="muted">Login to start chatting</p>

        <label>Email</label>
        <input name="email" value={form.email} onChange={change} placeholder="you@test.com" />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={change} placeholder="••••••••" />

        {error && <div className="error">{error}</div>}

        <button className="btn" onClick={submit}>Login</button>
        <p className="muted center-text">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
