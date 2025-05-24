import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { format, isSameDay, isWithinInterval } from 'date-fns';

const ShiftBooking = () => {
  const [taxis, setTaxis] = useState([]);
  const [selectedTaxi, setSelectedTaxi] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const { currentUser } = useAuth();

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
      setTaxis(taxisData.filter(taxi => taxi.isActive));
    } catch (error) {
      console.error('Error fetching taxis:', error);
      setError('Failed to fetch taxis');
    }
  };

  const checkAvailability = async () => {
    if (!selectedTaxi || !startTime || !endTime || selectedDates.length === 0) {
      return;
    }

    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('taxiId', '==', selectedTaxi),
        where('status', '==', 'confirmed')
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      const existingBookings = querySnapshot.docs.map(doc => doc.data());

      const conflictingDates = [];
      
      selectedDates.forEach(date => {
        const dateString = format(date, 'yyyy-MM-dd');
        
        const hasConflict = existingBookings.some(booking => {
          if (!booking.dates.includes(dateString)) return false;
          
          const bookingStart = booking.startTime.toDate();
          const bookingEnd = booking.endTime.toDate();
          const newStart = new Date(date);
          newStart.setHours(startTime.getHours(), startTime.getMinutes());
          const newEnd = new Date(date);
          newEnd.setHours(endTime.getHours(), endTime.getMinutes());
          
          return (
            (newStart >= bookingStart && newStart < bookingEnd) ||
            (newEnd > bookingStart && newEnd <= bookingEnd) ||
            (newStart <= bookingStart && newEnd >= bookingEnd)
          );
        });
        
        if (hasConflict) {
          conflictingDates.push(dateString);
        }
      });

      if (conflictingDates.length > 0) {
        setError(`Taxi is not available on: ${conflictingDates.join(', ')}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Failed to check availability');
      return false;
    }
  };

  const validateShiftDuration = () => {
    if (!startTime || !endTime) return false;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    if (durationHours <= 0) {
      setError('End time must be after start time');
      return false;
    }
    
    if (durationHours > 10) {
      setError('Shift duration cannot exceed 10 hours');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      if (!validateShiftDuration()) return;
      
      const isAvailable = await checkAvailability();
      if (!isAvailable) return;

      const selectedTaxiData = taxis.find(taxi => taxi.id === selectedTaxi);
      
      await addDoc(collection(db, 'bookings'), {
        driverId: currentUser.uid,
        driverName: currentUser.displayName || currentUser.email,
        taxiId: selectedTaxi,
        plateNumber: selectedTaxiData.plateNumber,
        startTime: startTime,
        endTime: endTime,
        dates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSuccess('Shift booking created successfully!');
      
      // Reset form
      setSelectedTaxi('');
      setSelectedDates([]);
      setStartTime(null);
      setEndTime(null);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking: ' + error.message);
    }
  };

  const handleDateChange = (date) => {
    if (date && !selectedDates.some(d => isSameDay(d, date))) {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const removeDateChip = (dateToRemove) => {
    setSelectedDates(selectedDates.filter(date => !isSameDay(date, dateToRemove)));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Book a Shift
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Select Taxi"
              value={selectedTaxi}
              onChange={(e) => setSelectedTaxi(e.target.value)}
              required
            >
              {taxis.map((taxi) => (
                <MenuItem key={taxi.id} value={taxi.id}>
                  {taxi.plateNumber}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Add Date"
              value={null}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
              minDate={new Date()}
            />
          </Grid>

          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Dates:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {selectedDates.map((date, index) => (
                  <Chip
                    key={index}
                    label={format(date, 'yyyy-MM-dd')}
                    onDelete={() => removeDateChip(date)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={setEndTime}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!selectedTaxi || !startTime || !endTime || selectedDates.length === 0}
              size="large"
            >
              Book Shift
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </LocalizationProvider>
  );
};

export default ShiftBooking;