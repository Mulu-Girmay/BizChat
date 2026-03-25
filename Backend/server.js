const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const connectDb = require('./config/db');
const { connectRedis } = require('./config/redis');
const { initSockets } = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Connect Databases
connectDb();
connectRedis();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRouter = require('./routes/authRoutes');
const chatRouter = require('./routes/chatRoutes');
const orderRouter = require('./routes/orderRoutes');
const inventoryRouter = require('./routes/inventoryRoutes');
const userRouter = require('./routes/userRoutes');
const storeRouter = require('./routes/storeRoutes');

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/orders', orderRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/users', userRouter);
app.use('/api/stores', storeRouter);

// Initialize Sockets
initSockets(io);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

