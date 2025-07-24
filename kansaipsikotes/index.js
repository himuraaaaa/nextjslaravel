const { Server } = require("socket.io");
const io = new Server(3001, {
  cors: { origin: "*" }
});
const axios = require('axios');

let users = {};

io.on("connection", (socket) => {
  socket.on("join-chat", ({ userId }) => {
    console.log(`[SignalingServer] join-chat: socketId=${socket.id}, userId=${userId}`);
    users[socket.id] = { userId, role: 'user' };
    // Tidak perlu broadcast user-joined di join-chat
  });

  socket.on("join", ({ userId, role }) => {
    console.log(`[SignalingServer] join: socketId=${socket.id}, userId=${userId}, role=${role}`);
    users[socket.id] = { userId, role };
    socket.broadcast.emit("user-joined", { userId, socketId: socket.id, role });
  });

  socket.on("get-online-users", () => {
    socket.emit("online-users", users);
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  // Event mute user
  socket.on("mute-user", ({ to }) => {
    io.to(to).emit("mute");
  });

  // Event unmute user
  socket.on("unmute-user", ({ to }) => {
    io.to(to).emit("unmute");
  });

  // Chat message event
  socket.on("chat-message", async (msg) => {
    console.log('[SignalingServer] chat-message diterima:', msg);
    console.log('[SignalingServer] Daftar users:', users);
    // Broadcast ke penerima (admin atau user)
    if (msg.to === 'admin') {
      // broadcast ke semua admin (atau bisa diatur ke socket tertentu)
      console.log('[SignalingServer] Broadcast ke semua admin');
      io.emit("chat-message", msg);
    } else {
      // broadcast ke user tertentu
      Object.entries(users).forEach(([sockId, user]) => {
        console.log(`[SignalingServer] Cek userId:`, user.userId, 'vs', msg.to, '| socketId:', sockId);
        if (user.userId == msg.to) { // pakai == agar string/number cocok
          console.log(`[SignalingServer] Broadcast chat ke userId ${user.userId} (socket ${sockId})`);
          io.to(sockId).emit("chat-message", msg);
        }
      });
      // Juga kirim ke pengirim (admin) agar bubble langsung muncul
      socket.emit("chat-message", msg);
    }
    // Simpan ke backend
    try {
      await axios.post('http://localhost:8000/api/chat', {
        user_id: msg.role === 'user' ? msg.from_id : msg.to_id, // user_id harus diketahui
        sender: msg.role,
        message: msg.text,
      });
    } catch (err) {
      console.error('Gagal simpan chat ke backend:', err.message);
    }
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", { socketId: socket.id });
    delete users[socket.id];
  });
});

console.log("Signaling server running on port 3001"); 