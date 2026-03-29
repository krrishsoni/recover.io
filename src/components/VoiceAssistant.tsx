import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Mic, X, Sparkles, Zap, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isPatientDashboard = user?.role === 'patient';
  const isCaregiverViewingPatient = user?.role === 'caregiver' && location.pathname.includes('/caregiver/patient/');
  
  if (!isPatientDashboard && !isCaregiverViewingPatient) return null;

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      const preferred = voices.find(v => v.lang.startsWith('en') && !v.localService === false)
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const reminders = [
    {
      title: "Rise & Recover",
      message: `Good morning ${user?.name?.split(' ')[0]}! You've got this. Start with 10 mins of breathing and your meds. ✨`,
      icon: "☀️",
      color: "text-orange-400"
    },
    {
      title: "Fuel & Meds",
      message: "It's time for your medication. Pair it with a glass of water for maximum cell hydration! 💧",
      icon: "💊",
      color: "text-emerald-400"
    },
    {
      title: "Status Update",
      message: "Sync your progress with the team. A 2-minute check-in keeps your recovery on the perfect track! 🛡️",
      icon: "📋",
      color: "text-violet-400"
    },
    {
      title: "Growth Mission",
      message: "Gentle movement is medicine. Take a short stroll — every step is a victory in your healing journey! 🏃",
      icon: "💪",
      color: "text-blue-400"
    },
    {
      title: "Healing Sleep",
      message: "Rest is when the magic happens. Power down, take your final meds, and drift into a deep recovery sleep. 🌙",
      icon: "💤",
      color: "text-indigo-400"
    }
  ];

  return (
    <>
      {/* Floating Trigger */}
      <div className="fixed bottom-6 left-6 z-[200]">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-2xl shadow-indigo-500/50 flex items-center justify-center border-2 border-white/20 relative"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-white rounded-[1.5rem]"
          />
          <Mic className="w-8 h-8 relative z-10" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { stopSpeaking(); setIsOpen(false); }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[300]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed left-6 right-6 bottom-6 md:left-auto md:right-32 md:bottom-32 md:w-full md:max-w-md z-[310]"
            >
              <div className="glass-card rounded-[3rem] p-8 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Recovery Pal</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Voice Guidance Active</p>
                    </div>
                  </div>
                  <button onClick={() => { stopSpeaking(); setIsOpen(false); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {/* Live Waveform / Speaking State */}
                <div className="bg-white/5 rounded-[2rem] p-6 mb-6 border border-white/5 min-h-[120px] flex flex-col items-center justify-center transition-all">
                  {isSpeaking ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                       <div className="flex items-end gap-1.5 h-12">
                          {[...Array(12)].map((_, i) => (
                            <motion.div 
                              key={i}
                              animate={{ height: [12, 48, 12] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                              className="w-1.5 bg-gradient-to-t from-violet-500 to-pink-500 rounded-full"
                            />
                          ))}
                       </div>
                       <button onClick={stopSpeaking} className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 px-6 py-2 bg-rose-500/10 rounded-full border border-rose-500/20">
                          <VolumeX className="w-3 h-3" /> Stop Guidance
                       </button>
                    </div>
                  ) : (
                    <div className="text-center group cursor-pointer" onClick={() => speak("Hello! I am your recovery assistant. How can I help you today?")}>
                       <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Mic className="w-8 h-8 text-violet-400" />
                       </div>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Tap to test voice engine</p>
                    </div>
                  )}
                </div>

                {/* Reminders Grid */}
                <div className="grid grid-cols-1 gap-3">
                   {reminders.map((r, i) => (
                     <motion.button
                       key={i}
                       initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                       whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.08)" }}
                       onClick={() => speak(r.message)}
                       className="w-full flex items-center gap-4 p-4 bg-white/4 rounded-[1.5rem] border border-white/5 text-left transition-all"
                     >
                        <div className="text-3xl shrink-0">{r.icon}</div>
                        <div className="flex-1 min-w-0">
                           <h4 className={`text-sm font-black uppercase tracking-widest ${r.color}`}>{r.title}</h4>
                           <p className="text-xs text-slate-500 font-medium truncate">{r.message}</p>
                        </div>
                        <Volume2 className="w-5 h-5 text-slate-600" />
                     </motion.button>
                   ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                   <Award className="w-4 h-4 text-yellow-500" />
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Listen to daily tips for +5 XP</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
