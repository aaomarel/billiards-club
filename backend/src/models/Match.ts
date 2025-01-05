import mongoose from 'mongoose';
import { IMatch, MatchStatus, MatchType } from '../types/match';

const matchResultSchema = new mongoose.Schema({
  winners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  losers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  score: {
    type: String,
    required: false
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
});

const matchSchema = new mongoose.Schema({
  isDeleted: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    required: true,
    enum: ['1v1', '2v2'] as MatchType[]
  },
  datetime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'filled', 'cancelled', 'completed'] as MatchStatus[],
    default: 'open'
  },
  isRanked: {
    type: Boolean,
    default: false
  },
  result: {
    type: matchResultSchema,
    required: false
  }
}, { timestamps: true });

export const Match = mongoose.model<IMatch>('Match', matchSchema);