const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Railway proxy support
app.set("trust proxy", true);

// Health check
app.get("/", (req, res) => {
  res.send("WebRTC signaling alive");
});

const server = http.createServer(app);

// Socket.IO setup for Railway
const io = new Server(server, {
  transports: ["websocket", "polling"],
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("call-user", ({ to, offer }) => {
    io.to(to).emit("incoming-call", {
      from: socket.id,
      offer,
    });
  });

  socket.on("answer-call", ({ to, answer }) => {
    io.to(to).emit("call-accepted", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

// Railway dynamic port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
