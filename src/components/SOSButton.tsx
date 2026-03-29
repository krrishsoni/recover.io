import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Phone, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isActivating && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      handleEmergency();
    }
    return () => clearInterval(timer);
  }, [isActivating, countdown]);

  const handleEmergency = () => {
    setIsActivating(false);
    setCountdown(5);
    setIsOpen(false);
    toast.error('EMERGENCY ALERT SENT! 🚨 Help is on the way.', {
      duration: 10000,
      style: { background: '#e11d48', color: '#fff', fontSize: '1.25rem', fontWeight: 900, borderRadius: '1rem', border: '4px solid #fff' }
    });
    // Record audio/send location/etc in a real app
  };

  const cancelSOS = () => {
    setIsActivating(false);
    setCountdown(5);
    toast('Emergency alert cancelled.', { icon: '🛡️', style: { background: '#0f172a', color: '#fff', borderRadius: '1rem' }});
  };

  return (
    <>
      {/* Floating Pulse Button */}
      <div className="fixed bottom-6 right-6 z-[200]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-[1.5rem] bg-rose-600 text-white shadow-2xl shadow-rose-500/50 flex items-center justify-center border-2 border-white/20 relative overflow-hidden"
        >
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-rose-400 rounded-full"
          />
          <AlertCircle className="w-8 h-8 relative z-10" />
        </motion.button>
      </div>

      {/* SOS Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 40 }}
               className="w-full max-w-md glass-card rounded-[3rem] p-10 text-center border-rose-500/20 shadow-[0_0_50px_rgba(225,29,72,0.2)]"
             >
                <div className="w-24 h-24 bg-rose-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                   <ShieldAlert className="w-12 h-12 text-rose-500" />
                </div>
                
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Need Assistance?</h2>
                <p className="text-slate-400 font-medium mb-10 leading-relaxed">Pressing the button below will alert your caregiver and emergency contacts immediately.</p>

                <div className="space-y-4">
                   {!isActivating ? (
                     <button 
                       onClick={() => setIsActivating(true)}
                       className="w-full py-6 bg-rose-600 rounded-[2rem] text-white font-black text-xl uppercase tracking-widest shadow-2xl shadow-rose-500/40 hover:bg-rose-500 transition-all border-b-4 border-rose-800"
                     >
                        Confirm SOS 🚨
                     </button>
                   ) : (
                     <div className="space-y-6">
                        <div className="relative w-32 h-32 mx-auto">
                           <svg className="w-full h-full transform -rotate-90">
                              <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                              <motion.circle 
                                cx="64" cy="64" r="60" fill="none" stroke="#e11d48" strokeWidth="8" 
                                strokeDasharray="377"
                                initial={{ strokeDashoffset: 377 }}
                                animate={{ strokeDashoffset: 377 - (377 * (5 - countdown)) / 5 }}
                                strokeLinecap="round"
                              />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white">{countdown}</div>
                        </div>
                        <p className="text-rose-500 font-black animate-pulse">SENDING ALERT IN {countdown}S...</p>
                        <button onClick={cancelSOS} className="text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors">Cancel Alert</button>
                     </div>
                   )}

                   {!isActivating && (
                     <button 
                       onClick={() => setIsOpen(false)}
                       className="w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-white/10"
                     >
                       I'm Safe, Close
                     </button>
                   )}
                </div>

                <div className="mt-10 flex items-center justify-center gap-6 border-t border-white/5 pt-8">
                   <div className="text-center">
                      <div className="p-3 bg-white/5 rounded-2xl mb-2"><Phone className="w-5 h-5 text-emerald-400" /></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase">Emergency</span>
                   </div>
                   <div className="text-center opacity-40 grayscale">
                      <div className="p-3 bg-white/5 rounded-2xl mb-2"><Phone className="w-5 h-5 text-white" /></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase">Doctor</span>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSButton;
