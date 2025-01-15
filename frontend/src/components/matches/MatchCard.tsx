import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Room as LocationIcon,
  PersonAdd as JoinIcon,
  ExitToApp as LeaveIcon,
  Group as TeamIcon,
  EmojiEvents as TrophyIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ContentCard } from '../common/StyledComponents';
import { format, isFuture } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { MatchStatus } from '../../types';

interface Player {
  _id: string;
  name: string;
  stats?: {
    elo: number;
    gamesPlayed: number;
  };
}

interface MatchCardProps {
  id: string;
  dateTime: string;
  location: string;
  gameType: '1v1' | '2v2';
  matchType: 'ranked' | 'casual';
  players: Player[];
  maxPlayers: number;
  status: MatchStatus;
  createdBy: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onCancel?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  dateTime,
  location,
  gameType,
  matchType,
  players,
  maxPlayers,
  status,
  createdBy,
  currentUserId,
  isAdmin,
  onJoin,
  onLeave,
  onCancel,
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return theme.palette.info.main;
      case 'ongoing':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.tertiary.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTimeDisplay = () => {
    const utcDate = new Date(dateTime);
    const estTime = toZonedTime(utcDate, 'America/New_York');
    const formattedTime = format(estTime, 'MMM d, yyyy h:mm a z');
    return isFuture(estTime) ? `Scheduled for ${formattedTime}` : `Scheduled at ${formattedTime}`;
  };

  const getMatchTypeColor = () => {
    return matchType === 'ranked' 
      ? theme.palette.secondary.main 
      : theme.palette.primary.main;
  };

  return (
    <ContentCard
      sx={{
        backgroundColor: alpha(getStatusColor(), 0.05),
        borderColor: alpha(getStatusColor(), 0.2),
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={status.replace('_', ' ').toUpperCase()}
            size="small"
            sx={{
              backgroundColor: alpha(getStatusColor(), 0.1),
              color: getStatusColor(),
              fontWeight: 600,
            }}
          />
          <Chip
            label={matchType.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: alpha(getMatchTypeColor(), 0.1),
              color: getMatchTypeColor(),
              fontWeight: 600,
            }}
          />
          <Chip
            label={gameType}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.text.primary, 0.1),
              color: theme.palette.text.primary,
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimeIcon color="action" />
          <Typography variant="body2">
            {getTimeDisplay()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="action" />
          <Typography variant="body2">{location}</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Players ({players.length}/{maxPlayers})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {players.map((player) => (
            <Chip
              key={player._id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{player.name || 'Unknown player'}</span>
                  {matchType === 'ranked' && player.stats && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.75rem',
                        color: theme.palette.tertiary.main,
                        fontWeight: 600,
                      }}
                    >
                      ({player.stats.elo || 1200})
                    </Typography>
                  )}
                </Box>
              }
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            />
          ))}
        </Box>
      </Box>

      {status === 'pending' && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 2, 
          gap: 1,
          '& .MuiIconButton-root': {
            width: 40,
            height: 40,
            padding: '8px',
            '& svg': {
              width: 24,
              height: 24,
            },
          },
        }}>
          {/* Show Join button if user hasn't joined and there's space */}
          {currentUserId && 
           !players.some(p => p._id === currentUserId) && 
           players.length < maxPlayers && (
            <Tooltip title="Join Match">
              <IconButton
                onClick={onJoin}
                sx={{
                  color: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                  },
                }}
              >
                <JoinIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Show Leave button if user has joined and is not the creator */}
          {currentUserId && 
           players.some(p => p._id === currentUserId) && 
           createdBy !== currentUserId && (
            <Tooltip title="Leave Match">
              <IconButton
                onClick={onLeave}
                sx={{
                  color: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  },
                }}
              >
                <LeaveIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Show Cancel button if user is creator or admin */}
          {currentUserId && 
           (createdBy === currentUserId || isAdmin) && (
            <Tooltip title="Cancel Match">
              <IconButton
                onClick={onCancel}
                sx={{
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </ContentCard>
  );
};

export default MatchCard;
