import { io } from "socket.io-client";

// One shared socket for the whole app.
// autoConnect is false so we connect only after login.
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
