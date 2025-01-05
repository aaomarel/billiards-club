import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import matchRoutes from './routes/matches';
import statsRoutes from './routes/stats';
import { Match } from './models/Match';

dotenv.config();

const app = express();

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
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/stats', statsRoutes);

// Basic test route
app.get('/', (_req, res) => {
  res.json({ message: 'Billiards Club API is running' });
});

const cleanupExpiredMatches = async () => {
  try {
    const now = new Date();
    await Match.updateMany(
      {
        datetime: { $lt: now },
        status: { $in: ['open', 'filled'] },
        isDeleted: false
      },
      { 
        $set: { 
          isDeleted: true,
          status: 'cancelled'
        }
      }
    );
  } catch (error) {
    console.error('Error cleaning up matches:', error);
  }
};

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://billiards-admin:YODYNFOvAXeuLjFu@cluster0.szqpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('MongoDB connected successfully');
  const PORT = process.env.PORT || 5000;
  
  // Run cleanup every hour
  setInterval(cleanupExpiredMatches, 1000 * 60 * 60);
  
  // Initial cleanup
  cleanupExpiredMatches();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

export default app;