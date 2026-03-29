import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export interface Patient {
  id: number;
  uid?: string;
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
  uid?: string;
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
  uid?: string;
  email: string;
  role: 'patient' | 'caregiver';
  name: string;
}

export interface RegisterPatientData {
  name: string;
  email: string;
  password: string;
  age: number;
  diagnosis: string;
  dischargeDate: string;
  doctorName: string;
  phone: string;
  emergencyContact: string;
}

export interface RegisterCaregiverData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  patients: Patient[];
  caregivers: Caregiver[];
  checkIns: CheckIn[];
  tasks: Task[];
  caregiverNotes: CaregiverNote[];
  login: (email: string, password: string, role: 'patient' | 'caregiver') => Promise<boolean>;
  logout: () => Promise<void>;
  registerPatient: (data: RegisterPatientData) => Promise<void>;
  registerCaregiver: (data: RegisterCaregiverData) => Promise<void>;
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
// MOCK DATA - kept as demo fallback
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

  const checkIns: CheckIn[] = [];
  let checkInId = 1;
  patients.forEach(patient => {
    for (let day = 6; day >= 0; day--) {
      const checkInDate = new Date(today.getTime() - day * 24 * 60 * 60 * 1000);
      const basePain = Math.max(1, 7 - day + Math.floor(Math.random() * 2));
      const pain = patient.id === 3 && day < 2 ? 8 : basePain;
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
        id: checkInId++, patientId: patient.id, date: checkInDate.toISOString(), pain,
        temperature: 98.6 + (Math.random() * (patient.id === 3 && day < 2 ? 2 : 0.8)),
        temperatureUnit: 'F', fever: patient.id === 3 && day < 2, woundStatus, symptoms,
        otherSymptoms: '', mood, notes: day === 0 ? 'Feeling much better today!' : '', alertLevel
      });
    }
  });

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
      tasks.push({ id: taskId++, patientId: patient.id, title: template.title, time: template.time, icon: template.icon, completed: index < 2, date: todayStr });
    });
  });

  const caregiverNotes: CaregiverNote[] = [
    { id: 1, patientId: 3, caregiverId: 1, date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), content: "Patient reported increased shortness of breath. Contacted Dr. Williams for guidance. Advised to monitor closely and call if symptoms worsen.", tags: ['concern', 'follow-up'] },
    { id: 2, patientId: 2, caregiverId: 1, date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), content: "Some redness observed around surgical site. Patient applying prescribed antibiotic ointment. Scheduled follow-up appointment.", tags: ['wound', 'monitor'] }
  ];

  return { patients, caregivers, checkIns, tasks, caregiverNotes };
};

// Default tasks for new patients
const generateDefaultTasks = (patientId: number): Task[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  return [
    { id: Date.now(), patientId, title: "Take morning medication", time: "08:00", icon: "pill", completed: false, date: todayStr },
    { id: Date.now() + 1, patientId, title: "Take evening medication", time: "20:00", icon: "pill", completed: false, date: todayStr },
    { id: Date.now() + 2, patientId, title: "10-minute gentle walk", time: "10:00", icon: "footprints", completed: false, date: todayStr },
    { id: Date.now() + 3, patientId, title: "Check wound dressing", time: "12:00", icon: "bandage", completed: false, date: todayStr },
    { id: Date.now() + 4, patientId, title: "Drink 8 glasses of water", time: "Throughout day", icon: "droplet", completed: false, date: todayStr },
    { id: Date.now() + 5, patientId, title: "Physical therapy exercises", time: "15:00", icon: "dumbbell", completed: false, date: todayStr },
  ];
};

// ═══════════════════════════════════════════════════════════
// CONTEXT PROVIDER
// ═══════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [caregiverNotes, setCaregiverNotes] = useState<CaregiverNote[]>([]);
  const [patientsUnsubscribe, setPatientsUnsubscribe] = useState<(() => void) | null>(null);

  // Initialize mock data once
  useEffect(() => {
    const stored = localStorage.getItem('recoverai_patients');
    if (stored) {
      setPatients(JSON.parse(stored));
      setCaregivers(JSON.parse(localStorage.getItem('recoverai_caregivers') || '[]'));
      setCheckIns(JSON.parse(localStorage.getItem('recoverai_checkins') || '[]'));
      setTasks(JSON.parse(localStorage.getItem('recoverai_tasks') || '[]'));
      setCaregiverNotes(JSON.parse(localStorage.getItem('recoverai_notes') || '[]'));
    } else {
      const mock = generateMockData();
      setPatients(mock.patients);
      setCaregivers(mock.caregivers);
      setCheckIns(mock.checkIns);
      setTasks(mock.tasks);
      setCaregiverNotes(mock.caregiverNotes);
      localStorage.setItem('recoverai_patients', JSON.stringify(mock.patients));
      localStorage.setItem('recoverai_caregivers', JSON.stringify(mock.caregivers));
      localStorage.setItem('recoverai_checkins', JSON.stringify(mock.checkIns));
      localStorage.setItem('recoverai_tasks', JSON.stringify(mock.tasks));
      localStorage.setItem('recoverai_notes', JSON.stringify(mock.caregiverNotes));
    }
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userData: User = {
              id: Date.now(),
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: data.role,
              name: data.name,
            };
            setUser(userData);
            localStorage.setItem('recoverai_user', JSON.stringify(userData));

            if (data.role === 'patient') {
              await loadFirebasePatient(firebaseUser.uid, data);
            } else if (data.role === 'caregiver') {
              const unsub = await loadFirebaseCaregiver(firebaseUser.uid, data);
              setPatientsUnsubscribe(() => unsub);
            }
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      } else {
        if (patientsUnsubscribe) {
          patientsUnsubscribe();
          setPatientsUnsubscribe(null);
        }
        setUser(null);
        localStorage.removeItem('recoverai_user');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadFirebasePatient = async (uid: string, _data?: any) => {
    const patientDoc = await getDoc(doc(db, 'patients', uid));
    if (patientDoc.exists()) {
      const pData = patientDoc.data();
      const newPatient: Patient = {
        id: pData.numericId || Date.now(),
        uid,
        name: pData.name,
        email: pData.email,
        age: pData.age,
        diagnosis: pData.diagnosis,
        dischargeDate: pData.dischargeDate,
        caregiverId: pData.caregiverId || 0,
        doctorName: pData.doctorName,
        phone: pData.phone,
        emergencyContact: pData.emergencyContact,
      };
      setPatients(prev => {
        const exists = prev.find(p => p.uid === uid);
        if (exists) return prev;
        const updated = [...prev, newPatient];
        localStorage.setItem('recoverai_patients', JSON.stringify(updated));
        return updated;
      });
      // Load tasks for this patient
      const tasksSnap = await getDocs(collection(db, 'patients', uid, 'tasks'));
      if (tasksSnap.empty) {
        // Create default tasks
        const defaultTasks = generateDefaultTasks(newPatient.id);
        setTasks(prev => {
          const updated = [...prev, ...defaultTasks];
          localStorage.setItem('recoverai_tasks', JSON.stringify(updated));
          return updated;
        });
      }
    }
  };

  const loadFirebaseCaregiver = async (uid: string, _data?: any) => {
    const cgDoc = await getDoc(doc(db, 'caregivers', uid));
    if (cgDoc.exists()) {
      const cData = cgDoc.data();
      const newCaregiver: Caregiver = {
        id: cData.numericId || Date.now(),
        uid,
        name: cData.name,
        email: cData.email,
        phone: cData.phone,
        patients: cData.patients || [],
      };
      setCaregivers(prev => {
        const exists = prev.find(c => c.uid === uid);
        if (exists) return prev;
        const updated = [...prev, newCaregiver];
        localStorage.setItem('recoverai_caregivers', JSON.stringify(updated));
        return updated;
      });
    }

    // Real-time listener for all patients (so caregivers see new signups instantly)
    const unsubscribePatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const fetchedPatients: Patient[] = [];
      snapshot.forEach(pDoc => {
        const pData = pDoc.data();
        fetchedPatients.push({
          id: pData.numericId || Date.now(),
          uid: pDoc.id,
          name: pData.name,
          email: pData.email,
          age: pData.age,
          diagnosis: pData.diagnosis,
          dischargeDate: pData.dischargeDate,
          caregiverId: pData.caregiverId || 0,
          doctorName: pData.doctorName,
          phone: pData.phone,
          emergencyContact: pData.emergencyContact,
        });
      });

      setPatients(prev => {
        const updated = [...prev];
        fetchedPatients.forEach(fp => {
          const existingIndex = updated.findIndex(p => (p.uid === fp.uid) || (p.id === fp.id));
          if (existingIndex === -1) {
            updated.push(fp);
          } else {
            updated[existingIndex] = { ...updated[existingIndex], ...fp };
          }
        });
        localStorage.setItem('recoverai_patients', JSON.stringify(updated));
        return updated;
      });
    });

    return unsubscribePatients;
  };

  // ── REGISTER PATIENT ─────────────────────────────────────
  const registerPatient = async (data: RegisterPatientData) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const uid = cred.user.uid;
    const numericId = Date.now();

    const patientData = {
      uid, numericId,
      name: data.name, email: data.email, age: data.age,
      diagnosis: data.diagnosis, dischargeDate: data.dischargeDate,
      doctorName: data.doctorName, phone: data.phone,
      emergencyContact: data.emergencyContact, caregiverId: 0,
      createdAt: serverTimestamp(),
    };

    await Promise.all([
      setDoc(doc(db, 'users', uid), { role: 'patient', name: data.name, email: data.email, createdAt: serverTimestamp() }),
      setDoc(doc(db, 'patients', uid), patientData),
    ]);

    const newPatient: Patient = { ...patientData, id: numericId };
    setPatients(prev => {
      const updated = [...prev, newPatient];
      localStorage.setItem('recoverai_patients', JSON.stringify(updated));
      return updated;
    });

    const defaultTasks = generateDefaultTasks(numericId);
    setTasks(prev => {
      const updated = [...prev, ...defaultTasks];
      localStorage.setItem('recoverai_tasks', JSON.stringify(updated));
      return updated;
    });

    const userData: User = { id: numericId, uid, email: data.email, role: 'patient', name: data.name };
    setUser(userData);
    localStorage.setItem('recoverai_user', JSON.stringify(userData));
  };

  // ── REGISTER CAREGIVER ───────────────────────────────────
  const registerCaregiver = async (data: RegisterCaregiverData) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const uid = cred.user.uid;
    const numericId = Date.now();

    const caregiverData = {
      uid, numericId,
      name: data.name, email: data.email, phone: data.phone,
      patients: [], createdAt: serverTimestamp(),
    };

    await Promise.all([
      setDoc(doc(db, 'users', uid), { role: 'caregiver', name: data.name, email: data.email, createdAt: serverTimestamp() }),
      setDoc(doc(db, 'caregivers', uid), caregiverData),
    ]);

    const newCaregiver: Caregiver = { ...caregiverData, id: numericId };
    setCaregivers(prev => {
      const updated = [...prev, newCaregiver];
      localStorage.setItem('recoverai_caregivers', JSON.stringify(updated));
      return updated;
    });

    const userData: User = { id: numericId, uid, email: data.email, role: 'caregiver', name: data.name };
    setUser(userData);
    localStorage.setItem('recoverai_user', JSON.stringify(userData));
  };

  // ── LOGIN ────────────────────────────────────────────────
  const login = async (email: string, password: string, _role: 'patient' | 'caregiver'): Promise<boolean> => {
    // Firebase login
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // ── LOGOUT ───────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
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
    checkIns.filter(c => c.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getTasksForPatient = (patientId: number, date?: string) => {
    const today = date || new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.patientId === patientId && t.date === today);
  };
  const getNotesForPatient = (patientId: number) =>
    caregiverNotes.filter(n => n.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getPatientsForCaregiver = (caregiverId: number) => {
    const caregiver = caregivers.find(c => c.id === caregiverId);
    if (!caregiver) return [];
    return patients.filter(p => caregiver.patients.includes(p.id));
  };

  return (
    <AuthContext.Provider value={{
      user, loading, patients, caregivers, checkIns, tasks, caregiverNotes,
      login, logout, registerPatient, registerCaregiver,
      addCheckIn, updateTask, addCaregiverNote,
      getPatientById, getCheckInsForPatient, getTasksForPatient, getNotesForPatient, getPatientsForCaregiver
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
