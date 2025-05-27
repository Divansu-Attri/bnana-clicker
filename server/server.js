require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Socket.io server
const jwt = require('jsonwebtoken'); // For Socket.io authentication
const User = require('./models/User'); // User model

const app = express();
const server = http.createServer(app); // Create HTTP server for Express and Socket.io

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow your React app to connect
    methods: ['GET', 'POST','PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Make io accessible to Express routes (e.g., for emitting events from REST endpoints)
app.set('io', io);

const allowedOrigins = ['"https://bnana-clicker.vercel.app/", http://localhost:5173'];
// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- Socket.io Logic ---
io.use(async (socket, next) => {
  // Authenticate Socket.io connection using JWT token
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided.'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('Authentication error: User not found.'));
    }
    socket.user = user; // Attach user object to socket for later use
    next();
  } catch (error) {
    console.error('Socket.io authentication error:', error.message);
    next(new Error('Authentication error: Invalid token.'));
  }
});

io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  // Update user status to active in DB and notify others
  if (socket.user) {
    socket.user.isActive = true;
    await socket.user.save();
    io.emit('userStatusUpdate', { _id: socket.user._id, isActive: true });
  }

  // Emit initial rankings to the newly connected client
  const rankings = await User.find({ role: 'player' }).sort({ bananaCount: -1 }).select('username bananaCount _id');
  socket.emit('rankingUpdate', rankings);

  // Handle banana click event
  socket.on('bananaClick', async ({ userId }) => {
    try {
      // Ensure the clicking user is the authenticated user on the socket
      if (socket.user && socket.user._id.toString() === userId) {
        const user = await User.findById(userId);
        if (user && !user.isBlocked) {
          user.bananaCount += 1;
          await user.save();

          // Emit updated banana count to the specific user's dashboard
          io.to(socket.id).emit('bananaCountUpdate', user.toObject());

          // Emit updated banana count to admin dashboards
          io.emit('bananaCountUpdate', user.toObject()); // Admins will filter by user ID

          // Emit updated rankings to all clients (admin and player rank pages)
          const updatedRankings = await User.find({ role: 'player' }).sort({ bananaCount: -1 }).select('username bananaCount _id');
          io.emit('rankingUpdate', updatedRankings);
        }
      } else {
        console.warn('Unauthorized banana click attempt by:', socket.user ? socket.user.username : 'unknown');
      }
    } catch (error) {
      console.error('Error handling banana click:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.user ? socket.user.username : 'Unknown'} (${socket.id})`);
    // Update user status to inactive in DB and notify others
    if (socket.user) {
      socket.user.isActive = false;
      await socket.user.save();
      io.emit('userStatusUpdate', { _id: socket.user._id, isActive: false });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
