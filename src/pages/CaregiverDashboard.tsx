import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  ChevronRight, 
  Phone, 
  Mail, 
  FileText, 
  User, 
  Activity, 
  TrendingDown, 
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Link } from 'react-router-dom';

const CaregiverDashboard: React.FC = () => {
  const { patients, getTasksForPatient, getCheckInsForPatient } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'MONITOR' | 'STABLE'>('ALL');

  const patientStats = useMemo(() => {
    return patients.map(p => {
      const tasks = getTasksForPatient(p.id);
      const checkIns = getCheckInsForPatient(p.id);
      const latestCheckIn = checkIns[0];
      const completedTasks = tasks.filter(t => t.completed).length;
      const totalTasks = tasks.length;
      const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      let status: 'URGENT' | 'MONITOR' | 'STABLE' = 'STABLE';
      if (latestCheckIn) {
        if (latestCheckIn.alertLevel === 'URGENT') status = 'URGENT';
        else if (latestCheckIn.alertLevel === 'MONITOR') status = 'MONITOR';
      }

      return { ...p, status, latestCheckIn, taskProgress, completedTasks, totalTasks };
    });
  }, [patients, getTasksForPatient, getCheckInsForPatient]);

  const filteredPatients = patientStats.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const urgentCount = patientStats.filter(p => p.status === 'URGENT').length;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <AnimatedBackground />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-6 sm:pt-40 sm:pb-10 relative z-10">
        
        {/* Urgent Alert Banner */}
        <AnimatePresence>
          {urgentCount > 0 && (
            <motion.div 
               initial={{ opacity: 0, y: -20, height: 0 }}
               animate={{ opacity: 1, y: 0, height: 'auto' }}
               exit={{ opacity: 0, y: -20, height: 0 }}
               className="mb-8"
            >
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-5 flex items-center justify-between animate-pulse-glow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/40">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-rose-400">Attention Required</h3>
                    <p className="text-rose-400/70 text-sm font-bold">{urgentCount} patients are flagged with urgent alerts.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFilter('URGENT')}
                  className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                >
                  View Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold gradient-text">Caregiver Command</h1>
            <p className="text-slate-400 font-medium">Monitoring {patients.length} patients in real-time</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input 
                  type="text" placeholder="Search patients..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="glass-input !pl-12 sm:w-64"
                />
             </div>
             <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                {(['ALL', 'URGENT', 'MONITOR', 'STABLE'] as const).map(f => (
                  <button 
                    key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                      filter === f ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Patient Grid */}
        <motion.div 
          variants={container} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPatients.map((p) => (
            <motion.div key={p.id} variants={item}>
              <Link to={`/caregiver/patient/${p.id}`} className="block group">
                <div className={`glass-card rounded-[2.5rem] p-6 h-full border-2 transition-all relative overflow-hidden ${
                  p.status === 'URGENT' ? 'border-rose-500/30' : 
                  p.status === 'MONITOR' ? 'border-yellow-500/20' : 'border-white/5'
                }`}>
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-xl border border-white/10 group-hover:scale-110 transition-transform">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0a0a1a] ${
                          p.status === 'URGENT' ? 'bg-rose-500 animate-ping' : 
                          p.status === 'MONITOR' ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`} />
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0a0a1a] ${
                          p.status === 'URGENT' ? 'bg-rose-500' : 
                          p.status === 'MONITOR' ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-lg leading-tight group-hover:text-violet-400 transition-colors">{p.name}</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{p.diagnosis}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      p.status === 'URGENT' ? 'bg-rose-500/20 text-rose-400' : 
                      p.status === 'MONITOR' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {p.status}
                    </div>
                  </div>

                  {/* Vitals Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                     {[
                       { label: 'Pain', val: p.latestCheckIn ? `${p.latestCheckIn.pain}/10` : '--', color: p.latestCheckIn?.pain! > 7 ? 'text-rose-400' : 'text-slate-300' },
                       { label: 'Tasks', val: `${p.taskProgress}%`, color: p.taskProgress < 50 ? 'text-yellow-400' : 'text-emerald-400' },
                       { label: 'Recovery', val: '35%', color: 'text-violet-400' }
                     ].map(s => (
                       <div key={s.label} className="bg-white/4 rounded-2xl py-3 px-2 text-center border border-white/5">
                         <span className="block text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">{s.label}</span>
                         <span className={`text-sm font-black ${s.color}`}>{s.val}</span>
                       </div>
                     ))}
                  </div>

                  {/* Latest Alert */}
                  {p.latestCheckIn && p.status !== 'STABLE' && (
                    <div className="bg-rose-500/10 rounded-2xl p-4 mb-6 border border-rose-500/10">
                       <p className="text-xs font-black text-rose-400 flex items-center gap-2">
                         <AlertCircle className="w-3 h-3" /> Flagged: Pain Level {p.latestCheckIn.pain}
                       </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Active 2h ago
                    </span>
                    <div className="flex gap-2">
                       <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Phone className="w-4 h-4" /></button>
                       <button className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Mail className="w-4 h-4" /></button>
                       <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl group-hover:bg-violet-500 group-hover:text-white transition-all">
                         <ArrowRight className="w-4 h-4" />
                       </div>
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
          
          {filteredPatients.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-20 text-center">
               <Activity className="w-20 h-20 text-slate-800 mx-auto mb-4" />
               <h3 className="text-2xl font-black text-slate-600">No patients found</h3>
               <p className="text-slate-600 font-bold">Try adjusting your filters or search terms</p>
            </motion.div>
          )}
        </motion.div>

      </main>
    </div>
  );
};

export default CaregiverDashboard;
