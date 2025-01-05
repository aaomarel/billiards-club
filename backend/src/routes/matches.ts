import express, { Request, Response } from 'express';
import { Match } from '../models/Match';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { checkAdmin } from '../middleware/checkAdmin';
import { IMatch, MatchStatus } from '../types/match';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Create a new match
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const match = await Match.create({
      ...req.body,
      creator: req.userId,
      players: [req.userId] // Add creator as first player
    });
    
    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ message: 'Error creating match' });
  }
});

// Join a match
router.post('/:id/join', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id) as IMatch;
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    if (match.status !== 'open') {
      res.status(400).json({ message: 'Match is not open for joining' });
      return;
    }

    // Check if user is already in the match
    if (match.players.some(playerId => {
      const id = typeof playerId === 'string' ? playerId : playerId._id;
      return id.toString() === req.userId;
    })) {
      res.status(400).json({ message: 'You are already in this match' });
      return;
    }

    // Add player to match
    match.players.push(req.userId!);

    // If match is full, update status
    if ((match.type === '1v1' && match.players.length === 2) ||
        (match.type === '2v2' && match.players.length === 4)) {
      match.status = 'filled' as MatchStatus;
    }

    await match.save();
    res.json(match);
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({ message: 'Error joining match' });
  }
});

// Get all matches
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;

    // Build query based on user role
    const query = isAdmin ? {} : {
      $or: [
        { isDeleted: false },
        { 'players': req.userId }  // Allow users to see their own matches even if deleted
      ]
    };

    const matches = await Match.find(query)
      .sort({ datetime: 1 })
      .populate('creator', '_id name')  // Make sure _id is included
      .populate('players', '_id name'); // Make sure _id is included

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

// Cancel a match
router.post('/:id/cancel', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('creator', 'name')
      .populate('players', 'name') as IMatch;
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    // Only creator can cancel the match
    const creatorId = typeof match.creator === 'string' ? match.creator : match.creator._id.toString();
    if (creatorId !== req.userId) {
      res.status(403).json({ message: 'Only the creator can cancel this match' });
      return;
    }

    match.status = 'cancelled' as MatchStatus;
    await match.save();

    const updatedMatch = await Match.findById(match._id)
      .populate('creator', 'name')
      .populate('players', 'name');
    
    res.json(updatedMatch);
  } catch (error) {
    console.error('Error cancelling match:', error);
    res.status(500).json({ message: 'Error cancelling match' });
  }
});

// Leave a match
router.post('/:id/leave', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id) as IMatch;
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    // Check if match is open
    if (match.status !== 'open') {
      res.status(400).json({ message: 'Can only leave open matches' });
      return;
    }

    // Check if user is in the match
    const playerIndex = match.players.findIndex(
      playerId => (playerId as any).toString() === req.userId
    );

    if (playerIndex === -1) {
      res.status(400).json({ message: 'You are not in this match' });
      return;
    }

    // Don't allow creator to leave without cancelling
    if ((match.creator as any).toString() === req.userId) {
      res.status(400).json({ 
        message: 'Match creator must cancel the match instead of leaving' 
      });
      return;
    }

    // Remove player from match
    match.players = match.players.filter(
      playerId => (playerId as any).toString() !== req.userId
    );

    // Safe type assertion for status
    const currentStatus = match.status as MatchStatus;
    if (currentStatus === 'filled') {
      match.status = 'open' as MatchStatus;
    }

    await match.save();
    
    // Return updated match with populated fields
    const updatedMatch = await Match.findById(match._id)
      .populate('creator', 'name')
      .populate('players', 'name');
      
    res.json(updatedMatch);
  } catch (error) {
    console.error('Error leaving match:', error);
    res.status(500).json({ message: 'Error leaving match' });
  }
});

// Record match result
router.post('/:id/result', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id) as IMatch;
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
    return}

    // Check authorization
    const user = await User.findById(req.userId);
    if (!user) {
       res.status(404).json({ message: 'User not found' });
    return}

    // Only admins can record ranked match results
    if (match.isRanked && !user.isAdmin) {
       res.status(403).json({ message: 'Only admins can record ranked match results' });
    return}

    // For casual matches, only the creator or admins can record results
    if (!match.isRanked && 
        !user.isAdmin && 
        match.creator.toString() !== req.userId) {
       res.status(403).json({ 
        message: 'Only the match creator or admins can record casual match results' 
      });
    return}

    if (!req.userId) {
       res.status(400).json({ message: 'User ID is required' });
  return}
    match.result = {
      winners: req.body.winners,
      losers: req.body.losers,
      score: req.body.score,
      recordedBy: req.userId,
      recordedAt: new Date()
    };
    match.status = 'completed';
    
    await match.save();
    
    res.json(match);
  } catch (error) {
    console.error('Error recording match result:', error);
    res.status(500).json({ message: 'Error recording match result' });
  }
});

export default router;