import mongoose, { Document, Model, Types } from 'mongoose';

interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  studentId: string;
  isAdmin: boolean;
  role: 'member' | 'admin' | 'head_admin';
  stats: {
    wins: number;
    losses: number;
    elo: number;
    gamesPlayed: number;
  };
}

interface IUserDocument extends Omit<IUser, '_id'>, Document {}

interface IUserModel extends Model<IUserDocument> {}

const userSchema = new mongoose.Schema<IUserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['member', 'admin', 'head_admin'], default: 'member' },
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    elo: { type: Number, default: 1200 },
    gamesPlayed: { type: Number, default: 0 }
  }
}, { timestamps: true });

export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export type { IUser, IUserDocument };