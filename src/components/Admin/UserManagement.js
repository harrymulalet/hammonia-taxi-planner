import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Alert,
  Box,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    employeeType: 'Vollzeit Mitarbeiter'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const employeeTypes = ['Vollzeit Mitarbeiter', 'Aushilfe', 'Sonstiges'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData.filter(user => user.role === 'driver'));
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (selectedUser) {
        // Update existing user
        await updateDoc(doc(db, 'users', selectedUser.id), {
          fullName: formData.fullName,
          employeeType: formData.employeeType,
          updatedAt: new Date()
        });
        setSuccess('User updated successfully');
      } else {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        await addDoc(collection(db, 'users'), {
          email: formData.email,
          fullName: formData.fullName,
          role: 'driver',
          employeeType: formData.employeeType,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        setSuccess('User created successfully');
        
        // TODO: Send email with login credentials
        // This would require Firebase Functions or a third-party service
      }
      
      setOpenDialog(false);
      setSelectedUser(null);
      setFormData({
        email: '',
        fullName: '',
        password: '',
        employeeType: 'Vollzeit Mitarbeiter'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user: ' + error.message);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      password: '',
      employeeType: user.employeeType
    });
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Driver Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedUser(null);
            setFormData({
              email: '',
              fullName: '',
              password: '',
              employeeType: 'Vollzeit Mitarbeiter'
            });
            setOpenDialog(true);
          }}
        >
          Add Driver
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Employee Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.employeeType}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            margin="normal"
            disabled={selectedUser !== null}
            required
          />
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            margin="normal"
            required
          />
          {!selectedUser && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              margin="normal"
              required
            />
          )}
          <TextField
            fullWidth
            select
            label="Employee Type"
            value={formData.employeeType}
            onChange={(e) => setFormData({...formData, employeeType: e.target.value})}
            margin="normal"
          >
            {employeeTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;