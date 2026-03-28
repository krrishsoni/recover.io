import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import DailyCheckIn from './pages/DailyCheckIn';
import CaregiverDashboard from './pages/CaregiverDashboard';
import PatientDetail from './pages/PatientDetail';
import SettingsPage from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles?: ('patient' | 'caregiver')[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'caregiver' ? '/caregiver' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Public Route (redirects if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to={user.role === 'caregiver' ? '/caregiver' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      {/* Patient Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/checkin" element={
        <ProtectedRoute allowedRoles={['patient']}>
          <DailyCheckIn />
        </ProtectedRoute>
      } />

      {/* Caregiver Routes */}
      <Route path="/caregiver" element={
        <ProtectedRoute allowedRoles={['caregiver']}>
          <CaregiverDashboard />
        </ProtectedRoute>
      } />
      <Route path="/caregiver/patients" element={
        <ProtectedRoute allowedRoles={['caregiver']}>
          <CaregiverDashboard />
        </ProtectedRoute>
      } />
      <Route path="/caregiver/patient/:id" element={
        <ProtectedRoute allowedRoles={['caregiver']}>
          <PatientDetail />
        </ProtectedRoute>
      } />

      {/* Shared Routes */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              padding: '16px 24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              fontWeight: 500
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff'
              }
            }
          }}
        />
        
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
