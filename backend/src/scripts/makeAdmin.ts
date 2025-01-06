import mongoose from 'mongoose';
import { User } from '../models/User';

const MONGODB_URI = 'mongodb+srv://billiards-admin:YODYNFOvAXeuLjFu@cluster0.szqpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const email = 'aaomarel@uncg.edu';
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    console.log('User found, updating to head admin...');
    // Update user to be head admin
    user.isAdmin = true;
    user.role = 'head_admin';
    await user.save();

    console.log('Successfully updated user to head admin');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
