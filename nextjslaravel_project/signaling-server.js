const { Server } = require("socket.io");
const io = new Server(3001, {
  cors: { origin: "*" }
});

let users = {};

io.on("connection", (socket) => {
  socket.on("join", ({ userId, role }) => {
    users[socket.id] = { userId, role };
    socket.broadcast.emit("user-joined", { userId, socketId: socket.id, role });
  });

  socket.on("get-online-users", () => {
    socket.emit("online-users", users);
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", { socketId: socket.id });
    delete users[socket.id];
  });
});

console.log("Signaling server running on port 3001"); 