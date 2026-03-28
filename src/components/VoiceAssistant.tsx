import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Mic, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { user } = useAuth();

  if (user?.role !== 'patient') return null;

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const reminders = [
    {
      title: "Morning Greeting",
      message: `Good morning ${user?.name?.split(' ')[0]}! I hope you're feeling well today. Remember to take your morning medication and drink plenty of water.`,
      icon: "☀️"
    },
    {
      title: "Medication Reminder",
      message: "It's time for your medication. Taking your medication on time is important for your recovery. You're doing great!",
      icon: "💊"
    },
    {
      title: "Check-in Reminder",
      message: "Don't forget to complete your daily check-in. It helps your caregiver monitor your recovery and ensures you get the best care possible.",
      icon: "📋"
    },
    {
      title: "Exercise Reminder",
      message: "Time for your gentle walk! Even 10 minutes of light activity can boost your recovery. Take it slow and listen to your body.",
      icon: "🚶"
    },
    {
      title: "Encouragement",
      message: `You're doing amazing, ${user?.name?.split(' ')[0]}! Recovery takes time, but every day you're getting stronger. Keep up the great work!`,
      icon: "💪"
    },
    {
      title: "Evening Wind-down",
      message: "It's almost bedtime. Make sure to take your evening medication and get plenty of rest. Your body heals while you sleep. Goodnight!",
      icon: "🌙"
    }
  ];

  return (
    <>
      {/* Voice Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center"
        aria-label="Voice Assistant"
      >
        <Mic className="w-6 h-6 text-white" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                stopSpeaking();
                setIsOpen(false);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-4 right-4 bottom-4 sm:left-1/2 sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Voice Reminders</h3>
                      <p className="text-sm text-gray-500">Tap to hear helpful reminders</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setIsOpen(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Speaking indicator */}
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-blue-50 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 16, 8] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 bg-blue-500 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-blue-700 font-medium">Speaking...</span>
                    </div>
                    <button
                      onClick={stopSpeaking}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <VolumeX className="w-4 h-4 text-blue-600" />
                    </button>
                  </motion.div>
                )}

                {/* Reminders list */}
                <div className="space-y-2">
                  {reminders.map((reminder, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => speak(reminder.message)}
                      className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-2xl text-left transition-all duration-300"
                    >
                      <span className="text-2xl">{reminder.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{reminder.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{reminder.message}</p>
                      </div>
                      <Volume2 className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  ))}
                </div>

                {/* Note about speech */}
                <p className="mt-4 text-xs text-center text-gray-400">
                  Uses your device's text-to-speech capabilities
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
