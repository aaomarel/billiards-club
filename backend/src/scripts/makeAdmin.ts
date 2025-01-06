import mongoose from 'mongoose';
import { User } from '../models/User';

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/billiards-club');
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: 'aaomarel@uncg.edu' });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    // Update user to be head admin
    user.isAdmin = true;
    user.role = 'head_admin';
    await user.save();

    console.log('Successfully updated user to head admin');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
