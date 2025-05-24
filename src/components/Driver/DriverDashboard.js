import React from 'react';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddCircle, Schedule } from '@mui/icons-material';

const DriverDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Book a Shift',
      description: 'Book new taxi shifts for upcoming dates',
      icon: <AddCircle sx={{ fontSize: 40 }} />,
      path: '/driver/book',
      color: 'primary'
    },
    {
      title: 'My Bookings',
      description: 'View and manage your existing bookings',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      path: '/driver/bookings',
      color: 'secondary'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Driver Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Welcome to your shift planning dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box color={`${item.color}.main`} mb={2}>
                  {item.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {item.description}
                </Typography>
                <Button 
                  variant="contained" 
                  color={item.color}
                  onClick={() => navigate(item.path)}
                  fullWidth
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DriverDashboard;