import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Box,
  SelectChangeEvent,
  Typography,
  FormHelperText
} from '@mui/material';

interface MatchResultFormProps {
  open: boolean;
  onClose: () => void;
  match: {
    _id: string;
    type: '1v1' | '2v2';
    isRanked: boolean;
    creator: {
      _id: string;
      name: string;
    };
    players: {
      _id: string;
      name: string;
    }[];
  };
  onSubmit: (result: {
    winners: string[];
    losers: string[];
    score?: string;
  }) => Promise<void>;
}

export default function MatchResultForm({ open, onClose, match, onSubmit }: MatchResultFormProps) {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
  const [winners, setWinners] = useState<string[]>([]);
  const [losers, setLosers] = useState<string[]>([]);
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreError, setScoreError] = useState('');

  const canRecordResult = user?.isAdmin || (!match.isRanked && match.creator._id === user?._id);

  const validateScore = (scoreValue: string) => {
    if (!scoreValue) return true; // Empty score is valid
    
    // Score should be in format "X-Y" where X and Y are numbers
    const scorePattern = /^\d+-\d+$/;
    if (!scorePattern.test(scoreValue)) {
      setScoreError('Score must be in format "X-Y" (e.g., "2-1")');
      return false;
    }

    const [winnerScore, loserScore] = scoreValue.split('-').map(Number);
    
    // In ranked matches, admin must input score
    if (match.isRanked && user?.isAdmin && !scoreValue) {
      setScoreError('Score is required for ranked matches');
      return false;
    }

    // Winner's score should be greater than loser's score
    if (winnerScore <= loserScore) {
      setScoreError('Winner\'s score must be greater than loser\'s score');
      return false;
    }

    setScoreError('');
    return true;
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = e.target.value;
    setScore(newScore);
    validateScore(newScore);
  };

  const handleWinnersChange = (event: SelectChangeEvent<string[]>) => {
    const selectedWinners = Array.isArray(event.target.value) 
      ? event.target.value 
      : [event.target.value];
    setWinners(selectedWinners);
    
    // Update losers to exclude selected winners
    setLosers(prev => prev.filter(id => !selectedWinners.includes(id)));
  };

  const handleLosersChange = (event: SelectChangeEvent<string[]>) => {
    const selectedLosers = Array.isArray(event.target.value) 
      ? event.target.value 
      : [event.target.value];
    setLosers(selectedLosers);
    
    // Update winners to exclude selected losers
    setWinners(prev => prev.filter(id => !selectedLosers.includes(id)));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setIsSubmitting(true);

      // Validate selections
      const expectedPlayers = match.type === '1v1' ? 2 : 4;
      if (winners.length + losers.length !== expectedPlayers) {
        setError(`Please select all ${expectedPlayers} players`);
        return;
      }

      // Validate score for ranked matches
      if (match.isRanked && user?.isAdmin) {
        if (!score) {
          setError('Score is required for ranked matches');
          return;
        }
        if (!validateScore(score)) {
          return;
        }
      }

      await onSubmit({
        winners,
        losers,
        score: score.trim() || undefined
      });

      // Reset form
      setWinners([]);
      setLosers([]);
      setScore('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record match result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlayers = [...winners, ...losers].length;
  const totalPlayers = match.type === '1v1' ? 2 : 4;
  const remainingPlayers = totalPlayers - selectedPlayers;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Match Result</DialogTitle>
      <DialogContent>
        {!canRecordResult ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {match.isRanked 
              ? 'Only admins can record ranked match results.'
              : 'Only the match creator or admins can record casual match results.'}
          </Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Winners</InputLabel>
              <Select
                multiple
                value={winners}
                onChange={handleWinnersChange}
                label="Winners"
                disabled={!canRecordResult}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(id => match.players.find(p => p._id === id)?.name).join(', ')}
                  </Box>
                )}
              >
                {match.players.map((player) => (
                  <MenuItem
                    key={player._id}
                    value={player._id}
                    disabled={losers.includes(player._id)}
                  >
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Losers</InputLabel>
              <Select
                multiple
                value={losers}
                onChange={handleLosersChange}
                label="Losers"
                disabled={!canRecordResult}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(id => match.players.find(p => p._id === id)?.name).join(', ')}
                  </Box>
                )}
              >
                {match.players.map((player) => (
                  <MenuItem
                    key={player._id}
                    value={player._id}
                    disabled={winners.includes(player._id)}
                  >
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }} error={!!scoreError}>
              <TextField
                label={`Score ${match.isRanked && user?.isAdmin ? '(Required)' : '(Optional)'}`}
                value={score}
                onChange={handleScoreChange}
                disabled={!canRecordResult}
                placeholder="e.g., 2-1"
                error={!!scoreError}
                helperText={scoreError || 'Format: Winner Score-Loser Score (e.g., 2-1)'}
              />
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            {remainingPlayers > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Select {remainingPlayers} more player{remainingPlayers !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!canRecordResult || isSubmitting || remainingPlayers > 0 || (match.isRanked && user?.isAdmin && !score)}
        >
          {isSubmitting ? 'Recording...' : 'Record Result'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}