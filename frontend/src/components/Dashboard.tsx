import React, { useState, useEffect } from "react";
import MatchResultForm from "./MatchResultForm";
import {
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  AvatarGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Grid,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import RefreshIcon from "@mui/icons-material/Refresh";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Podium from "./Podium";
import { matches } from '../api';

interface Player {
  _id: string;
  name: string;
}

interface Match {
  _id: string;
  type: "1v1" | "2v2";
  datetime: string;
  location: string;
  status: "open" | "filled" | "cancelled" | "completed";
  isRanked: boolean;
  creator: Player;
  players: Player[];
  score?: string;
}

interface Filters {
  type: string;
  isRanked: string;
  status: string;
}

const getChipColor = (status: string) => {
  if (status === "open") return "success";
  if (status === "filled") return "primary";
  return "default";
};

const Dashboard: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatchToCancel, setSelectedMatchToCancel] = useState<
    string | null
  >(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [cancellingMatch, setCancellingMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningMatch, setJoiningMatch] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [leavingMatch, setLeavingMatch] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    isRanked: "all",
    status: "open",
  });
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await matches.getAll();
      setMatchList(response.data);
      setFilteredMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matchList, filters]);

  const filterMatches = () => {
    let filtered = [...matchList];

    if (filters.type !== "all") {
      filtered = filtered.filter((match) => match.type === filters.type);
    }

    if (filters.isRanked !== "all") {
      filtered = filtered.filter(
        (match) => match.isRanked === (filters.isRanked === "true")
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((match) => match.status === filters.status);
    }

    setFilteredMatches(filtered);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCancelClick = (matchId: string) => {
    setSelectedMatchToCancel(matchId);
    setDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedMatchToCancel) {
      await handleCancelMatch(selectedMatchToCancel);
      setDialogOpen(false);
      setSelectedMatchToCancel(null);
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    try {
      await matches.join(matchId);
      fetchMatches(); // Refresh the list
      setSuccess('Successfully joined match');
    } catch (error) {
      console.error('Error joining match:', error);
      setError('Failed to join match');
    }
  };

  const handleLeaveMatch = async (matchId: string) => {
    try {
      await matches.leave(matchId);
      fetchMatches(); // Refresh the list
      setSuccess('Successfully left match');
    } catch (error) {
      console.error('Error leaving match:', error);
      setError('Failed to leave match');
    }
  };

  const handleCancelMatch = async (matchId: string) => {
    try {
      await matches.cancel(matchId);
      fetchMatches(); // Refresh the list
      setSuccess('Successfully cancelled match');
    } catch (error) {
      console.error('Error cancelling match:', error);
      setError('Failed to cancel match');
    }
  };

  const handleRecordResult = async (result: {
    winners: string[];
    losers: string[];
    score?: string;
  }) => {
    try {
      if (selectedMatch?._id) {
        await matches.recordResult(selectedMatch._id, result);
      } else {
        throw new Error('Match ID is undefined');
      }
      fetchMatches(); // Refresh the list
      setSuccess('Successfully recorded match result');
    } catch (error) {
      console.error('Error recording result:', error);
      setError('Failed to record result');
    }
  };

  const getMatchCapacity = (match: Match) => {
    const maxPlayers = match.type === "1v1" ? 2 : 4;
    return `${match.players.length}/${maxPlayers}`;
  };

  const isUserInMatch = (match: Match) => {
    const userId = localStorage.getItem("userId");
    return match.players.some((player) => player._id === userId);
  };

  const canRecordResult = (match: Match) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null;
    if (!user) return false;
    
    // Only admins can record ranked match results
    if (match.isRanked) return user.isAdmin;
    
    // For casual matches, creator or admin can record
    return user.isAdmin || match.creator._id === user._id;
  };

  const toggleMatchExpansion = (matchId: string) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      <Podium />
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <SportsEsportsIcon />
          Available Matches
        </Typography>
        <IconButton
          onClick={fetchMatches}
          disabled={loading}
          color="primary"
          size="large"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
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
            <InputLabel>Match Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              label="Match Status"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="filled">Filled</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {filteredMatches.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "background.default",
          }}
        >
          <SportsEsportsIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            No matches available right now.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMatches.map((match) => (
            <Grid item xs={12} sm={6} md={4} key={match._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                  onClick={() => toggleMatchExpansion(match._id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {match.type} Match
                      {match.isRanked && (
                        <Tooltip title="Ranked Match">
                          <EmojiEventsIcon color="primary" />
                        </Tooltip>
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={match.status}
                        color={getChipColor(match.status)}
                        sx={{
                          textTransform: "capitalize",
                          fontWeight: "medium",
                        }}
                      />
                      {expandedMatchId === match._id ? (
                        <ExpandLessIcon color="action" />
                      ) : (
                        <ExpandMoreIcon color="action" />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled{" "}
                      {formatDistanceToNow(new Date(match.datetime), {
                        addSuffix: true,
                      })}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      📍 {match.location}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Players {getMatchCapacity(match)}
                    </Typography>
                    <AvatarGroup
                      max={4}
                      sx={{
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          fontSize: "0.875rem",
                        },
                      }}
                    >
                      {match.players.map((player) => (
                        <Tooltip title={player.name} key={player._id}>
                          <Avatar
                            sx={{
                              bgcolor:
                                player._id === match.creator._id
                                  ? "primary.main"
                                  : "secondary.main",
                            }}
                          >
                            {player.name.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>

                  <Collapse in={expandedMatchId === match._id}>
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ my: 2 }} />
                      <List dense disablePadding>
                        <ListItem>
                          <ListItemText
                            primary="Match Type"
                            secondary={`${match.type} ${match.isRanked ? '(Ranked)' : '(Casual)'}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Teams/Sides"
                            secondary={match.type === '1v1' ? 'Singles Match' : 'Doubles Match'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Players"
                            secondary={match.players.map(p => p.name).join(', ') || 'No players yet'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Created By"
                            secondary={match.creator.name}
                          />
                        </ListItem>
                        {match.status === 'completed' && (
                          <ListItem>
                            <ListItemText
                              primary="Score"
                              secondary={match.score || 'Not recorded'}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  </Collapse>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {isUserInMatch(match) ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => handleLeaveMatch(match._id)}
                      disabled={
                        leavingMatch === match._id || match.status !== "open"
                      }
                    >
                      {leavingMatch === match._id ? "Leaving..." : "Leave Match"}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleJoinMatch(match._id)}
                      disabled={
                        match.status !== "open" || joiningMatch === match._id
                      }
                    >
                      {joiningMatch === match._id ? "Joining..." : "Join Match"}
                    </Button>
                  )}
                  {match.creator._id === localStorage.getItem("userId") &&
                    match.status === "open" && (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelClick(match._id)}
                        disabled={cancellingMatch === match._id}
                        sx={{ mt: 1 }}
                      >
                        {cancellingMatch === match._id
                          ? "Cancelling..."
                          : "Cancel Match"}
                      </Button>
                    )}
                  {match.status === "filled" && canRecordResult(match) && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<EmojiEventsIcon />}
                      onClick={() => {
                        setSelectedMatch(match);
                        setResultDialogOpen(true);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Record Result
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {selectedMatch && (
        <MatchResultForm
          open={resultDialogOpen}
          onClose={() => {
            setResultDialogOpen(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
          onSubmit={handleRecordResult}
        />
      )}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>
          Are you sure you want to cancel this match?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>No</Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Yes, Cancel Match
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
