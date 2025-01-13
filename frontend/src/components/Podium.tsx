import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { stats } from '../api';

interface TopPlayer {
  _id: string;
  name: string;
  stats: {
    elo: number;
  };
}

const Podium: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await stats.getLeaderboard();
      const sortedPlayers = response.data.sort((a: TopPlayer, b: TopPlayer) => 
        (b.stats.elo || 1200) - (a.stats.elo || 1200)
      ).slice(0, 3);
      setTopPlayers(sortedPlayers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 2,
        mb: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        maxWidth: 800,
        mx: 'auto'
      }}
    >
      <Typography variant="h6" align="center" gutterBottom sx={{ mb: 2 }}>
        Top Players
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 2,
      }}>
        {topPlayers.map((player, index) => (
          <Box
            key={player._id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              p: 2,
              borderRadius: 1,
              bgcolor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
            }}
          >
            {index === 0 ? (
              <EmojiEventsIcon
                sx={{
                  fontSize: 32,
                  color: 'warning.main',
                }}
              />
            ) : (
              <Typography
                variant="h5"
                sx={{
                  width: 32,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {index + 1}
              </Typography>
            )}
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {player.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Rating: {player.stats.elo || 1200}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default Podium;
