import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
}

const createAdmin = async (email: string) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const uri = "mongodb+srv://billiards-admin:d6koE7gWW9JWFCxA@cluster0.szqpc.mongodb.net/billiards-club?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    console.log(`Searching for user with email: ${email}`);
    const user = await User.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      console.log(`User not found with email: ${email}`);
      return;
    }

    console.log('Admin created successfully:', user.email);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdmin(email).catch(error => {
    console.error('Failed to execute createAdmin:', error);
    process.exit(1);
});

console.log('Script started with email:', email);