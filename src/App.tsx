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
import CaregiverVoiceAssistant from './components/CaregiverVoiceAssistant';
import VoiceAssistant from './components/VoiceAssistant';
import RegisterPage from './pages/RegisterPage';

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'white', color: 'red', padding: '20px', overflow: 'auto' }}>
          <h1>Something went wrong in the component.</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{(this.state.error && this.state.error.toString())}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{(this.state.error && this.state.error.stack)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles?: ('patient' | 'caregiver')[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
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
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
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
        
        <ErrorBoundary>
          <CaregiverVoiceAssistant />
          <VoiceAssistant />
        </ErrorBoundary>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
