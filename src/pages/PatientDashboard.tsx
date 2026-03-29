import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Pill,
  Footprints,
  Droplets,
  Dumbbell,
  AlertCircle,
  Award,
  Target,
  Sparkles,
  ClipboardCheck,
  Flame,
  Zap,
  ChevronRight,
  Activity,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { AnimatedBackground } from '../components/AnimatedBackground';
import SOSButton from '../components/SOSButton';
import VoiceAssistant from '../components/VoiceAssistant';

const PatientDashboard: React.FC = () => {
  const { user, getTasksForPatient, getCheckInsForPatient, updateTask, getPatientById } = useAuth();
  const [showXPPopup, setShowXPPopup] = useState(false);
  
  const patient = user?.id ? getPatientById(user.id) : null;
  const tasks = user?.id ? getTasksForPatient(user.id) : [];
  const checkIns = user?.id ? getCheckInsForPatient(user.id) : [];
  
  const todayCheckIn = checkIns.find(c => 
    new Date(c.date).toDateString() === new Date().toDateString()
  );

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const dischargeDate = patient?.dischargeDate ? new Date(patient.dischargeDate) : new Date();
    const daysSinceDischarge = Math.max(0, Math.floor((Date.now() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24)));
    const recoveryProgress = Math.min(100, Math.round((daysSinceDischarge / 14) * 100));

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const hasCheckIn = checkIns.some(c => new Date(c.date).toDateString() === checkDate.toDateString());
      if (hasCheckIn || i === 0) streak++; else break;
    }

    const xp = (completedTasks * 10) + (checkIns.length * 50) + (streak * 20);
    const level = Math.floor(xp / 200) + 1;
    const levelProgress = (xp % 200) / 2;

    return { completedTasks, totalTasks, taskProgress, daysSinceDischarge, recoveryProgress, streak, xp, level, levelProgress };
  }, [tasks, checkIns, patient]);

  const iconMap: { [key: string]: any } = {
    pill: Pill,
    footprints: Footprints,
    bandage: () => <span className="text-xl">🩹</span>,
    droplet: Droplets,
    dumbbell: Dumbbell
  };

  const handleTaskToggle = (id: number, completed: boolean) => {
    updateTask(id, completed);
    if (completed) {
      setShowXPPopup(true);
      setTimeout(() => setShowXPPopup(false), 2000);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <AnimatedBackground />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-6 sm:pt-40 sm:pb-10 relative z-10">
        
        {/* Top Section: Welcome & XP */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/20">
                {user?.name?.[0] || 'P'}
              </div>
              <div>
                <h1 className="text-4xl font-extrabold gradient-text">Hey {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-slate-400 font-medium">Ready for your mission today?</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-1.5 glass-card-static rounded-full text-xs font-bold text-violet-300 border-violet-500/30 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Day {stats.daysSinceDischarge + 1} of Healing
              </span>
              <span className="px-4 py-1.5 glass-card-static rounded-full text-xs font-bold text-orange-300 border-orange-500/30 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-fire" /> {stats.streak} Day Streak
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-72 glass-card rounded-2xl p-4 border-white/10"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Level {stats.level}
              </span>
              <span className="text-xs font-bold text-violet-400">{stats.xp} XP Total</span>
            </div>
            <div className="xp-bar mb-1">
              <motion.div 
                className="xp-fill" 
                initial={{ width: 0 }} 
                animate={{ width: `${stats.levelProgress}%` }} 
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium text-center italic">
              "You're recovering like a champion! 🛡️"
            </p>
          </motion.div>
        </div>

        {/* Bento Grid Area */}
        <motion.div 
          variants={container} initial="hidden" animate="show"
          className="bento-grid"
        >
          {/* Main Task Card (Big) */}
          <motion.div variants={item} className="bento-span-2 bento-row-2">
            <div className="glass-card-static rounded-[2.5rem] p-8 h-full flex flex-col border-white/10 hover:border-purple-500/30 transition-all shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    Today's Mission 🎯
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Complete your tasks to level up!</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                    <motion.circle 
                      cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" 
                      className="text-violet-500"
                      strokeDasharray="176"
                      initial={{ strokeDashoffset: 176 }}
                      animate={{ strokeDashoffset: 176 - (176 * stats.taskProgress) / 100 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{stats.taskProgress}%</div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {tasks.map((task, i) => {
                  const Icon = iconMap[task.icon] || CheckCircle2;
                  return (
                    <motion.div key={task.id} whileHover={{ x: 6 }} className="group relative">
                      <label className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer transition-all border-2 ${
                        task.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10 border-transparent hover:border-violet-500/20'
                      }`}>
                        <input type="checkbox" checked={task.completed} onChange={() => handleTaskToggle(task.id, !task.completed)} className="task-checkbox" />
                        <div className={`p-3 rounded-2xl ${task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
                          {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5"><Clock className="w-3.5 h-3.5" /> {task.time}</p>
                        </div>
                        {task.completed && <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">+10 XP</span>}
                      </label>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <span>Recovery Timeline</span>
                  <span>Day 14</span>
                </div>
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                   {Array.from({ length: 14 }).map((_, i) => {
                     const isPast = i < stats.daysSinceDischarge;
                     const isToday = i === stats.daysSinceDischarge;
                     const status = isPast ? 'completed' : isToday ? 'today' : 'future';
                     return (
                       <div key={i} className={`timeline-day ${status}`}>
                         {isPast ? '✓' : i + 1}
                       </div>
                     );
                   })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Check-in Card (Medium/Urgent) */}
          <motion.div variants={item} className="bento-row-1">
            <Link to="/checkin" className="block h-full group">
              <div className={`rounded-[2.5rem] p-8 h-full relative overflow-hidden transition-all duration-500 shadow-2xl ${
                todayCheckIn 
                  ? 'glass-card-static border-emerald-500/20' 
                  : 'bg-gradient-to-br from-violet-600 via-pink-600 to-violet-700 animate-ring-pulse border-white/20 group-hover:scale-[1.03]'
              }`}>
                {!todayCheckIn && <div className="absolute top-0 right-0 p-4"><Sparkles className="w-6 h-6 text-white animate-pulse" /></div>}
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${todayCheckIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/20 text-white'}`}>
                    <ClipboardCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Daily Check-in</h3>
                  <p className={`text-sm mb-6 flex-1 ${todayCheckIn ? 'text-slate-400' : 'text-white/80 font-medium'}`}>
                    {todayCheckIn ? "Completed for today! Your doctor is updated." : "Tell us how you're feeling — it only takes 2 mins!"}
                  </p>
                  
                  {todayCheckIn ? (
                    <div className="bg-emerald-500/20 text-emerald-400 py-3 rounded-2xl text-center font-bold text-sm">✓ Done Tomorrow!</div>
                  ) : (
                    <div className="bg-white text-violet-600 py-4 px-6 rounded-2xl text-center font-bold flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                      Start Now <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Recovery Stats Card (Small) */}
          <motion.div variants={item}>
            <div className="glass-card-static rounded-[2.5rem] p-8 h-full border-white/5 hover:border-teal-500/30 transition-all">
               <div className="p-3 bg-teal-500/20 text-teal-400 w-fit rounded-2xl mb-4">
                 <Activity className="w-6 h-6" />
               </div>
               <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Status</h4>
               <div className="text-3xl font-black text-white mb-2">STABLE</div>
               <p className="text-xs text-slate-500">Last check-in 2 hours ago. Looking good! 🟢</p>
            </div>
          </motion.div>

          {/* Health Tip Card (Small) */}
          <motion.div variants={item}>
             <div className="glass-card-static rounded-[2.5rem] p-8 h-full border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent">
               <div className="flex gap-2 mb-4">
                 {['😊','🧘','💧','🏃'].map(e => <span key={e} className="text-xl">{e}</span>)}
               </div>
               <h4 className="text-white font-bold text-lg mb-2">Healing Tip 💡</h4>
               <p className="text-slate-400 text-sm leading-relaxed">
                 Sip water every hour. Hydration accelerates cell recovery and keeps you energized!
               </p>
             </div>
          </motion.div>

          {/* Next Step Card (Small) */}
          <motion.div variants={item}>
            <div className="neu-card-teal p-8 h-full flex flex-col justify-between">
              <div>
                <Calendar className="w-7 h-7 text-teal-400 mb-4" />
                <h4 className="text-white font-bold text-lg">Dr. Consultation</h4>
                <p className="text-teal-400 text-xs font-bold mt-1">IN 3 DAYS</p>
              </div>
              <button className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all mt-4">
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </motion.div>
      </main>

      <VoiceAssistant />
      <SOSButton />

      {/* XP Floating Popup */}
      <AnimatePresence>
        {showXPPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -100 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black text-white">+10</div>
            <span className="text-white font-black uppercase tracking-tighter">XP Earned! ✨</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;
