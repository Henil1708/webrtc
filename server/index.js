const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const bodyParser = require("body-parser");
const roomManager = require("./managers/RoomManager");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is running");
});

io.on("connection", (socket) => {
  console.log("a new client connected");
  let userDetails = {
    email: null,
    roomId: null,
  };

  socket.on("disconnect", async () => {
    console.log("client disconnected");
    if (userDetails.email && userDetails.roomId) {
      const room = roomManager.getRoom(userDetails.roomId);

      if (room) {
        await room.removeParticipant(userDetails.email);
        socket.broadcast
          .to(userDetails.roomId)
          .emit("room-info", room.getRoomInfo());
      }
    }
  });

  socket.on("join-room", (data) => {
    const { roomId, email } = data;
    userDetails = data;
    console.log(`User with email ${email} joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", email);

    const room = roomManager.getRoom(roomId);

    if (!room) {
      const roomCreated = roomManager.createRoom(roomId);
      if (roomCreated) {
        console.log(`Room ${roomId} created`);
      }
    }
    const roomInfo = roomManager.getRoom(roomId);
    if (roomInfo) {
      roomInfo.addParticipant(email, socket.id);
      console.log(`User ${email} added to room ${roomId}`);
      socket.emit("room-info", roomInfo.getRoomInfo());
    } else {
      console.error(`Room ${roomId} not found`);
    }
  });

  socket.on("message", (data) => {
    const roomInfo = roomManager.getRoom(data.roomId);

    const broadCasteTo = roomInfo.participants.filter(
      (participant) => participant.socketId !== socket.id
    );
    console.log(roomInfo);

    switch (data.type) {
      case "request-call":
        // console.log("requesting the call", data.type);

        broadCasteTo.map((to) =>
          socket.broadcast
            .to(to.socketId)
            .emit("message", { ...data, type: "call-request" })
        );

        break;
      case "accept-call":
        console.log("accepting the call", { type: data.type, broadCasteTo });

        broadCasteTo.map((to) =>
          socket.broadcast.to(to.socketId).emit("message", data)
        );

        break;
      case "candidate":
        // console.log("candidate", data.type);
        broadCasteTo.map((to) =>
          socket.broadcast.to(to.socketId).emit("message", data)
        );
        break;
      default:
        console.log("Unknown message type", data.type);
        broadCasteTo.map((to) =>
          socket.broadcast.to(to.socketId).emit("message", data)
        );
    }
  });
});

const PORT = 8001;
server.listen(PORT, () => {
  console.log(`[Server] HTTP + WebSocket server running on port ${PORT}`);
});
