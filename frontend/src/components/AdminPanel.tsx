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
import { auth } from '../api';

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
    setLoading(true);
    try {
      const response = await auth.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdminToggle = (userId: string, makeAdmin: boolean) => {
    // Only admins can modify admin privileges
    if (!currentUser?.isAdmin) {
      setError('Only admins can modify admin privileges');
      return;
    }
    setConfirmDialog({ open: true, userId, makeAdmin });
  };

  const handleAdminStatusChange = async (userId: string, makeAdmin: boolean) => {
    try {
      await auth.updateAdminStatus(userId, makeAdmin);
      fetchUsers(); // Refresh the list
      setSuccessMessage(`Successfully ${makeAdmin ? 'made user admin' : 'removed admin status'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating admin status:', error);
      setError('Failed to update admin status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleConfirmDialog = async (confirmed: boolean) => {
    if (confirmed) {
      await handleAdminStatusChange(confirmDialog.userId, confirmDialog.makeAdmin);
    }
    setConfirmDialog({ open: false, userId: '', makeAdmin: false });
  };

  const renderAdminControls = (user: User) => {
    // Don't show toggle for head admin or for non-admins
    if (user.role === 'head_admin' || !currentUser?.isAdmin) {
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
        <DialogTitle>
          {confirmDialog.makeAdmin 
            ? "Confirm Admin Privilege Grant"
            : "Confirm Admin Privilege Removal"
          }
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.makeAdmin 
              ? "Are you sure you want to grant admin privileges to this user?"
              : "Are you sure you want to remove admin privileges from this user?"
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialog(false)}>Cancel</Button>
          <Button onClick={() => handleConfirmDialog(true)} color="error">
            {confirmDialog.makeAdmin ? "Grant Admin" : "Remove Admin"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminPanel;
