import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../socket";

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      setError("");
      const res = await api.post("/auth/register", form);
      socket.connect();
      onLogin(res.data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">C</div>
        <h2>Create Account</h2>

        <label>Name</label>
        <input name="name" value={form.name} onChange={change} />

        <label>Email</label>
        <input name="email" value={form.email} onChange={change} />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={change} />

        {error && <div className="error">{error}</div>}

        <button className="btn" onClick={submit}>Register</button>
        <p className="muted center-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
