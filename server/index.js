require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const initSocket = require("./socket");

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("Chat API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log("Server running on port " + PORT));
  })
  .catch((err) => console.log("MongoDB error:", err.message));
