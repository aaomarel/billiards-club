import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { matches } from '../../api';

const CreateMatch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '1v1' as '1v1' | '2v2',
    isRanked: false,
    datetime: new Date().toISOString(),
    location: ''
  });
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    // If user is not admin and tries to set ranked, prevent it
    if (name === 'isRanked' && value === "true" && !user?.isAdmin) {
      setError('Only admins can create ranked matches');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value === "true"
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      if (formData.isRanked && !user?.isAdmin) {
        setError('Only admins can create ranked matches');
        return;
      }

      await matches.create(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create match');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Match
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Match Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="Match Type"
              onChange={handleChange}
            >
              <MenuItem value="1v1">1v1</MenuItem>
              <MenuItem value="2v2">2v2</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Match Category</InputLabel>
            <Select
              name="isRanked"
              value={formData.isRanked ? "true" : "false"}
              label="Match Category"
              onChange={handleChange}
            >
              <MenuItem value="false">Casual</MenuItem>
              <MenuItem value="true" disabled={!user?.isAdmin}>Ranked</MenuItem>
            </Select>
            {!user?.isAdmin && (
              <FormHelperText>Only admins can create ranked matches</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              name="datetime"
              label="Match Date & Time"
              type="datetime-local"
              value={formData.datetime.slice(0, 16)}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                datetime: new Date(e.target.value).toISOString()
              }))}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              name="location"
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: e.target.value
              }))}
              fullWidth
            />
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Create Match
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateMatch;
