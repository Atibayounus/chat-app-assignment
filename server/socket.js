const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const mongoose = require("mongoose");

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

    socket.join(userId);
    addUser(userId);
    console.log("Connected:", userId, "| online:", getOnlineCount());

    // EVENT 1: online:count
    io.emit("online:count", getOnlineCount());

    // EVENT 2: chat:history
    socket.on("chat:history", async (withUserId, ack) => {
      try {
        const messages = await Message.find({
          $or: [
            { from: userId, to: withUserId },
            { from: withUserId, to: userId },
          ],
        }).sort({ createdAt: 1 });

        ack(messages);
      } catch (err) {
        console.error("chat:history error:", err.message);
        ack([]);
      }
    });

    // EVENT 3: chat:send

    socket.on("chat:send", async ({ to, text }, ack) => {
      try {
        if (!text || !text.trim()) {
          if (ack) ack({ error: "Message is empty" });
          return;
        }

        const message = await Message.create({
          from: userId,
          to,
          text: text.trim(),
          read: false,
        });

        io.to(userId).to(to).emit("chat:message", message);

        const count = await Message.countDocuments({
          from: userId,
          to,
          read: false,
        });
        io.to(to).emit("chat:unread:update", { userId, count });

        if (ack) ack({ success: true, message });
      } catch (err) {
        console.error("chat:send error:", err.message);
        if (ack) ack({ error: "Could not send message" });
      }
    });

    // EVENT 4: chat:unread

    socket.on("chat:unread", async (ack) => {
      try {
        const counts = await Message.aggregate([
          { $match: { to: new mongoose.Types.ObjectId(userId), read: false } },
          { $group: { _id: "$from", count: { $sum: 1 } } },
        ]);

        const result = counts.map((c) => ({ userId: c._id.toString(), count: c.count }));
        ack(result);
      } catch (err) {
        console.error("chat:unread error:", err.message);
        ack([]);
      }
    });

    // EVENT 5: chat:read
    
    socket.on("chat:read", async (fromUserId) => {
      try {
        await Message.updateMany(
          { from: fromUserId, to: userId, read: false },
          { $set: { read: true } }
        );

        io.to(userId).emit("chat:unread:update", { userId: fromUserId, count: 0 });
      } catch (err) {
        console.error("chat:read error:", err.message);
      }
    });

    // BONUS: chat:typing
    socket.on("chat:typing", ({ to }) => {
      io.to(to).emit("chat:typing", { from: userId });
    });

    socket.on("disconnect", () => {
      removeUser(userId);
      console.log("Disconnected:", userId, "| online:", getOnlineCount());
      io.emit("online:count", getOnlineCount());
    });
  });

  return io;
}

module.exports = initSocket;