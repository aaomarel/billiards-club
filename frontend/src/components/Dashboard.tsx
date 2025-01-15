import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import { matches } from "../api";
import { Match } from "../types";
import MatchCard from "./matches/MatchCard";
import Podium from "./Podium";
import { PageContainer } from "./common/StyledComponents";
import { User } from "../App";  // Import the User interface

const Dashboard: React.FC = () => {
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    isRanked: "all",
  });
  const [user, setUser] = useState<User | null>(null);

  const fetchMatches = async () => {
    try {
      const response = await matches.getAll();
      setMatchList(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Validate the user data before setting it
        if (userData && userData._id && userData.name) {
          setUser(userData);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const filteredMatches = matchList.filter((match) => {
    if (filters.type !== "all" && match.type !== filters.type) return false;
    if (filters.status !== "all" && match.status !== filters.status) return false;
    if (filters.isRanked !== "all" && match.isRanked.toString() !== filters.isRanked)
      return false;
    return true;
  });

  return (
    <PageContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Available Matches
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => window.location.href = '/create-match'}
                >
                  Create Match
                </Button>
                <IconButton onClick={fetchMatches} disabled={loading} color="primary" size="large">
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Match Type</InputLabel>
                  <Select
                    name="type"
                    value={filters.type}
                    label="Match Type"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="1v1">1v1</MenuItem>
                    <MenuItem value="2v2">2v2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    label="Status"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="filled">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Match Ranking</InputLabel>
                  <Select
                    name="isRanked"
                    value={filters.isRanked}
                    label="Match Ranking"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="all">All Matches</MenuItem>
                    <MenuItem value="true">Ranked</MenuItem>
                    <MenuItem value="false">Casual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {filteredMatches.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Matches Available
              </Typography>
              <Typography color="text.secondary">
                Be the first to create a new match!
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredMatches.map((match) => (
                <Grid item xs={12} sm={6} md={6} key={match._id}>
                  <MatchCard
                    id={match._id}
                    dateTime={match.datetime}
                    location={match.location}
                    gameType={match.type}
                    matchType={match.isRanked ? 'ranked' : 'casual'}
                    players={match.players.map(id => ({ _id: id, name: id }))}
                    maxPlayers={match.type === '1v1' ? 2 : 4}
                    status={match.status}
                    onJoin={() => matches.join(match._id)}
                    onLeave={() => matches.leave(match._id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, bgcolor: "background.default" }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Top Players
            </Typography>
            <Podium />
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
