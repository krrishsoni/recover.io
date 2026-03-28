// Mock data for RecoverAI application

export interface Patient {
  id: number;
  name: string;
  email: string;
  password: string;
  age: number;
  diagnosis: string;
  dischargeDate: string;
  caregiverId: number;
  doctorName: string;
  avatar: string;
  phone: string;
}

export interface Caregiver {
  id: number;
  name: string;
  email: string;
  password: string;
  patients: number[];
  avatar: string;
  phone: string;
}

export interface CheckIn {
  id: number;
  patientId: number;
  date: string;
  pain: number;
  temperature: number;
  fever: boolean;
  woundStatus: 'healing' | 'redness' | 'swelling' | 'concerning';
  symptoms: string[];
  mood: 'great' | 'okay' | 'sad' | 'anxious' | 'angry';
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

export const patients: Patient[] = [
  {
    id: 1,
    name: "Krrish Soni",
    email: "patient@demo.com",
    password: "pass123",
    age: 45,
    diagnosis: "Knee Replacement",
    dischargeDate: "2024-01-10",
    caregiverId: 1,
    doctorName: "Dr. Emily Chen",
    avatar: "JS",
    phone: "+1 (555) 123-4567"
  },
  {
    id: 2,
    name: "Udayraj Vishwakarma",
    email: "udayraj@demo.com",
    password: "pass123",
    age: 62,
    diagnosis: "Hip Surgery",
    dischargeDate: "2024-01-12",
    caregiverId: 1,
    doctorName: "Dr. Michael Brown",
    avatar: "UV",
    phone: "+1 (555) 234-5678"
  },
  {
    id: 3,
    name: "Shivansh Shukla",
    email: "shivansh@demo.com",
    password: "pass123",
    age: 58,
    diagnosis: "Cardiac Procedure",
    dischargeDate: "2024-01-08",
    caregiverId: 1,
    doctorName: "Dr. Sarah Wilson",
    avatar: "SS",
    phone: "+1 (555) 345-6789"
  }
];

export const caregivers: Caregiver[] = [
  {
    id: 1,
    name: "Sarah Wilson",
    email: "caregiver@demo.com",
    password: "pass123",
    patients: [1, 2, 3],
    avatar: "SW",
    phone: "+1 (555) 987-6543"
  }
];

// Generate check-ins for the past 7 days for each patient
const generateCheckIns = (): CheckIn[] => {
  const checkIns: CheckIn[] = [];
  const now = new Date();
  let checkInId = 1;

  patients.forEach(patient => {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(18, 30, 0, 0);

      // Generate realistic varying data
      const pain = Math.floor(Math.random() * 6) + (i > 4 ? 3 : 1);
      const fever = i > 5 && Math.random() > 0.7;
      const woundOptions: CheckIn['woundStatus'][] = ['healing', 'healing', 'redness', 'healing'];
      const woundStatus = woundOptions[Math.floor(Math.random() * woundOptions.length)];
      const symptomOptions = ['fatigue', 'nausea', 'dizziness', 'difficulty sleeping'];
      const symptoms = symptomOptions.filter(() => Math.random() > 0.7);
      const moodOptions: CheckIn['mood'][] = ['great', 'okay', 'sad', 'anxious', 'okay'];
      const mood = moodOptions[Math.floor(Math.random() * moodOptions.length)];

      let alertLevel: CheckIn['alertLevel'] = 'NORMAL';
      if (pain > 7 || fever || woundStatus === 'concerning') {
        alertLevel = 'URGENT';
      } else if (pain > 5 || symptoms.length > 2 || woundStatus === 'swelling') {
        alertLevel = 'MONITOR';
      }

      checkIns.push({
        id: checkInId++,
        patientId: patient.id,
        date: date.toISOString(),
        pain,
        temperature: fever ? 100.4 + Math.random() : 98.2 + Math.random() * 0.8,
        fever,
        woundStatus,
        symptoms,
        mood,
        notes: i === 0 ? '' : ['Feeling better today', 'Some discomfort but manageable', 'Good progress', 'Rested well'][Math.floor(Math.random() * 4)],
        alertLevel
      });
    }
  });

  return checkIns;
};

// Generate tasks for each patient
const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  const today = new Date().toISOString().split('T')[0];
  let taskId = 1;

  const taskTemplates = [
    { title: "Take morning medication", time: "08:00", icon: "pill" },
    { title: "Take evening medication", time: "20:00", icon: "pill" },
    { title: "Walk for 10 minutes", time: "10:00", icon: "footprints" },
    { title: "Check wound dressing", time: "12:00", icon: "bandage" },
    { title: "Drink 8 glasses of water", time: "All day", icon: "droplet" },
    { title: "Do physical therapy exercises", time: "14:00", icon: "dumbbell" }
  ];

  patients.forEach(patient => {
    taskTemplates.forEach((template, index) => {
      tasks.push({
        id: taskId++,
        patientId: patient.id,
        title: template.title,
        time: template.time,
        icon: template.icon,
        completed: index < 2, // First 2 tasks completed for demo
        date: today
      });
    });
  });

  return tasks;
};

export const initialCheckIns = generateCheckIns();
export const initialTasks = generateTasks();

export const initialCaregiverNotes: CaregiverNote[] = [
  {
    id: 1,
    patientId: 1,
    caregiverId: 1,
    date: new Date(Date.now() - 86400000).toISOString(),
    content: "Patient showing good progress. Pain levels decreasing steadily. Continue with current medication schedule.",
    tags: ["improvement", "pain"]
  },
  {
    id: 2,
    patientId: 1,
    caregiverId: 1,
    date: new Date(Date.now() - 172800000).toISOString(),
    content: "Slight redness observed around surgical site. Advised patient to keep area clean and dry. Will monitor closely.",
    tags: ["concern", "wound"]
  }
];

// Helper to calculate days since discharge
export const daysSinceDischarge = (dischargeDate: string): number => {
  const discharge = new Date(dischargeDate);
  const today = new Date();
  const diffTime = today.getTime() - discharge.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate alert level for check-in
export const calculateAlertLevel = (checkIn: Partial<CheckIn>): CheckIn['alertLevel'] => {
  if ((checkIn.pain && checkIn.pain > 7) || checkIn.fever || checkIn.woundStatus === 'concerning') {
    return 'URGENT';
  }
  if ((checkIn.pain && checkIn.pain > 5) || (checkIn.symptoms && checkIn.symptoms.length > 2) || checkIn.woundStatus === 'swelling') {
    return 'MONITOR';
  }
  return 'NORMAL';
};
