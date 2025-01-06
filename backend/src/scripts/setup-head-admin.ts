import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = 'mongodb+srv://billiards-admin:YODYNFOvAXeuLjFu@cluster0.szqpc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function setupHeadAdmin(email: string) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    console.log('User found, updating to head admin...');
    user.isAdmin = true;
    user.role = 'head_admin';
    await user.save();

    console.log(`Successfully set ${email} as head admin`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up head admin:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  console.error('Usage: ts-node setup-head-admin.ts <email>');
  process.exit(1);
}

setupHeadAdmin(email);
