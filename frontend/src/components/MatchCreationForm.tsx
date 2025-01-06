import React, { useState } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
  Box
} from '@mui/material';
import { matches } from '../api';
import { formatInTimeZone } from 'date-fns-tz';

interface MatchFormData {
  type: '1v1' | '2v2';
  datetime: string;
  location: string;
  isRanked: boolean;
}

const MatchCreationForm: React.FC = () => {
  const locations = [
    'Pool Room',
    'Game Room',
    'Student Center',
    'Recreation Center'
  ];

  const [formData, setFormData] = useState<MatchFormData>({
    type: '1v1',
    datetime: '',
    location: locations[0],
    isRanked: true
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      isRanked: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Convert local datetime to UTC before sending to server
      const localDate = new Date(formData.datetime);
      const utcDate = formatInTimeZone(localDate, 'America/New_York', "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      
      await matches.create({
        ...formData,
        datetime: utcDate
      });

      setSuccess('Match created successfully!');
      setFormData({
        type: '1v1',
        datetime: '',
        location: locations[0],
        isRanked: true
      });
    } catch (err) {
      setError('Failed to create match. Please try again.');
      console.error('Error creating match:', err);
    }
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', maxWidth: '500px', margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
        Create a Match
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {success && (
        <Typography color="primary" gutterBottom>
          {success}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={formData.type}
            onChange={handleSelectChange}
            required
          >
            <MenuItem value="1v1">1v1</MenuItem>
            <MenuItem value="2v2">2v2</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label="Date and Time"
          type="datetime-local"
          name="datetime"
          value={formData.datetime}
          onChange={handleInputChange}
          InputLabelProps={{
            shrink: true,
          }}
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Location</InputLabel>
          <Select
            name="location"
            value={formData.location}
            onChange={handleSelectChange}
            required
          >
            {locations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={formData.isRanked}
              onChange={handleSwitchChange}
              name="isRanked"
              color="primary"
            />
          }
          label="Ranked Match"
          style={{ marginTop: '16px' }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '20px' }}
        >
          Create Match
        </Button>
      </form>
    </Paper>
  );
};

export default MatchCreationForm;