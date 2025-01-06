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

  const getTrophyColor = (index: number) => {
    switch(index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return '#000000';
    }
  };

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
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: { xs: 2, sm: 4, md: 6 },
        height: 150,
        minWidth: { xs: '300px', sm: '400px', md: '500px' }
      }}>
        {/* Second Place */}
        {topPlayers[1] && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: 80, sm: 100, md: 120 },
            height: '80%'
          }}>
            <EmojiEventsIcon sx={{ 
              fontSize: { xs: 30, sm: 35 }, 
              color: getTrophyColor(1),
              mb: 0.5
            }} />
            <Avatar sx={{ 
              width: { xs: 45, sm: 50 }, 
              height: { xs: 45, sm: 50 },
              mb: 0.5,
              border: `2px solid ${getTrophyColor(1)}`
            }}>
              {topPlayers[1].name[0]}
            </Avatar>
            <Typography variant="body2" align="center" noWrap>
              {topPlayers[1].name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {topPlayers[1].stats.elo || 1200}
            </Typography>
          </Box>
        )}

        {/* First Place */}
        {topPlayers[0] && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: 90, sm: 110, md: 130 },
            height: '100%'
          }}>
            <EmojiEventsIcon sx={{ 
              fontSize: { xs: 35, sm: 40 }, 
              color: getTrophyColor(0),
              mb: 0.5
            }} />
            <Avatar sx={{ 
              width: { xs: 55, sm: 60 }, 
              height: { xs: 55, sm: 60 },
              mb: 0.5,
              border: `3px solid ${getTrophyColor(0)}`
            }}>
              {topPlayers[0].name[0]}
            </Avatar>
            <Typography variant="body1" align="center" noWrap>
              {topPlayers[0].name}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              {topPlayers[0].stats.elo || 1200}
            </Typography>
          </Box>
        )}

        {/* Third Place */}
        {topPlayers[2] && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: 70, sm: 90, md: 110 },
            height: '70%'
          }}>
            <EmojiEventsIcon sx={{ 
              fontSize: { xs: 25, sm: 30 }, 
              color: getTrophyColor(2),
              mb: 0.5
            }} />
            <Avatar sx={{ 
              width: { xs: 40, sm: 45 }, 
              height: { xs: 40, sm: 45 },
              mb: 0.5,
              border: `2px solid ${getTrophyColor(2)}`
            }}>
              {topPlayers[2].name[0]}
            </Avatar>
            <Typography variant="caption" align="center" noWrap>
              {topPlayers[2].name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {topPlayers[2].stats.elo || 1200}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default Podium;
