const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const Message = require("./models/Message");

// userId -> number of open sockets for that user
const onlineUsers = new Map();

function getOnlineCount() {
  return onlineUsers.size;
}

function addUser(userId) {
  onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
}

function removeUser(userId) {
  const count = (onlineUsers.get(userId) || 1) - 1;
  if (count <= 0) onlineUsers.delete(userId);
  else onlineUsers.set(userId, count);
}

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // ---- DONE FOR YOU: JWT check during the handshake ----
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || "";
      const token = cookie.parse(raw).token;
      if (!token) return next(new Error("No token"));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id };
      next();
    } catch (err) {
      next(new Error("Not authorised"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Each user joins a room named after their own id.
    // Sending to a room means every tab of that user gets the event.
    socket.join(userId);

    addUser(userId);
    console.log("Connected:", userId, "| online:", getOnlineCount());

    // ================= EVENT 1: online:count =================
    // TODO (student): tell EVERY connected browser the new online count.
    // Hint: io.emit("online:count", ...)

    // ================= EVENT 2: chat:history =================
    // Browser sends the other user's id and expects the old messages back.
    // TODO (student):
    //  1. find messages where (from = me AND to = other) OR (from = other AND to = me)
    //  2. sort oldest first
    //  3. send them back using the acknowledgement function
    // socket.on("chat:history", async (withUserId, ack) => { ... });

    // ================= EVENT 3: chat:send =================
    // Browser sends { to, text }.
    // TODO (student):
    //  1. check text is not empty
    //  2. save the message in MongoDB (read: false)
    //  3. emit "chat:message" to BOTH rooms: my id and the receiver id
    //  4. also send the new unread count to the receiver (see EVENT 6)
    // socket.on("chat:send", async ({ to, text }, ack) => { ... });

    // ================= EVENT 4: chat:unread =================
    // Browser asks for unread counts of all users when the page loads.
    // TODO (student):
    //  1. count unread messages sent TO me, grouped by sender
    //  2. reply with a list like [{ userId, count }]
    // socket.on("chat:unread", async (ack) => { ... });

    // ================= EVENT 5: chat:read =================
    // Browser says "I opened this chat".
    // TODO (student):
    //  1. set read: true for messages from that user to me
    //  2. emit "chat:unread:update" back to me with count 0
    // socket.on("chat:read", async (fromUserId) => { ... });

    // ================= EVENT 6: chat:unread:update =================
    // This one is emitted BY the server, not listened to.
    // Send it to one user's room: io.to(receiverId).emit("chat:unread:update", { userId, count })

    // ================= BONUS: chat:typing =================
    // Not saved in the database. Just forward it to the other user.

    socket.on("disconnect", () => {
      removeUser(userId);
      console.log("Disconnected:", userId, "| online:", getOnlineCount());
      // TODO (student): tell everyone the new online count again.
    });
  });

  return io;
}

module.exports = initSocket;
