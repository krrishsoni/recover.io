import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Bell,
  Moon,
  Shield,
  Download,
  LogOut,
  ChevronRight,
  Save,
  Camera,
  Activity,
  Zap,
  Lock,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { AnimatedBackground } from '../components/AnimatedBackground';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user, logout, getPatientById } = useAuth();
  const navigate = useNavigate();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [painThreshold, setPainThreshold] = useState(7);

  const patient = user?.role === 'patient' && user?.id ? getPatientById(user.id) : null;

  const handleSave = () => {
    toast.success('Configuration sync complete! ✨', {
      style: { background: '#1e1b4b', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '1rem', fontWeight: 800 }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast('Session terminated. See you soon!', { icon: '👋', style: { borderRadius: '1rem', background: '#0f172a', color: '#f8fafc' } });
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-8 rounded-full transition-all duration-500 overflow-hidden ${enabled ? 'bg-gradient-to-r from-violet-600 to-pink-600 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/10'}`}
    >
      <motion.div
        animate={{ x: enabled ? 28 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-xl flex items-center justify-center"
      >
         <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-violet-600' : 'bg-slate-300'}`} />
      </motion.div>
    </button>
  );

  return (
    <div className="min-h-screen pb-24 relative">
      <AnimatedBackground />
      <Header />

      <main className="max-w-3xl mx-auto px-6 pb-10 pt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold gradient-text">System Settings</h1>
          <p className="text-slate-400 font-medium">Fine-tune your RecoverAI experience</p>
        </motion.div>

        <div className="space-y-8">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
             <div className="glass-card-static rounded-[2.5rem] p-8 border-white/5">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                   <div className="relative group">
                      <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-4xl shadow-2xl border-2 border-white/20 group-hover:rotate-3 transition-transform">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 border-2 border-white/10 rounded-xl flex items-center justify-center text-violet-400 hover:text-white transition-colors shadow-xl">
                        <Camera className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="text-center md:text-left">
                      <h3 className="text-2xl font-black text-white">{user?.name}</h3>
                      <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                         <span className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-500/20">{user?.role}</span>
                         {patient && <span className="text-slate-500 text-xs font-bold">{patient.diagnosis}</span>}
                      </div>
                      <p className="text-slate-500 text-xs font-medium mt-3 flex items-center gap-2 justify-center md:justify-start"><Mail className="w-3 h-3" /> {user?.email}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="group relative">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-2">Contact Number</label>
                      <div className="relative">
                         <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400" />
                         <input type="tel" defaultValue="+1 (555) 000-0000" className="glass-input !pl-12 h-14" />
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Preferences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Notifications */}
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="glass-card-static rounded-[2.5rem] p-8 border-white/5 h-full">
                   <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                     <Bell className="w-5 h-5 text-violet-400" /> Notifications
                   </h2>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div><p className="text-sm font-bold text-slate-200">Email Updates</p><p className="text-[10px] text-slate-500 font-bold uppercase">Daily Report</p></div>
                         <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
                      </div>
                      <div className="flex items-center justify-between">
                         <div><p className="text-sm font-bold text-slate-200">SMS Alerts</p><p className="text-[10px] text-slate-500 font-bold uppercase">Urgent Ping</p></div>
                         <Toggle enabled={smsAlerts} onChange={setSmsAlerts} />
                      </div>
                   </div>
                </div>
             </motion.div>

             {/* Security */}
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="glass-card-static rounded-[2.5rem] p-8 border-white/5 h-full">
                   <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                     <Lock className="w-5 h-5 text-pink-400" /> Privacy
                   </h2>
                   <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 bg-white/4 rounded-2xl group hover:bg-white/8 transition-all">
                         <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Two-Factor Auth</span>
                         <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-pink-400 transition-colors" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-white/4 rounded-2xl group hover:bg-white/8 transition-all">
                         <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Data Privacy</span>
                         <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-pink-400 transition-colors" />
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>

          {/* Alert Thresholds */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
             <div className="glass-card-static rounded-[2.5rem] p-8 border-white/5">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-lg font-black text-white flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400" /> Alert Thresholds</h2>
                   <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-black ring-1 ring-emerald-500/30">{painThreshold}/10 Pain</div>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Trigger urgent caregiver ping if pain exceeds level:</p>
                <input 
                  type="range" min="1" max="10" value={painThreshold} 
                  onChange={e => setPainThreshold(parseInt(e.target.value))}
                  className="pain-slider w-full"
                />
                <div className="flex justify-between mt-4 text-[10px] font-black text-slate-600">
                   <span>MODERATE</span>
                   <span>CRITICAL</span>
                </div>
             </div>
          </motion.div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-4">
             <button onClick={handleSave} className="py-5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.02] transition-all">
                <Save className="w-4 h-4" /> Save Master Config
             </button>
             <button onClick={handleLogout} className="py-5 bg-white/5 border border-white/10 rounded-[2rem] text-rose-500 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all">
                <LogOut className="w-4 h-4" /> Terminate Session
             </button>
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] font-bold text-slate-600 uppercase tracking-widest"> RecoverAI v2.4.0 · Precision Recovery Intelligence</p>
      </main>
    </div>
  );
};

export default SettingsPage;
