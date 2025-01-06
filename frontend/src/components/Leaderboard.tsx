import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { API_ENDPOINT } from '../config';

interface PlayerStats {
  _id: string;
  name: string;
  stats: {
    rankedWins: number;
    rankedLosses: number;
    rankedWinRate: number;
    elo: number;
  };
}

const Leaderboard = () => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINT}/stats/leaderboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setPlayers(data);
    } catch (err: any) {
      console.error('Leaderboard error:', err);
      setError(err.message || 'Error loading leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const sortedPlayers = [...players].sort((a, b) => 
    (b.stats.elo || 1200) - (a.stats.elo || 1200)
  );

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Ranked Leaderboard
      </Typography>

      <TableContainer component={Paper} sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align="right">Elo Rating</TableCell>
              <TableCell align="right">Wins</TableCell>
              <TableCell align="right">Losses</TableCell>
              <TableCell align="right">Win Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPlayers.map((player, index) => (
              <TableRow 
                key={player._id}
                sx={{ 
                  bgcolor: index < 3 ? 'action.hover' : 'inherit',
                  '& > *': { fontWeight: index < 3 ? 'bold' : 'inherit' },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell align="right" sx={{ 
                  color: theme => {
                    const elo = player.stats.elo || 1200;
                    if (elo >= 1500) return theme.palette.success.main;
                    if (elo >= 1300) return theme.palette.info.main;
                    return 'inherit';
                  }
                }}>
                  {player.stats.elo || 1200}
                </TableCell>
                <TableCell align="right">{player.stats.rankedWins}</TableCell>
                <TableCell align="right">{player.stats.rankedLosses}</TableCell>
                <TableCell align="right">
                  {(player.stats.rankedWinRate * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Leaderboard;