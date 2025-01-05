import React from 'react';
import { Grid, Box, useTheme, alpha } from '@mui/material';
import {
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { StatValue, StatLabel, StatsCard } from '../common/StyledComponents';

interface StatsOverviewProps {
  totalMatches: number;
  winRate: number;
  currentStreak: number;
  ranking: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalMatches,
  winRate,
  currentStreak,
  ranking,
}) => {
  const theme = useTheme();

  const stats = [
    {
      icon: TimelineIcon,
      label: 'Total Matches',
      value: totalMatches,
      color: theme.palette.primary.main,
    },
    {
      icon: TrophyIcon,
      label: 'Win Rate',
      value: `${winRate}%`,
      color: theme.palette.secondary.main,
    },
    {
      icon: TrendingUpIcon,
      label: 'Current Streak',
      value: currentStreak,
      color: theme.palette.tertiary.main,
    },
    {
      icon: StarIcon,
      label: 'Ranking',
      value: `#${ranking}`,
      color: theme.palette.accent.main,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatsCard
            elevation={0}
            sx={{
              backgroundColor: alpha(stat.color, theme.palette.mode === 'light' ? 0.1 : 0.2),
              border: `1px solid ${alpha(stat.color, 0.2)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -15,
                right: -15,
                opacity: 0.1,
                transform: 'rotate(15deg)',
              }}
            >
              <stat.icon sx={{ fontSize: 100, color: stat.color }} />
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <StatValue sx={{ color: stat.color, mb: 1 }}>
                {stat.value}
              </StatValue>
              <StatLabel sx={{ color: theme.palette.text.primary }}>
                {stat.label}
              </StatLabel>
            </Box>
          </StatsCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsOverview;
