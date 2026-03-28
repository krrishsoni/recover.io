import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export interface Patient {
  id: number;
  name: string;
  email: string;
  age: number;
  diagnosis: string;
  dischargeDate: string;
  caregiverId: number;
  doctorName: string;
  avatar?: string;
  phone: string;
  emergencyContact: string;
}

export interface Caregiver {
  id: number;
  name: string;
  email: string;
  patients: number[];
  avatar?: string;
  phone: string;
}

export interface CheckIn {
  id: number;
  patientId: number;
  date: string;
  pain: number;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  fever: boolean;
  woundStatus: 'healing' | 'redness' | 'swelling' | 'concerning';
  symptoms: string[];
  otherSymptoms: string;
  mood: 'great' | 'good' | 'okay' | 'down' | 'struggling';
  notes: string;
  alertLevel: 'NORMAL' | 'MONITOR' | 'URGENT';
}

export interface Task {
  id: number;
  patientId: number;
  title: string;
  time: string;
  icon: string;
  completed: boolean;
  date: string;
}

export interface CaregiverNote {
  id: number;
  patientId: number;
  caregiverId: number;
  date: string;
  content: string;
  tags: string[];
}

interface User {
  id: number;
  email: string;
  role: 'patient' | 'caregiver';
  name: string;
}

interface AuthContextType {
  user: User | null;
  patients: Patient[];
  caregivers: Caregiver[];
  checkIns: CheckIn[];
  tasks: Task[];
  caregiverNotes: CaregiverNote[];
  login: (email: string, password: string, role: 'patient' | 'caregiver') => boolean;
  logout: () => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  updateTask: (taskId: number, completed: boolean) => void;
  addCaregiverNote: (note: Omit<CaregiverNote, 'id'>) => void;
  getPatientById: (id: number) => Patient | undefined;
  getCheckInsForPatient: (patientId: number) => CheckIn[];
  getTasksForPatient: (patientId: number, date?: string) => Task[];
  getNotesForPatient: (patientId: number) => CaregiverNote[];
  getPatientsForCaregiver: (caregiverId: number) => Patient[];
}

// ═══════════════════════════════════════════════════════════
// MOCK DATA - 3 Patients with 7 Days of History
// ═══════════════════════════════════════════════════════════

const generateMockData = () => {
  const today = new Date();
  
  const patients: Patient[] = [
    {
      id: 1,
      name: "Krrish Soni",
      email: "patient@demo.com",
      age: 45,
      diagnosis: "Knee Replacement Surgery",
      dischargeDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      caregiverId: 1,
      doctorName: "Dr. Emily Chen",
      phone: "+1 (555) 123-4567",
      emergencyContact: "+1 (555) 987-6543"
    },
    {
      id: 2,
      name: "Udayraj Vishwakarma",
      email: "mary@demo.com",
      age: 62,
      diagnosis: "Hip Replacement Surgery",
      dischargeDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      caregiverId: 1,
      doctorName: "Dr. Michael Ross",
      phone: "+1 (555) 234-5678",
      emergencyContact: "+1 (555) 876-5432"
    },
    {
      id: 3,
      name: "Shivansh Shukla",
      email: "robert@demo.com",
      age: 58,
      diagnosis: "Cardiac Bypass Surgery",
      dischargeDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      caregiverId: 1,
      doctorName: "Dr. Sarah Williams",
      phone: "+1 (555) 345-6789",
      emergencyContact: "+1 (555) 765-4321"
    }
  ];

  const caregivers: Caregiver[] = [
    {
      id: 1,
      name: "Sarah Wilson",
      email: "caregiver@demo.com",
      patients: [1, 2, 3],
      phone: "+1 (555) 456-7890"
    }
  ];

  // Generate 7 days of check-ins for each patient
  const checkIns: CheckIn[] = [];
  let checkInId = 1;

  patients.forEach(patient => {
    for (let day = 6; day >= 0; day--) {
      const checkInDate = new Date(today.getTime() - day * 24 * 60 * 60 * 1000);
      
      // Simulate improving recovery over time
      const basePain = Math.max(1, 7 - day + Math.floor(Math.random() * 2));
      const pain = patient.id === 3 && day < 2 ? 8 : basePain; // Simulate urgent case for patient 3
      
      const symptoms: string[] = [];
      if (Math.random() > 0.6) symptoms.push('fatigue');
      if (Math.random() > 0.8) symptoms.push('nausea');
      if (Math.random() > 0.85) symptoms.push('dizziness');
      if (patient.id === 3 && day < 2) symptoms.push('shortness of breath');

      const woundStatuses: CheckIn['woundStatus'][] = ['healing', 'healing', 'healing', 'redness'];
      const woundStatus = patient.id === 2 && day < 3 ? 'redness' : woundStatuses[Math.floor(Math.random() * woundStatuses.length)];

      const moods: CheckIn['mood'][] = ['great', 'good', 'okay', 'down', 'struggling'];
      const moodIndex = Math.min(4, Math.max(0, Math.floor(pain / 2)));
      const mood = moods[moodIndex];

      let alertLevel: CheckIn['alertLevel'] = 'NORMAL';
      if (pain > 7 || woundStatus === 'concerning') alertLevel = 'URGENT';
      else if (pain > 5 || symptoms.length > 2 || woundStatus === 'swelling') alertLevel = 'MONITOR';

      checkIns.push({
        id: checkInId++,
        patientId: patient.id,
        date: checkInDate.toISOString(),
        pain,
        temperature: 98.6 + (Math.random() * (patient.id === 3 && day < 2 ? 2 : 0.8)),
        temperatureUnit: 'F',
        fever: patient.id === 3 && day < 2,
        woundStatus,
        symptoms,
        otherSymptoms: '',
        mood,
        notes: day === 0 ? 'Feeling much better today!' : '',
        alertLevel
      });
    }
  });

  // Generate tasks for today
  const tasks: Task[] = [];
  let taskId = 1;
  const todayStr = today.toISOString().split('T')[0];

  const taskTemplates = [
    { title: "Take morning medication", time: "08:00", icon: "pill" },
    { title: "Take evening medication", time: "20:00", icon: "pill" },
    { title: "10-minute gentle walk", time: "10:00", icon: "footprints" },
    { title: "Check wound dressing", time: "12:00", icon: "bandage" },
    { title: "Drink 8 glasses of water", time: "Throughout day", icon: "droplet" },
    { title: "Physical therapy exercises", time: "15:00", icon: "dumbbell" }
  ];

  patients.forEach(patient => {
    taskTemplates.forEach((template, index) => {
      tasks.push({
        id: taskId++,
        patientId: patient.id,
        title: template.title,
        time: template.time,
        icon: template.icon,
        completed: index < 2, // First 2 tasks completed
        date: todayStr
      });
    });
  });

  const caregiverNotes: CaregiverNote[] = [
    {
      id: 1,
      patientId: 3,
      caregiverId: 1,
      date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      content: "Patient reported increased shortness of breath. Contacted Dr. Williams for guidance. Advised to monitor closely and call if symptoms worsen.",
      tags: ['concern', 'follow-up']
    },
    {
      id: 2,
      patientId: 2,
      caregiverId: 1,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      content: "Some redness observed around surgical site. Patient applying prescribed antibiotic ointment. Scheduled follow-up appointment.",
      tags: ['wound', 'monitor']
    }
  ];

  return { patients, caregivers, checkIns, tasks, caregiverNotes };
};

// ═══════════════════════════════════════════════════════════
// CONTEXT PROVIDER
// ═══════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [caregiverNotes, setCaregiverNotes] = useState<CaregiverNote[]>([]);

  // Initialize data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('recoverai_user');
    const storedPatients = localStorage.getItem('recoverai_patients');
    const storedCaregivers = localStorage.getItem('recoverai_caregivers');
    const storedCheckIns = localStorage.getItem('recoverai_checkins');
    const storedTasks = localStorage.getItem('recoverai_tasks');
    const storedNotes = localStorage.getItem('recoverai_notes');

    if (storedPatients && storedCaregivers && storedCheckIns && storedTasks) {
      setPatients(JSON.parse(storedPatients));
      setCaregivers(JSON.parse(storedCaregivers));
      setCheckIns(JSON.parse(storedCheckIns));
      setTasks(JSON.parse(storedTasks));
      setCaregiverNotes(storedNotes ? JSON.parse(storedNotes) : []);
    } else {
      const mockData = generateMockData();
      setPatients(mockData.patients);
      setCaregivers(mockData.caregivers);
      setCheckIns(mockData.checkIns);
      setTasks(mockData.tasks);
      setCaregiverNotes(mockData.caregiverNotes);
      
      localStorage.setItem('recoverai_patients', JSON.stringify(mockData.patients));
      localStorage.setItem('recoverai_caregivers', JSON.stringify(mockData.caregivers));
      localStorage.setItem('recoverai_checkins', JSON.stringify(mockData.checkIns));
      localStorage.setItem('recoverai_tasks', JSON.stringify(mockData.tasks));
      localStorage.setItem('recoverai_notes', JSON.stringify(mockData.caregiverNotes));
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string, role: 'patient' | 'caregiver'): boolean => {
    if (password !== 'pass123') return false;

    if (role === 'patient' && email === 'patient@demo.com') {
      const patient = patients.find(p => p.email === email);
      if (patient) {
        const userData = { id: patient.id, email, role, name: patient.name };
        setUser(userData);
        localStorage.setItem('recoverai_user', JSON.stringify(userData));
        return true;
      }
    }

    if (role === 'caregiver' && email === 'caregiver@demo.com') {
      const caregiver = caregivers.find(c => c.email === email);
      if (caregiver) {
        const userData = { id: caregiver.id, email, role, name: caregiver.name };
        setUser(userData);
        localStorage.setItem('recoverai_user', JSON.stringify(userData));
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('recoverai_user');
  };

  const addCheckIn = (checkIn: Omit<CheckIn, 'id'>) => {
    const newCheckIn = { ...checkIn, id: checkIns.length + 1 };
    const updated = [...checkIns, newCheckIn];
    setCheckIns(updated);
    localStorage.setItem('recoverai_checkins', JSON.stringify(updated));
  };

  const updateTask = (taskId: number, completed: boolean) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed } : t);
    setTasks(updated);
    localStorage.setItem('recoverai_tasks', JSON.stringify(updated));
  };

  const addCaregiverNote = (note: Omit<CaregiverNote, 'id'>) => {
    const newNote = { ...note, id: caregiverNotes.length + 1 };
    const updated = [...caregiverNotes, newNote];
    setCaregiverNotes(updated);
    localStorage.setItem('recoverai_notes', JSON.stringify(updated));
  };

  const getPatientById = (id: number) => patients.find(p => p.id === id);

  const getCheckInsForPatient = (patientId: number) => 
    checkIns.filter(c => c.patientId === patientId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const getTasksForPatient = (patientId: number, date?: string) => {
    const today = date || new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.patientId === patientId && t.date === today);
  };

  const getNotesForPatient = (patientId: number) =>
    caregiverNotes.filter(n => n.patientId === patientId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const getPatientsForCaregiver = (caregiverId: number) => {
    const caregiver = caregivers.find(c => c.id === caregiverId);
    if (!caregiver) return [];
    return patients.filter(p => caregiver.patients.includes(p.id));
  };

  return (
    <AuthContext.Provider value={{
      user,
      patients,
      caregivers,
      checkIns,
      tasks,
      caregiverNotes,
      login,
      logout,
      addCheckIn,
      updateTask,
      addCaregiverNote,
      getPatientById,
      getCheckInsForPatient,
      getTasksForPatient,
      getNotesForPatient,
      getPatientsForCaregiver
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
