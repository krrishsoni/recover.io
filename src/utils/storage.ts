// LocalStorage utilities for RecoverAI

const STORAGE_KEYS = {
  USER: 'recoverai_user',
  CHECK_INS: 'recoverai_checkins',
  TASKS: 'recoverai_tasks',
  NOTES: 'recoverai_notes',
  SETTINGS: 'recoverai_settings'
} as const;

// Generic storage functions
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
};

// User session management
export interface UserSession {
  id: number;
  role: 'patient' | 'caregiver';
  name: string;
  email: string;
  avatar: string;
}

export const saveUserSession = (user: UserSession): void => {
  setToStorage(STORAGE_KEYS.USER, user);
};

export const getUserSession = (): UserSession | null => {
  return getFromStorage<UserSession | null>(STORAGE_KEYS.USER, null);
};

export const clearUserSession = (): void => {
  removeFromStorage(STORAGE_KEYS.USER);
};

// Check-ins management
import { CheckIn, initialCheckIns } from '../data/mockData';

export const getCheckIns = (): CheckIn[] => {
  return getFromStorage(STORAGE_KEYS.CHECK_INS, initialCheckIns);
};

export const saveCheckIn = (checkIn: CheckIn): void => {
  const checkIns = getCheckIns();
  checkIns.push(checkIn);
  setToStorage(STORAGE_KEYS.CHECK_INS, checkIns);
};

export const getPatientCheckIns = (patientId: number): CheckIn[] => {
  return getCheckIns().filter(c => c.patientId === patientId);
};

export const getTodayCheckIn = (patientId: number): CheckIn | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return getCheckIns().find(c => 
    c.patientId === patientId && c.date.startsWith(today)
  );
};

// Tasks management
import { Task, initialTasks } from '../data/mockData';

export const getTasks = (): Task[] => {
  return getFromStorage(STORAGE_KEYS.TASKS, initialTasks);
};

export const saveTasks = (tasks: Task[]): void => {
  setToStorage(STORAGE_KEYS.TASKS, tasks);
};

export const getPatientTasks = (patientId: number, date?: string): Task[] => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  return getTasks().filter(t => t.patientId === patientId && t.date === targetDate);
};

export const updateTaskCompletion = (taskId: number, completed: boolean): void => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = completed;
    saveTasks(tasks);
  }
};

// Caregiver notes management
import { CaregiverNote, initialCaregiverNotes } from '../data/mockData';

export const getNotes = (): CaregiverNote[] => {
  return getFromStorage(STORAGE_KEYS.NOTES, initialCaregiverNotes);
};

export const saveNote = (note: CaregiverNote): void => {
  const notes = getNotes();
  notes.push(note);
  setToStorage(STORAGE_KEYS.NOTES, notes);
};

export const getPatientNotes = (patientId: number): CaregiverNote[] => {
  return getNotes().filter(n => n.patientId === patientId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Settings management
export interface UserSettings {
  emailNotifications: boolean;
  smsAlerts: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  alertThreshold: 'low' | 'medium' | 'high';
}

const defaultSettings: UserSettings = {
  emailNotifications: true,
  smsAlerts: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  alertThreshold: 'medium'
};

export const getSettings = (): UserSettings => {
  return getFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
};

export const saveSettings = (settings: UserSettings): void => {
  setToStorage(STORAGE_KEYS.SETTINGS, settings);
};

// Initialize storage with mock data if empty
export const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.CHECK_INS)) {
    setToStorage(STORAGE_KEYS.CHECK_INS, initialCheckIns);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    setToStorage(STORAGE_KEYS.TASKS, initialTasks);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    setToStorage(STORAGE_KEYS.NOTES, initialCaregiverNotes);
  }
};
