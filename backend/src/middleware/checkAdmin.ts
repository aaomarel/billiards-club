 // In backend/src/middleware/checkAdmin.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { User } from '../models/User';

interface AuthRequest extends Request {
  userId?: string;
}

export const checkAdmin: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  } catch (e) {
    res.status(403).send({ error: 'Admin access required.' });
    return;
  }
};