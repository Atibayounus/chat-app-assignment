import axios from "axios";

// withCredentials sends the login cookie with every request.
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api",
  withCredentials: true,
});

export default api;
