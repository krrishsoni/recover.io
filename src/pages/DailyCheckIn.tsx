import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Thermometer, 
  Activity, 
  Wind, 
  Zap, 
  CheckCircle2, 
  Camera, 
  Smile, 
  Meh, 
  Frown, 
  AlertTriangle,
  Heart,
  Moon,
  Coffee,
  Sun,
  CloudRain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AnimatedBackground } from '../components/AnimatedBackground';
import confetti from 'canvas-confetti';

const STEPS = [
  { id: 'pain', label: 'Pain', icon: '🔥' },
  { id: 'vitals', label: 'Vitals', icon: '🌡️' },
  { id: 'wound', label: 'Wound', icon: '🩹' },
  { id: 'symptoms', label: 'Symptoms', icon: '🤔' },
  { id: 'mood', label: 'Mood', icon: '💜' },
  { id: 'review', label: 'Review', icon: '📋' },
];

const PAIN_EMOJIS = ['😊', '🙂', '😐', '😟', '😣', '😫', '😭', '🤯'];

const SYMPTOMS = [
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'dizziness', label: 'Dizziness', emoji: '😵' },
  { id: 'shortness_of_breath', label: 'Breathless', emoji: '😮‍💨' },
  { id: 'insomnia', label: 'Insomnia', emoji: '😫' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
];

const MOODS = [
  { id: 'great', label: 'Great', emoji: '😊', color: 'text-emerald-400' },
  { id: 'good', label: 'Good', emoji: '🙂', color: 'text-teal-400' },
  { id: 'okay', label: 'Okay', emoji: '😐', color: 'text-yellow-400' },
  { id: 'low', label: 'Low', emoji: '😔', color: 'text-orange-400' },
  { id: 'struggling', label: 'Struggling', emoji: '😢', color: 'text-rose-400' },
];

const WOUND_OPTIONS = [
  { id: 'HEALING_WELL', label: 'Healing Well', color: 'selected-healing', emoji: '🟢' },
  { id: 'MODERATE_REDNESS', label: 'Some Redness', color: 'selected-redness', emoji: '🟡' },
  { id: 'SWELLING', label: 'Swelling', color: 'selected-swelling', emoji: '🟠' },
  { id: 'CONCERNING', label: 'Concerning', color: 'selected-concerning', emoji: '🔴' },
];

const DailyCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { user, addCheckIn } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    pain: 0,
    temperature: 98.6,
    hasFever: false,
    woundStatus: 'HEALING_WELL' as any,
    symptoms: [] as string[],
    mood: 'great',
    notes: '',
  });

  const next = () => step < STEPS.length - 1 && setStep(s => s + 1);
  const prev = () => step > 0 && setStep(s => s - 1);

  const handleSymptomToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(id) 
        ? prev.symptoms.filter(s => s !== id) 
        : [...prev.symptoms, id]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    const checkInData = {
      patientId: user.id || 1,
      date: new Date().toISOString(),
      ...formData,
      alertLevel: formData.pain > 7 || formData.hasFever || formData.woundStatus === 'CONCERNING' ? 'URGENT' : 
                  formData.pain > 4 || formData.woundStatus === 'SWELLING' ? 'MONITOR' : 'NORMAL'
    };

    addCheckIn(checkInData);
    
    // Confetti celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#ec4899', '#34d399']
    });

    toast.success('Amazing job! Check-in submitted! 🎉', {
      style: { background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#fff', fontWeight: 800, borderRadius: '1.25rem' }
    });

    setTimeout(() => navigate('/dashboard'), 3000);
  };

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Progress Header */}
      <div className="max-w-3xl mx-auto w-full px-6 pt-10 relative z-10">
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide gap-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'upcoming'}`}>
                  {i < step ? '✓' : s.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${i === step ? 'text-violet-400' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${i < step ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            >
              <div className="glass-card-static rounded-[3rem] p-8 md:p-12 border-white/5 shadow-2xl">
                
                {/* Step Content */}
                {currentStep.id === 'pain' && (
                  <div className="text-center space-y-10">
                    <div>
                      <h2 className="text-4xl font-extrabold gradient-text mb-2">How's your pain?</h2>
                      <p className="text-slate-400 font-medium">Drag to match how you feel right now</p>
                    </div>

                    <div className="relative py-10">
                      <motion.div 
                        initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                        className="text-9xl mb-10 inline-block drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                      >
                         {PAIN_EMOJIS[Math.min(Math.floor(formData.pain / 1.3), 7)]}
                      </motion.div>
                      <div className="text-5xl font-black text-white mb-8 tracking-tighter">
                        {formData.pain}<span className="text-2xl text-slate-500">/10</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" step="1" 
                        value={formData.pain} 
                        onChange={e => setFormData(p => ({ ...p, pain: parseInt(e.target.value) }))}
                        className="pain-slider"
                      />
                      <div className="flex justify-between mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                         <span>Peaceful 🧘</span>
                         <span>Intense 🌋</span>
                      </div>
                    </div>

                    {formData.pain > 7 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-400"
                      >
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-bold text-left">High pain detected. Your caregiver will be alerted once you submit.</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {currentStep.id === 'vitals' && (
                  <div className="space-y-10">
                    <div className="text-center">
                      <h2 className="text-4xl font-extrabold gradient-text mb-2">Check Vitals 🌡️</h2>
                      <p className="text-slate-400 font-medium">Record your body temperature</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 justify-center">
                      <div className="relative h-64 w-12 bg-white/5 rounded-full border border-white/10 overflow-hidden flex flex-col justify-end">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.min(100, (formData.temperature - 90) * 10)}%` }}
                          className={`w-full rounded-full transition-colors duration-500 ${formData.hasFever ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]' : 'bg-teal-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]'}`}
                        />
                      </div>

                      <div className="space-y-8 flex-1 w-full">
                        <div className="glass-card-static rounded-3xl p-6 border-white/5">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Temperature (°F)</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="number" step="0.1" value={formData.temperature}
                              onChange={e => setFormData(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
                              className="bg-transparent text-5xl font-black text-white w-full outline-none border-b-2 border-white/10 focus:border-violet-500 transition-colors"
                            />
                            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-2xl"><Thermometer className="w-8 h-8" /></div>
                          </div>
                        </div>

                        <div 
                          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            formData.hasFever ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-slate-400'
                          }`}
                          onClick={() => setFormData(p => ({ ...p, hasFever: !p.hasFever }))}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{formData.hasFever ? '🤒' : '😊'}</span>
                            <span className="font-bold">I have a fever</span>
                          </div>
                          <div className={`w-14 h-8 rounded-full relative transition-colors ${formData.hasFever ? 'bg-rose-500' : 'bg-white/10'}`}>
                            <motion.div 
                              animate={{ x: formData.hasFever ? 28 : 4 }}
                              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.id === 'wound' && (
                  <div className="space-y-10">
                    <div className="text-center">
                      <h2 className="text-4xl font-extrabold gradient-text mb-2">Wound Status 🩹</h2>
                      <p className="text-slate-400 font-medium">How is your incision healing?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {WOUND_OPTIONS.map(opt => (
                        <div 
                          key={opt.id}
                          onClick={() => setFormData(p => ({ ...p, woundStatus: opt.id }))}
                          className={`wound-card ${formData.woundStatus === opt.id ? opt.color : ''}`}
                        >
                          <div className="text-3xl mb-3">{opt.emoji}</div>
                          <div className="font-extrabold text-sm mb-1">{opt.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="glass-card-static rounded-3xl p-8 border-dashed border-2 border-white/10 text-center group cursor-pointer hover:border-violet-500/40 transition-all">
                       <Camera className="w-10 h-10 text-slate-500 mx-auto mb-3 group-hover:text-violet-400 transition-colors" />
                       <p className="text-sm font-bold text-slate-400 group-hover:text-violet-300">Upload Wound Photo (Optional)</p>
                    </div>
                  </div>
                )}

                {currentStep.id === 'symptoms' && (
                  <div className="space-y-10">
                    <div className="text-center">
                      <h2 className="text-4xl font-extrabold gradient-text mb-2">Symptoms 🤔</h2>
                      <p className="text-slate-400 font-medium">Are you feeling any of these?</p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                      {SYMPTOMS.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => handleSymptomToggle(s.label)}
                          className={`symptom-pill ${formData.symptoms.includes(s.label) ? 'selected' : ''}`}
                        >
                          {s.emoji} {s.label}
                        </div>
                      ))}
                    </div>

                    <textarea 
                      placeholder="Other symptoms or notes..."
                      value={formData.notes}
                      onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                      className="glass-input !px-5 h-32 resize-none"
                    />
                  </div>
                )}

                {currentStep.id === 'mood' && (
                  <div className="space-y-10">
                    <div className="text-center">
                      <h2 className="text-4xl font-extrabold gradient-text mb-2">Daily Mood 💜</h2>
                      <p className="text-slate-400 font-medium">How are you feeling emotionally?</p>
                    </div>

                    <div className="flex flex-col gap-4">
                       {MOODS.map(m => (
                         <div 
                           key={m.id}
                           onClick={() => setFormData(p => ({ ...p, mood: m.id }))}
                           className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                             formData.mood === m.id 
                               ? 'bg-violet-500/10 border-violet-500/40' 
                               : 'bg-white/4 border-white/5 hover:border-white/10'
                           }`}
                         >
                            <div className="flex items-center gap-4">
                              <span className="text-4xl">{m.emoji}</span>
                              <span className={`text-xl font-black ${formData.mood === m.id ? m.color : 'text-slate-400'}`}>{m.label}</span>
                            </div>
                            {formData.mood === m.id && <CheckCircle2 className={`w-6 h-6 ${m.color}`} />}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {currentStep.id === 'review' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-4xl font-extrabold gradient-text mb-2">Review Summary</h2>
                      <p className="text-slate-400 font-medium">Double check your report</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'Pain', val: `${formData.pain}/10`, icon: '🔥', color: formData.pain > 7 ? 'text-rose-400' : 'text-emerald-400' },
                         { label: 'Temp', val: `${formData.temperature}°F`, icon: '🌡️', color: formData.hasFever ? 'text-rose-400' : 'text-teal-400' },
                         { label: 'Wound', val: formData.woundStatus.replace('_', ' '), icon: '🩹', color: 'text-violet-400' },
                         { label: 'Mood', val: formData.mood, icon: '💜', color: 'text-pink-400' }
                       ].map(s => (
                         <div key={s.label} className="bg-white/4 border border-white/5 rounded-[2rem] p-5">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
                            <div className={`text-xl font-black ${s.color}`}>{s.icon} {s.val}</div>
                         </div>
                       ))}
                    </div>

                    {formData.symptoms.length > 0 && (
                      <div className="bg-white/4 border border-white/5 rounded-[2rem] p-6">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Symptoms Reported</div>
                        <div className="flex flex-wrap gap-2">
                           {formData.symptoms.map(s => <span key={s} className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-xs font-bold">{s}</span>)}
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-white/10 rounded-[2rem] p-6 text-center">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Reward</p>
                       <div className="flex items-center justify-center gap-2 text-3xl font-black text-white">
                         <Zap className="text-yellow-400 fill-yellow-400" /> +50 XP
                       </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                  <button 
                    onClick={prev} disabled={step === 0}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-white disabled:opacity-0 transition-all"
                  >
                    <ChevronLeft /> Back
                  </button>

                  {step === STEPS.length - 1 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      className="btn-primary"
                    >
                      <span className="flex items-center gap-2">Finish Mission ✨</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={next}
                      className="btn-primary"
                    >
                      <span className="flex items-center gap-2">Next Step <ChevronRight /></span>
                    </motion.button>
                  )}
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="max-w-2xl mx-auto w-full px-6 pb-10 text-center relative z-10">
        <p className="text-xs text-slate-500 font-medium">Your information is protected by healthcare-grade encryption 🔒</p>
      </div>
    </div>
  );
};

export default DailyCheckIn;
