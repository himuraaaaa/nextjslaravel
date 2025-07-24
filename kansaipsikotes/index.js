// index.js

const { Server } = require("socket.io");
// const axios = require('axios'); // Axios tidak lagi dibutuhkan jika chat-message dihilangkan

// Server Socket.IO harus mendengarkan di port yang disediakan oleh Railway
// via variabel lingkungan PORT. Jika tidak ada (misalnya di lokal), fallback ke 3001.
const PORT = 8080;

const io = new Server(PORT, {
  cors: {
    // Untuk produksi, ganti "*" dengan URL frontend Next.js Anda di Vercel untuk keamanan.
    origin: "https://nextjslaravel-amg8.vercel.app",
    methods: ["GET", "POST"] // Pastikan metode yang diizinkan sesuai kebutuhan
  }
});

let users = {}; // Objek untuk menyimpan data user yang terhubung

io.on("connection", (socket) => {
  console.log(`[SignalingServer] New client connected: ${socket.id}`);

  // Event untuk user bergabung ke sesi chat (misal sebelum WebRTC)
  socket.on("join-chat", ({ userId }) => {
    console.log(`[SignalingServer] join-chat: socketId=${socket.id}, userId=${userId}`);
    users[socket.id] = { userId, role: 'user' };
  });

  // Event untuk user bergabung ke sesi video/panggilan
  socket.on("join", ({ userId, role }) => {
    console.log(`[SignalingServer] join: socketId=${socket.id}, userId=${userId}, role=${role}`);
    users[socket.id] = { userId, role };
    // Broadcast ke semua user yang sudah terhubung (kecuali diri sendiri) bahwa ada user baru bergabung
    socket.broadcast.emit("user-joined", { userId, socketId: socket.id, role });
  });

  // Event untuk mendapatkan daftar user online (yang bergabung)
  socket.on("get-online-users", () => {
    socket.emit("online-users", users);
  });

  // Event signaling untuk WebRTC
  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  // Event mute user
  socket.on("mute-user", ({ to }) => {
    console.log(`[SignalingServer] Mute request for socket: ${to}`);
    io.to(to).emit("mute");
  });

  // Event unmute user
  socket.on("unmute-user", ({ to }) => {
    console.log(`[SignalingServer] Unmute request for socket: ${to}`);
    io.to(to).emit("unmute");
  });

  // Event ketika klien terputus
  socket.on("disconnect", () => {
    console.log(`[SignalingServer] Client disconnected: ${socket.id}`);
    // Broadcast ke semua user yang tersisa bahwa ada user yang keluar
    socket.broadcast.emit("user-left", { socketId: socket.id, userId: users[socket.id]?.userId });
    delete users[socket.id]; // Hapus user dari daftar
  });
});

console.log(`Signaling server running on port ${PORT}`);