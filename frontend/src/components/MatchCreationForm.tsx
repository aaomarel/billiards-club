import React, { useState } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface MatchFormData {
  type: '1v1' | '2v2';
  datetime: string;
  location: string;
  isRanked: string;
}

const MatchCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MatchFormData>({
    type: '1v1',
    datetime: '',
    location: '',
    isRanked: 'false'
  });

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in first');
      }

      const response = await fetch('http://localhost:5002/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          isRanked: formData.isRanked === 'true'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create match');
      }

      const data = await response.json();
      console.log('Match created:', data);
      navigate('/');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New Match
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Match Type</InputLabel>
          <Select
            name="type"
            value={formData.type}
            label="Match Type"
            onChange={handleSelectChange}
          >
            <MenuItem value="1v1">1v1</MenuItem>
            <MenuItem value="2v2">2v2</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Date and Time"
          type="datetime-local"
          name="datetime"
          value={formData.datetime}
          onChange={handleInputChange}
          margin="normal"
          InputLabelProps={{
            shrink: true
          }}
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Location</InputLabel>
          <Select
            name="location"
            value={formData.location}
            label="Location"
            onChange={handleSelectChange}
            required
          >
            <MenuItem value="Student Center - Table 1">Student Center - Table 1</MenuItem>
            <MenuItem value="Student Center - Table 2">Student Center - Table 2</MenuItem>
            <MenuItem value="Recreation Center - Table 1">Recreation Center - Table 1</MenuItem>
            <MenuItem value="Recreation Center - Table 2">Recreation Center - Table 2</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Match Type</InputLabel>
          <Select
            name="isRanked"
            value={formData.isRanked}
            label="Match Type"
            onChange={handleSelectChange}
          >
            <MenuItem value="false">Casual Match</MenuItem>
            <MenuItem value="true">Ranked Match</MenuItem>
          </Select>
        </FormControl>

        <Button 
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Creating Match...' : 'Create Match'}
        </Button>
      </Box>
    </Paper>
  );
};

export default MatchCreationForm;