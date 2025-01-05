import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthRequest extends Request {
  userId?: string;
}

export const auth: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'your-secret-key') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Admin check middleware
export const checkAdmin: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.isAdmin && user?.role !== 'head_admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  } catch (e) {
    res.status(403).send({ error: 'Admin access required.' });
    return;
  }
};

// Head admin check middleware
export const checkHeadAdmin: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (user?.role !== 'head_admin') {
      res.status(403).json({ message: 'Head admin access required' });
      return;
    }
    next();
  } catch (e) {
    res.status(403).send({ error: 'Head admin access required.' });
    return;
  }
};

// Use these for admin routes
export const adminAuth = [auth, checkAdmin] as RequestHandler[];
export const headAdminAuth = [auth, checkHeadAdmin] as RequestHandler[];