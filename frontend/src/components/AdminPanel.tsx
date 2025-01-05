import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface AdminPanelProps {
  user: User | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  isAdmin: boolean;
  role: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user: currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; userId: string; makeAdmin: boolean}>({
    open: false,
    userId: '',
    makeAdmin: false
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5002/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdminToggle = (userId: string, makeAdmin: boolean) => {
    // Only head admin can modify admin privileges
    if (currentUser?.role !== 'head_admin') {
      setError('Only head admin can modify admin privileges');
      return;
    }
    setConfirmDialog({ open: true, userId, makeAdmin });
  };

  const updateAdminStatus = async (userId: string, makeAdmin: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5002/api/auth/${makeAdmin ? 'make-admin' : 'remove-admin'}/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update admin status');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isAdmin: updatedUser.isAdmin } : user
      ));
      
      setSuccessMessage(`Successfully ${makeAdmin ? 'granted' : 'removed'} admin privileges for ${updatedUser.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update admin status. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleConfirmDialog = async (confirmed: boolean) => {
    if (confirmed) {
      await updateAdminStatus(confirmDialog.userId, confirmDialog.makeAdmin);
    }
    setConfirmDialog({ open: false, userId: '', makeAdmin: false });
  };

  const renderAdminControls = (user: User) => {
    // Don't show toggle for head admin or for non-head admins
    if (user.role === 'head_admin' || currentUser?.role !== 'head_admin') {
      return null;
    }

    return (
      <Button
        variant="contained"
        color={user.isAdmin ? "secondary" : "primary"}
        onClick={() => handleAdminToggle(user._id, !user.isAdmin)}
      >
        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
      </Button>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Admin Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.studentId}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isAdmin ? "Admin" : "User"}
                      color={user.isAdmin ? "secondary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {renderAdminControls(user)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={confirmDialog.open} onClose={() => handleConfirmDialog(false)}>
        <DialogTitle>Confirm Admin Privilege Removal</DialogTitle>
        <DialogContent>
          Are you sure you want to remove admin privileges from this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialog(false)}>Cancel</Button>
          <Button onClick={() => handleConfirmDialog(true)} color="error">
            Remove Admin
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminPanel;
