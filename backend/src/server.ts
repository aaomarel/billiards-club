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

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
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
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    const PORT = process.env.PORT ?? 5002;
    
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