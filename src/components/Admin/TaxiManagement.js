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
  Typography,
  IconButton,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TaxiManagement = () => {
  const [taxis, setTaxis] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTaxi, setSelectedTaxi] = useState(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTaxis();
  }, []);

  const fetchTaxis = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'taxis'));
      const taxisData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTaxis(taxisData);
    } catch (error) {
      console.error('Error fetching taxis:', error);
      setError('Failed to fetch taxis');
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validate plate number format (e.g., HH-QQ 705)
      const plateRegex = /^[A-Z]{2}-[A-Z]{2}\s\d{3}$/;
      if (!plateRegex.test(plateNumber)) {
        setError('Please enter a valid plate number format (e.g., HH-QQ 705)');
        return;
      }

      if (selectedTaxi) {
        // Update existing taxi
        await updateDoc(doc(db, 'taxis', selectedTaxi.id), {
          plateNumber: plateNumber,
          updatedAt: new Date()
        });
        setSuccess('Taxi updated successfully');
      } else {
        // Create new taxi
        await addDoc(collection(db, 'taxis'), {
          plateNumber: plateNumber,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSuccess('Taxi created successfully');
      }
      
      setOpenDialog(false);
      setSelectedTaxi(null);
      setPlateNumber('');
      fetchTaxis();
    } catch (error) {
      console.error('Error saving taxi:', error);
      setError('Failed to save taxi: ' + error.message);
    }
  };

  const handleEdit = (taxi) => {
    setSelectedTaxi(taxi);
    setPlateNumber(taxi.plateNumber);
    setOpenDialog(true);
  };

  const handleDelete = async (taxiId) => {
    if (window.confirm('Are you sure you want to delete this taxi?')) {
      try {
        await deleteDoc(doc(db, 'taxis', taxiId));
        setSuccess('Taxi deleted successfully');
        fetchTaxis();
      } catch (error) {
        console.error('Error deleting taxi:', error);
        setError('Failed to delete taxi');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Taxi Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedTaxi(null);
            setPlateNumber('');
            setOpenDialog(true);
          }}
        >
          Add Taxi
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plate Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxis.map((taxi) => (
              <TableRow key={taxi.id}>
                <TableCell>{taxi.plateNumber}</TableCell>
                <TableCell>
                  <Chip 
                    label={taxi.isActive ? 'Active' : 'Inactive'} 
                    color={taxi.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(taxi)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(taxi.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTaxi ? 'Edit Taxi' : 'Add New Taxi'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Plate Number"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            margin="normal"
            placeholder="HH-QQ 705"
            helperText="Format: HH-QQ 705"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTaxi ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaxiManagement;