import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import matchRoutes from './routes/matches';
import statsRoutes from './routes/stats';
import { Match } from './models/Match';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://spartanbilliards.netlify.app',
    process.env.CORS_ORIGIN
  ].filter((origin): origin is string => Boolean(origin)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' })); // Limit JSON payload size
app.use(compression());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Basic test route
app.get('/', (_req, res) => {
  res.json({ message: 'Billiards Club API is running' });
});

// Cleanup expired matches periodically
async function cleanupExpiredMatches() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Match.deleteMany({
      datetime: { $lt: oneDayAgo },
      status: { $in: ['pending', 'cancelled'] }
    });
    console.log('Cleaned up expired matches');
  } catch (error) {
    console.error('Error cleaning up matches:', error);
  }
}

// Run cleanup every 12 hours
setInterval(cleanupExpiredMatches, 12 * 60 * 60 * 1000);

// Connect to MongoDB with optimized settings
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://billiards-admin:YODYNFOvAXeuLjFu@cluster0.szqpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  console.error('MongoDB URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 5000;
  
  // Initial cleanup
  cleanupExpiredMatches();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Perform any cleanup here
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform any cleanup here
});

// Handle memory warnings
process.on('warning', (warning) => {
  if (warning.name === 'HeapSizeWarning') {
    console.warn('Memory warning:', warning);
    global.gc?.(); // Run garbage collection if available
  }
});

export default app;