import React from 'react';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { People, DirectionsCar, Schedule } from '@mui/icons-material';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Driver Management',
      description: 'Create, edit, and manage driver accounts',
      icon: <People sx={{ fontSize: 40 }} />,
      path: '/admin/users',
      color: 'primary'
    },
    {
      title: 'Taxi Management',
      description: 'Register and manage taxi fleet',
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      path: '/admin/taxis',
      color: 'secondary'
    },
    {
      title: 'All Bookings',
      description: 'View and manage all shift bookings',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      path: '/admin/bookings',
      color: 'success'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Welcome to the Hammonia Taxi Shift Planner administration panel
      </Typography>
      
      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
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

export default AdminDashboard;