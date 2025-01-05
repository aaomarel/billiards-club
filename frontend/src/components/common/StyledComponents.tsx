import { styled } from '@mui/material/styles';
import { Box, Card, Paper, Typography } from '@mui/material';
import { getThemedElevation } from '../../theme/theme';

export const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

export const ContentCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  boxShadow: getThemedElevation(theme, 1),
  '&:hover': {
    boxShadow: getThemedElevation(theme, 2),
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

export const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  margin: theme.spacing(1),
  textAlign: 'center',
  backgroundColor: theme.palette.mode === 'light' 
    ? theme.palette.primary.main 
    : theme.palette.primary.dark,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.text.primary,
  fontSize: '1.25rem',
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(3),
    fontSize: '1.5rem',
  },
}));

export const GradientBackground = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'light'
    ? `linear-gradient(135deg, 
        ${theme.palette.primary.light}15, 
        ${theme.palette.secondary.light}15)`
    : `linear-gradient(135deg, 
        ${theme.palette.primary.dark}30, 
        ${theme.palette.secondary.dark}30)`,
  minHeight: '100vh',
  width: '100vw',
  overflowX: 'hidden',
}));

export const MatchCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  width: '100%',
  '&:hover': {
    borderLeft: `4px solid ${theme.palette.secondary.main}`,
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: theme.palette.primary.contrastText,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2rem',
  },
}));

export const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.primary.contrastText,
  opacity: 0.9,
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.875rem',
  },
}));

export const AnimatedButton = styled('button')(({ theme }) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: theme.spacing(1),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5),
  },
}));
