import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../socket";
import UserList from "../components/UserList.jsx";
import ChatThread from "../components/ChatThread.jsx";

export default function Chat({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [unread, setUnread] = useState({}); // { userId: count }
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // Load users
  useEffect(() => {
    api.get("/chat/users").then((res) => setUsers(res.data)).catch(() => {});
  }, []);

  // Make sure socket is connected
  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, []);

  // ---------- SOCKET LISTENERS ----------
  useEffect(() => {
    socket.on("online:count", (count) => setOnlineCount(count));

    socket.on("chat:message", (message) => {
      const otherPartyId =
        message.from === user._id ? message.to : message.from;

      // Add message to open chat or update unread count
      if (activeUser && otherPartyId === activeUser._id) {
        setMessages((prev) => [...prev, message]);
      } else if (message.from !== user._id) {
        setUnread((prev) => ({
          ...prev,
          [message.from]: (prev[message.from] || 0) + 1,
        }));
      }
    });

    socket.on("chat:unread:update", ({ userId, count }) => {
      setUnread((prev) => ({ ...prev, [userId]: count }));
    });

    return () => {
      socket.off("online:count");
      socket.off("chat:message");
      socket.off("chat:unread:update");
    };
  }, [activeUser]);

  // Get unread messages
  useEffect(() => {
    socket.emit("chat:unread", (list) => {
      const map = {};
      list.forEach((item) => (map[item.userId] = item.count));
      setUnread(map);
    });
  }, []);

  // ---------- OPEN A CHAT ----------
  const openChat = (other) => {
    setActiveUser(other);
    setMessages([]);

    socket.emit("chat:history", other._id, (history) => {
      setMessages(history);
    });

    socket.emit("chat:read", other._id);
    setUnread((prev) => ({ ...prev, [other._id]: 0 }));
  };

  // ---------- SEND A MESSAGE ----------
  const sendMessage = (text) => {
    if (!text.trim() || !activeUser) return;

    socket.emit("chat:send", {
      to: activeUser._id,
      text,
    });
  };

  const logout = async () => {
    await api.post("/auth/logout");
    socket.disconnect();
    onLogout();
    navigate("/login");
  };

  return (
    <div className="app">
      <UserList
        me={user}
        users={users}
        activeUser={activeUser}
        unread={unread}
        onlineCount={onlineCount}
        onSelect={openChat}
        onLogout={logout}
      />

      {activeUser ? (
        <ChatThread
          me={user}
          other={activeUser}
          messages={messages}
          onSend={sendMessage}
        />
      ) : (
        <div className="main">
          <div className="empty">
            <div className="empty-icon">💬</div>
            <h3>WhatsApp Style Chat</h3>
            <p>Select a user from the left to start chatting.</p>
            <span className="online-pill">
              Online users: {onlineCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}