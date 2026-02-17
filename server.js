const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("call-user", ({ to, offer }) => {
    io.to(to).emit("incoming-call", {
      from: socket.id,
      offer,
    });
  });

  socket.on("answer-call", ({ to, answer }) => {
    io.to(to).emit("call-accepted", {
      answer,
    });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", candidate);
  });
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});
