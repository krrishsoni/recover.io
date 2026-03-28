import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { patients, caregivers, Patient, Caregiver } from '../data/mockData';
import { getUserSession, saveUserSession, clearUserSession, initializeStorage, UserSession } from '../utils/storage';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'patient' | 'caregiver') => boolean;
  logout: () => void;
  getPatientData: () => Patient | null;
  getCaregiverData: () => Caregiver | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with mock data
    initializeStorage();
    
    // Check for existing session
    const session = getUserSession();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, role: 'patient' | 'caregiver'): boolean => {
    if (role === 'patient') {
      const patient = patients.find(p => p.email === email && p.password === password);
      if (patient) {
        const session: UserSession = {
          id: patient.id,
          role: 'patient',
          name: patient.name,
          email: patient.email,
          avatar: patient.avatar
        };
        saveUserSession(session);
        setUser(session);
        return true;
      }
    } else if (role === 'caregiver') {
      const caregiver = caregivers.find(c => c.email === email && c.password === password);
      if (caregiver) {
        const session: UserSession = {
          id: caregiver.id,
          role: 'caregiver',
          name: caregiver.name,
          email: caregiver.email,
          avatar: caregiver.avatar
        };
        saveUserSession(session);
        setUser(session);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    clearUserSession();
    setUser(null);
  };

  const getPatientData = (): Patient | null => {
    if (user?.role === 'patient') {
      return patients.find(p => p.id === user.id) || null;
    }
    return null;
  };

  const getCaregiverData = (): Caregiver | null => {
    if (user?.role === 'caregiver') {
      return caregivers.find(c => c.id === user.id) || null;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      getPatientData,
      getCaregiverData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
