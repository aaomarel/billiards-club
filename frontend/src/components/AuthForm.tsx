import React, { useState } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Tabs, 
  Tab,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { User } from "../App";
import { auth } from '../api';

interface AuthFormProps {
  onAuthSuccess: (token: string, userId: string, userData: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    studentId: ''
  });
  const [error, setError] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = tab === 0 
        ? await auth.login(formData.email, formData.password)
        : await auth.register(formData);
      
      console.log('Server response:', response.data); // Debug log
      
      const { token, userId, user } = response.data;
      
      // Check the structure of what we received
      console.log('Extracted data:', { token, userId, user });
      
      if (!token || !userId) {
        throw new Error('Invalid response from server');
      }

      // If we don't have a user object but have other user data, construct it
      const userData = user || {
        _id: userId,
        name: response.data.name,
        email: response.data.email,
        studentId: response.data.studentId,
        isAdmin: response.data.isAdmin,
        role: response.data.role || 'member',
        stats: response.data.stats || {
          wins: 0,
          losses: 0,
          elo: 1200,
          gamesPlayed: 0
        }
      };

      localStorage.setItem('token', token);
      onAuthSuccess(token, userId, userData);
      navigate('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      console.error('Full error object:', err); // Debug log
      setError(err.message || 'Authentication failed');
      // Clear any partial data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Login" />
        <Tab label="Register" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {tab === 1 && (
          <>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              margin="normal"
              required
            />
          </>
        )}
        
        <TextField
          fullWidth
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
        />

        <Button 
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Processing...' : (tab === 0 ? 'Login' : 'Create Account')}
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthForm;