import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import LoginForm from './components/Auth/LoginForm';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminDashboard from './components/Admin/AdminDashboard';
import DriverDashboard from './components/Driver/DriverDashboard';
import UserManagement from './components/Admin/UserManagement';
import TaxiManagement from './components/Admin/TaxiManagement';
import ShiftBooking from './components/Driver/ShiftBooking';
import MyBookings from './components/Driver/MyBookings';
import { useAuth } from './contexts/AuthContext';

const Dashboard = () => {
  const { userRole } = useAuth();
  
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (userRole === 'driver') {
    return <Navigate to="/driver" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="taxis" element={<TaxiManagement />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/driver/*" element={
              <ProtectedRoute requiredRole="driver">
                <AppLayout>
                  <Routes>
                    <Route index element={<DriverDashboard />} />
                    <Route path="book" element={<ShiftBooking />} />
                    <Route path="bookings" element={<MyBookings />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;