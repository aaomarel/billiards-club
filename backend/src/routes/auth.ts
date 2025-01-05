import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Model } from 'mongoose';
import { User, IUser, IUserDocument } from '../models/User';
import { auth, checkHeadAdmin } from '../middleware/auth';

// Extend the Express Request type
interface CustomRequest extends Request {
  userId?: string;
}

const router = express.Router();

// Register endpoint
router.post('/register', async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, studentId } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
       res.status(400).json({ message: 'User already exists' });
    return}

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      studentId
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      isAdmin: user.isAdmin,
      role: user.role,
      stats: user.stats
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
router.post('/login', async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
       res.status(400).json({ message: 'User not found' });
    return}

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
       res.status(400).json({ message: 'Invalid credentials' });
    return}

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      isAdmin: user.isAdmin,
      role: user.role,
      stats: user.stats
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make user admin (only accessible by head admin)
router.post('/make-admin/:userId', auth, checkHeadAdmin, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    // Get the requesting admin user
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.role !== 'head_admin') {
      res.status(403).json({ message: 'Only head admin can modify admin privileges' });
      return;
    }

    const user = await User.findById(req.params.userId).exec();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Don't allow modifying head admin
    if (user.role === 'head_admin') {
      res.status(403).json({ message: 'Cannot modify head admin privileges' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, { isAdmin: true, role: 'admin' }, { new: true });
    res.json({ 
      message: 'User is now an admin',
      userId: updatedUser?._id,
      name: updatedUser?.name,
      isAdmin: updatedUser?.isAdmin,
      role: updatedUser?.role
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove admin status (only accessible by head admin)
router.post('/remove-admin/:userId', auth, checkHeadAdmin, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    // Get the requesting admin user
    const adminUser = await User.findById(req.userId);
    if (!adminUser || adminUser.role !== 'head_admin') {
      res.status(403).json({ message: 'Only head admin can modify admin privileges' });
      return;
    }

    const user = await User.findById(req.params.userId).exec();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Don't allow modifying head admin
    if (user.role === 'head_admin') {
      res.status(403).json({ message: 'Cannot modify head admin privileges' });
      return;
    }

    // Don't allow admins to remove their own admin status
    if ((user.get('_id') as mongoose.Types.ObjectId).toString() === req.userId) {
      res.status(403).json({ message: 'Cannot remove your own admin privileges' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, { isAdmin: false, role: 'member' }, { new: true });
    res.json({ 
      message: 'Admin status removed',
      userId: updatedUser?._id,
      name: updatedUser?.name,
      isAdmin: updatedUser?.isAdmin,
      role: updatedUser?.role
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (only accessible by admins)
router.get('/users', auth, checkHeadAdmin, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user data
router.get('/me', auth, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      isAdmin: user.isAdmin,
      role: user.role,
      stats: user.stats
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
