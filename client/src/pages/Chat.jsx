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

  // Load the contact list.
  useEffect(() => {
    api.get("/chat/users").then((res) => setUsers(res.data)).catch(() => {});
  }, []);

  // Make sure the socket is connected on this page.
  useEffect(() => {
    if (!socket.connected) socket.connect();
  }, []);

  // ---------- SOCKET LISTENERS ----------
  useEffect(() => {
    // TODO (student): listen for "online:count" and call setOnlineCount(count)

    // TODO (student): listen for "chat:message" and add the message to the list.
    //  Careful: only add it to the open thread if it belongs to that thread.
    //  If it belongs to another user, increase that user's unread count instead.

    // TODO (student): listen for "chat:unread:update" and update the badge.
    //  The data looks like { userId, count }.

    // TODO (student): emit "chat:unread" once here to fill all badges on load.

    return () => {
      // IMPORTANT: remove listeners here or messages will appear twice.
      // socket.off("online:count");
      // socket.off("chat:message");
      // socket.off("chat:unread:update");
    };
  }, [activeUser]);

  // ---------- OPEN A CHAT ----------
  const openChat = (other) => {
    setActiveUser(other);
    setMessages([]);

    // TODO (student):
    //  1. emit "chat:history" with other._id and put the result in setMessages
    //  2. emit "chat:read" with other._id
    //  3. set this user's unread count to 0 in the state
  };

  // ---------- SEND A MESSAGE ----------
  const sendMessage = (text) => {
    if (!text.trim() || !activeUser) return;
    // TODO (student): emit "chat:send" with { to: activeUser._id, text }
    // Do NOT add the message to the state here.
    // The server will send it back through "chat:message".
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
            <span className="online-pill">Online users: {onlineCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
