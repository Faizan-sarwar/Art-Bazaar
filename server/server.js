const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const http     = require('http');
const { Server } = require('socket.io');
const customRequestRoutes = require('./routes/customRequestRoutes');
require('dotenv').config();

const authRoutes         = require('./routes/authRoutes');
const artworkRoutes      = require('./routes/artworkRoutes');
const orderRoutes        = require('./routes/orderRoutes');
const messageRoutes      = require('./routes/messageRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const storeRoutes        = require('./routes/storeRoutes');
const eventRoutes        = require('./routes/eventRoutes');
const stripeRoutes       = require('./routes/stripeRoutes');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const liveSessions = {};
const socketRooms  = {};

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('get-sessions', () => {
    socket.emit('sessions-updated',
      Object.entries(liveSessions).map(([id, s]) => ({ roomId: id, ...s }))
    );
  });

  socket.on('start-live', ({ roomId, artistId, artistName, artistAvatar, title }) => {
    socket.join(roomId);
    socketRooms[socket.id] = { roomId, role: 'artist' };
    liveSessions[roomId] = {
      artistId, artistName, artistAvatar,
      title:       title || `${artistName}'s Live Session`,
      viewerCount: 0,
      startedAt:   new Date().toISOString(),
    };
    io.emit('sessions-updated', Object.entries(liveSessions).map(([id, s]) => ({ roomId: id, ...s })));
    console.log(`🎥 Live started: ${roomId} by ${artistName}`);
  });

  socket.on('join-live', ({ roomId, viewerName }) => {
    socket.join(roomId);
    socketRooms[socket.id] = { roomId, role: 'viewer' };
    if (liveSessions[roomId]) {
      liveSessions[roomId].viewerCount++;
      io.to(roomId).emit('viewer-count', liveSessions[roomId].viewerCount);
      socket.to(roomId).emit('viewer-joined', {
        viewerName,
        viewerSocketId: socket.id,
      });
    }
    socket.emit('sessions-updated',
      Object.entries(liveSessions).map(([id, s]) => ({ roomId: id, ...s }))
    );
  });

  socket.on('offer', ({ roomId, offer, to }) => {
    if (to) {
      io.to(to).emit('offer', { offer, from: socket.id });
    } else {
      socket.to(roomId).emit('offer', { offer, from: socket.id });
    }
  });

  socket.on('answer', ({ roomId, answer, to }) => {
    io.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate, to }) => {
    if (to) {
      io.to(to).emit('ice-candidate', { candidate });
    } else {
      socket.to(roomId).emit('ice-candidate', { candidate });
    }
  });

  socket.on('live-message', ({ roomId, senderName, text }) => {
    io.to(roomId).emit('live-message', {
      senderName, text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  });

  socket.on('end-live', ({ roomId }) => {
    delete liveSessions[roomId];
    io.to(roomId).emit('session-ended');
    io.emit('sessions-updated', Object.entries(liveSessions).map(([id, s]) => ({ roomId: id, ...s })));
    console.log(`🔴 Live ended: ${roomId}`);
  });

  socket.on('disconnect', () => {
    const info = socketRooms[socket.id];
    if (info) {
      const { roomId, role } = info;
      if (role === 'artist' && liveSessions[roomId]) {
        delete liveSessions[roomId];
        io.to(roomId).emit('session-ended');
        io.emit('sessions-updated', Object.entries(liveSessions).map(([id, s]) => ({ roomId: id, ...s })));
      } else if (role === 'viewer' && liveSessions[roomId]) {
        liveSessions[roomId].viewerCount = Math.max(0, liveSessions[roomId].viewerCount - 1);
        io.to(roomId).emit('viewer-count', liveSessions[roomId].viewerCount);
      }
      delete socketRooms[socket.id];
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

app.set('io', io);

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/artworks',        artworkRoutes);
app.use('/api/orders',          orderRoutes);
app.use('/api/messages',        messageRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/reviews',         reviewRoutes);
app.use('/api/notifications',   notificationRoutes);
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/store',           storeRoutes);
app.use('/api/events',          eventRoutes);
app.use('/api/stripe',          stripeRoutes);

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'ArtBazaar API is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });