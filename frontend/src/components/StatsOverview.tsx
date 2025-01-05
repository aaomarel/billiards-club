import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Card, CardContent, CardHeader, Grid, Typography,
  Box, Table, TableBody, TableCell, TableHead,
  TableRow, Tabs, Tab, CircularProgress, Alert,
  Select, MenuItem, FormControl, InputLabel,
  SelectChangeEvent
} from '@mui/material';
import getUserStats from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface MatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  matchHistory: Array<{
    date: string;
    type: '1v1' | '2v2';
    result: 'win' | 'loss';
    opponent: string;
    score?: string;
  }>;
  performanceByMonth: Array<{
    month: string;
    wins: number;
    losses: number;
    winRate: number;
  }>;
}

const StatsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeframe, setTimeframe] = useState('all');
  const userId = 1; // assuming userId is defined somewhere

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await getUserStats(`/stats/${userId}`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeframe]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No stats available yet. Play some matches to see your statistics!
      </Alert>
    );
  }

  const winRateData = [
    { name: 'Wins', value: stats.wins },
    { name: 'Losses', value: stats.losses }
  ];

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Player Statistics
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={handleTimeframeChange}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="year">Past Year</MenuItem>
            <MenuItem value="month">Past Month</MenuItem>
            <MenuItem value="week">Past Week</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={4}>
        {/* Overview Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Overall Performance" />
            <CardContent>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winRateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {winRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h6">
                  Win Rate: {(stats.winRate * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Matches: {stats.totalMatches}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Trends */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Performance Trends" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.performanceByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="winRate" 
                      stroke="#8884d8" 
                      name="Win Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Match History */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Recent Matches" />
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Opponent</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.matchHistory.map((match, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell>{match.type}</TableCell>
                      <TableCell>{match.opponent}</TableCell>
                      <TableCell>
                        <Typography sx={{ 
                          fontWeight: 'bold',
                          color: match.result === 'win' ? 'success.main' : 'error.main'
                        }}>
                          {match.result.toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>{match.score || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsOverview;