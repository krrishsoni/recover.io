import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  FileText, 
  Calendar, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Heart, 
  Thermometer, 
  ClipboardCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import toast from 'react-hot-toast';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatientById, getCheckInsForPatient, getTasksForPatient } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRENDS' | 'HISTORY'>('OVERVIEW');

  const patient = id ? getPatientById(parseInt(id)) : null;
  const checkIns = id ? getCheckInsForPatient(parseInt(id)) : [];
  const tasks = id ? getTasksForPatient(parseInt(id)) : [];

  const stats = useMemo(() => {
    if (!patient) return null;
    const latestCI = checkIns[0];
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const dischargeDate = new Date(patient.dischargeDate);
    const daysSince = Math.max(0, Math.floor((Date.now() - dischargeDate.getTime()) / 86400000));
    
    // Prepare chart data
    const chartData = [...checkIns].reverse().map(c => ({
      date: new Date(c.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      pain: c.pain,
      temp: c.temperature,
    }));

    let status: 'URGENT' | 'MONITOR' | 'STABLE' = 'STABLE';
    if (latestCI) {
      if (latestCI.alertLevel === 'URGENT') status = 'URGENT';
      else if (latestCI.alertLevel === 'MONITOR') status = 'MONITOR';
    }

    return { latestCI, completedTasks, totalTasks, daysSince, chartData, status };
  }, [patient, checkIns, tasks]);

  if (!patient || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-500">Patient not found</h2>
          <button onClick={() => navigate('/caregiver')} className="mt-4 text-violet-400 font-bold uppercase tracking-widest flex items-center gap-2 mx-auto">
             <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
        </div>
      </div>
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  const handleGenerateReport = () => {
    toast.success('Generating comprehensive medical report...', { icon: '📄' });
    setTimeout(() => toast.success('Report downloaded successfully! ✨'), 2000);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <AnimatedBackground />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-6 sm:pt-40 sm:pb-10 relative z-10">
        
        {/* Back Button */}
        <motion.button 
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/caregiver')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Monitoring
        </motion.button>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card-static rounded-[3rem] p-8 md:p-10 mb-8 border-white/5 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Status Ring */}
             <div className="relative">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center border-[6px] ${
                  stats.status === 'URGENT' ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 
                  stats.status === 'MONITOR' ? 'border-yellow-500' : 'border-emerald-500'
                }`}>
                  <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-5xl font-black text-white shadow-inner overflow-hidden">
                    {patient.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                </div>
                <div className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl ${
                  stats.status === 'URGENT' ? 'bg-rose-500 text-white animate-pulse' : 
                  stats.status === 'MONITOR' ? 'bg-yellow-500 text-slate-900' : 'bg-emerald-500 text-white'
                }`}>
                  {stats.status}
                </div>
             </div>

             <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div>
                      <h1 className="text-4xl md:text-5xl font-black gradient-text tracking-tight mb-2">{patient.name}</h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-bold text-sm">
                        <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> {patient.age} years old</span>
                        <span className="flex items-center gap-1.5 text-violet-300 uppercase tracking-widest"><Heart className="w-4 h-4" /> {patient.diagnosis}</span>
                      </div>
                   </div>
                   <div className="flex gap-3 justify-center">
                      <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-lg"><Phone className="w-5 h-5" /></button>
                      <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-lg"><Mail className="w-5 h-5" /></button>
                      <button 
                        onClick={handleGenerateReport}
                        className="btn-primary flex items-center gap-2"
                      >
                         <FileText className="w-5 h-5" /> <span>Report</span>
                      </button>
                   </div>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                   <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-bold text-slate-400">Day {stats.daysSince + 1} Post-Op</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-400">Next Meds: 4:00 PM</span>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md w-fit mb-10 overflow-hidden mx-auto md:mx-0">
          {(['OVERVIEW', 'TRENDS', 'HISTORY'] as const).map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Tabs */}
        <AnimatePresence mode="wait">
           {activeTab === 'OVERVIEW' && (
             <motion.div key="ov" variants={container} initial="hidden" animate="show" className="bento-grid">
                {/* Vitals Bento Items */}
                <motion.div variants={item} className="glass-card-static rounded-[2.5rem] p-8 border-white/5">
                   <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl"><Heart className="w-7 h-7" /></div>
                      <TrendingUp className="w-5 h-5 text-rose-400" />
                   </div>
                   <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Latest Pain</h4>
                   <div className="text-4xl font-black text-white">{stats.latestCI?.pain || '--'}<span className="text-lg text-slate-600">/10</span></div>
                   <p className="text-xs text-rose-400 font-bold mt-2">Pulsing at level 8 🔴</p>
                </motion.div>

                <motion.div variants={item} className="glass-card-static rounded-[2.5rem] p-8 border-white/5">
                   <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl"><Thermometer className="w-7 h-7" /></div>
                      <TrendingDown className="w-5 h-5 text-teal-400" />
                   </div>
                   <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Temperature</h4>
                   <div className="text-4xl font-black text-white">{stats.latestCI?.temperature?.toFixed(1) || '--'}<span className="text-lg text-slate-600">°F</span></div>
                   <p className="text-xs text-teal-400 font-bold mt-2">Stable range 🟢</p>
                </motion.div>

                <motion.div variants={item} className="glass-card-static bg-gradient-to-br from-violet-600/10 to-transparent rounded-[2.5rem] p-8 border-white/5">
                   <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-violet-500/20 text-violet-400 rounded-2xl"><ClipboardCheck className="w-7 h-7" /></div>
                   </div>
                   <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Task Compliance</h4>
                   <div className="text-4xl font-black text-white">{stats.completedTasks}/{stats.totalTasks}</div>
                   <p className="text-xs text-slate-400 font-bold mt-2">85% daily average 📈</p>
                </motion.div>

                {/* Wound Status (Wide) */}
                <motion.div variants={item} className="bento-span-2 glass-card-static rounded-[2.5rem] p-8 border-white/5 flex items-center gap-8">
                   <div className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="text-5xl">🩹</span>
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-white mb-2">Wound Health: {stats.latestCI?.woundStatus?.replace('_',' ') || 'No Data'}</h4>
                      <p className="text-slate-400 text-sm font-medium mb-4">Latest check-in reports {stats.latestCI?.woundStatus === 'healing' ? 'positive healing with minimal swelling.' : 'concerning changes that may require inspection.'}</p>
                      <button className="text-xs font-black text-violet-400 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all duration-300">
                         View Wound Photo History <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                </motion.div>

                {/* Recovery Progress (Small) */}
                <motion.div variants={item} className="neu-card p-8 flex flex-col justify-center text-center">
                   <Zap className="w-10 h-10 text-violet-400 mx-auto mb-4 fill-violet-400" />
                   <h4 className="font-black text-lg text-white mb-1">Overall Recovery</h4>
                   <div className="text-3xl font-black gradient-text">35% COMPLETE</div>
                </motion.div>
             </motion.div>
           )}

           {activeTab === 'TRENDS' && (
             <motion.div 
               key="tr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="space-y-8"
             >
                <div className="glass-card-static rounded-[3rem] p-8 md:p-10 border-white/5 h-[450px]">
                   <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-black text-white">7-Day Pain Trend</h3>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" /> <span className="text-[10px] font-bold text-slate-400 uppercase">Pain Intensity</span></div>
                      </div>
                   </div>
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                        <defs>
                          <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: '700' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: '700' }} domain={[0, 10]} />
                        <Tooltip 
                           contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                           itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                           cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                        />
                        <Area type="monotone" dataKey="pain" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorPain)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="glass-card-static rounded-[3rem] p-8 border-white/5 h-[350px]">
                      <h3 className="text-xl font-black text-white mb-8">Daily Activity Heatmap ⚡</h3>
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: '700' }} />
                            <Tooltip 
                               contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '1rem' }}
                            />
                            <Bar dataKey="temp" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="flex flex-col gap-6">
                      <div className="glass-card-static rounded-[2.5rem] p-8 flex-1 border-white/5 bg-gradient-to-br from-rose-600/10 to-transparent">
                         <h4 className="text-white font-bold mb-4">Risk Insights 🕵️</h4>
                         <p className="text-slate-400 text-sm leading-relaxed">
                           Patient recovery trend is <span className="text-rose-400 font-black tracking-tight">STABLE</span>. Morning pain spikes detected on Day 3 and 5. Recommended: Adjust early physical therapy session by 30 mins.
                         </p>
                      </div>
                      <div className="glass-card-static rounded-[2.5rem] p-8 flex-1 border-white/5 bg-gradient-to-br from-teal-600/10 to-transparent">
                         <h4 className="text-white font-bold mb-4">Activity Outlook 🏃</h4>
                         <p className="text-slate-400 text-sm leading-relaxed">
                            Walking goals met for 4 consecutive days. <span className="text-teal-400 font-black tracking-tight">HEALTHY HEATMAP</span>. Ready for level 2 stability exercises on discharge day 7.
                         </p>
                      </div>
                   </div>
                </div>
             </motion.div>
           )}

           {activeTab === 'HISTORY' && (
             <motion.div 
               key="hi" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="space-y-4"
             >
                {checkIns.map((c, i) => (
                  <motion.div 
                    key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card-static rounded-3xl p-6 border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
                          c.alertLevel === 'URGENT' ? 'bg-rose-500/20 text-rose-400' : 
                          c.alertLevel === 'MONITOR' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                           {new Date(c.date).getDate()}
                        </div>
                        <div>
                           <h4 className="text-white font-bold leading-tight">{new Date(c.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                           <p className="text-xs text-slate-500 font-bold uppercase mt-1">Status: {c.alertLevel}</p>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <div className="bg-white/5 rounded-2xl px-4 py-2 border border-white/5">
                           <span className="text-[10px] text-slate-500 font-black block uppercase mb-0.5">Pain</span>
                           <span className="text-sm font-black text-slate-200">{c.pain}/10</span>
                        </div>
                        <div className="bg-white/5 rounded-2xl px-4 py-2 border border-white/5 text-right flex items-center justify-center">
                           <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-violet-400 transition-colors" />
                        </div>
                     </div>
                  </motion.div>
                ))}
             </motion.div>
           )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default PatientDetail;
