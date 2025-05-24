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
  Alert,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchMyBookings();
  }, [currentUser]);

  const fetchMyBookings = async () => {
    if (!currentUser) return;

    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('driverId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date, newest first
      bookingsData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch your bookings');
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        setSuccess('Booking cancelled successfully');
        fetchMyBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        setError('Failed to cancel booking');
      }
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Bookings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Taxi</TableCell>
              <TableCell>Date(s)</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.plateNumber}</TableCell>
                <TableCell>
                  {booking.dates?.length > 1 
                    ? `${booking.dates.length} dates`
                    : booking.dates?.[0] || 'N/A'
                  }
                </TableCell>
                <TableCell>
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={booking.status} 
                    color={booking.status === 'confirmed' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(booking)}>
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(booking.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Taxi:</strong> {selectedBooking.plateNumber}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Time:</strong> {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Dates:</strong>
              </Typography>
              <Box ml={2}>
                {selectedBooking.dates?.map((date, index) => (
                  <Typography key={index} variant="body2">
                    • {date}
                  </Typography>
                ))}
              </Box>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                <strong>Status:</strong> {selectedBooking.status}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Booked on:</strong> {formatDate(selectedBooking.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyBookings;