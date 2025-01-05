import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function setupHeadAdmin(email: string) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/billiards-club');
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    user.isAdmin = true;
    user.role = 'head_admin';
    await user.save();

    console.log(`Successfully set ${email} as head admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting up head admin:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

setupHeadAdmin(email);
