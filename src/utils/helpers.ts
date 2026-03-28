// Helper utilities for RecoverAI

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format date nicely
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get pain level emoji
export const getPainEmoji = (pain: number): string => {
  if (pain <= 2) return '😊';
  if (pain <= 5) return '😐';
  if (pain <= 7) return '😟';
  return '😢';
};

// Get pain level color class
export const getPainColorClass = (pain: number): string => {
  if (pain <= 2) return 'text-green-500';
  if (pain <= 5) return 'text-yellow-500';
  if (pain <= 7) return 'text-orange-500';
  return 'text-red-500';
};

// Get alert level styling
export const getAlertStyles = (alertLevel: 'NORMAL' | 'MONITOR' | 'URGENT'): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} => {
  switch (alertLevel) {
    case 'URGENT':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500'
      };
    case 'MONITOR':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500'
      };
    default:
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500'
      };
  }
};

// Get mood emoji
export const getMoodEmoji = (mood: string): string => {
  const moods: Record<string, string> = {
    great: '😊',
    okay: '😐',
    sad: '😔',
    anxious: '😰',
    angry: '😡'
  };
  return moods[mood] || '😐';
};

// Get wound status styling
export const getWoundStatusStyles = (status: string): {
  label: string;
  color: string;
  bg: string;
} => {
  switch (status) {
    case 'healing':
      return { label: 'Healing Well', color: 'text-green-700', bg: 'bg-green-100' };
    case 'redness':
      return { label: 'Some Redness', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    case 'swelling':
      return { label: 'Increased Swelling', color: 'text-orange-700', bg: 'bg-orange-100' };
    case 'concerning':
      return { label: 'Concerning Changes', color: 'text-red-700', bg: 'bg-red-100' };
    default:
      return { label: status, color: 'text-gray-700', bg: 'bg-gray-100' };
  }
};

// Calculate streak (consecutive days of completed check-ins)
export const calculateStreak = (checkIns: { date: string }[]): number => {
  if (checkIns.length === 0) return 0;
  
  const sortedCheckIns = [...checkIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedCheckIns.length; i++) {
    const checkInDate = new Date(sortedCheckIns[i].date);
    checkInDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Calculate task completion percentage
export const calculateTaskCompletion = (tasks: { completed: boolean }[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

// Voice synthesis helper
export const speak = (text: string): void => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Use a friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Google') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
};

// Get task icon emoji
export const getTaskIcon = (icon: string): string => {
  const icons: Record<string, string> = {
    pill: '💊',
    footprints: '🚶',
    bandage: '🩹',
    droplet: '💧',
    dumbbell: '🏋️'
  };
  return icons[icon] || '📋';
};

// Generate unique ID
export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Temperature conversion
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

// Days until next appointment (mock)
export const daysUntilNextAppointment = (): number => {
  return Math.floor(Math.random() * 7) + 3;
};
