// In src/types/match.ts
import { Document } from 'mongoose';

export type MatchStatus = 'open' | 'filled' | 'cancelled' | 'completed';
export type MatchType = '1v1' | '2v2';

export interface IPlayer {
  _id: string;
  name: string;
  stats?: {
    elo: number;
    gamesPlayed: number;
  };
}

export interface IMatchResult {
  winners: string[];  // Array of user IDs
  losers: string[];   // Array of user IDs
  score?: string;     // Optional score recording
  recordedBy: string; // Admin who recorded the result
  recordedAt: Date;
}

export interface IMatch extends Document {
  type: MatchType;
  datetime: Date;
  location: string;
  creator: IPlayer | string;
  players: (IPlayer | string)[];
  status: MatchStatus;
  isRanked: boolean;
  result?: IMatchResult;
  duration: number; // Duration of the match in minutes
}