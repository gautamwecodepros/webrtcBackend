const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.get("/", (req, res) => {
  res.send("Server alive");
});

const server = http.createServer(app);

const io = new Server(server, {
  transports: ["websocket", "polling"],
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = {}; // code → socketId

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

io.on("connection", (socket) => {
  let code;

  do {
    code = generateCode();
  } while (users[code]);

  users[code] = socket.id;

  console.log("Connected:", socket.id, "Code:", code);

  socket.emit("your-code", code);

  socket.on("call-user", ({ to, offer }) => {
    const target = users[to];
    if (target) {
      io.to(target).emit("incoming-call", {
        from: code,
        offer,
      });
    }
  });

  socket.on("answer-call", ({ to, answer }) => {
    const target = users[to];
    if (target) {
      io.to(target).emit("call-accepted", { answer });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const target = users[to];
    if (target) {
      io.to(target).emit("ice-candidate", candidate);
    }
  });

  socket.on("call-ended", ({ to }) => {
    const target = users[to];
    if (target) {
      io.to(target).emit("call-ended");
    }
  });

  socket.on("disconnect", () => {
    delete users[code];
    console.log("Disconnected:", code);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
