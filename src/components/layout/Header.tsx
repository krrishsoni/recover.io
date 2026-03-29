import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  LogOut, 
  Heart,
  Home,
  ClipboardList,
  Users,
  User,
  Activity,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, checkIns } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUrgentCount = () => {
    if (user?.role !== 'caregiver') return 0;
    const today = new Date().toISOString().split('T')[0];
    return checkIns.filter(c => 
      c.alertLevel === 'URGENT' && 
      c.date.startsWith(today)
    ).length;
  };

  const urgentCount = getUrgentCount();

  const patientNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/checkin', icon: ClipboardList, label: 'Check-in' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const caregiverNavItems = [
    { path: '/caregiver', icon: Home, label: 'Command' },
    { path: '/settings', icon: Settings, label: 'Config' }
  ];

  const navItems = user?.role === 'caregiver' ? caregiverNavItems : patientNavItems;

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-[100]">
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card rounded-[2rem] px-6 py-3 border-white/10 shadow-2xl flex items-center justify-between"
      >
        {/* Logo */}
        <Link to={user?.role === 'caregiver' ? '/caregiver' : '/dashboard'}>
          <motion.div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter hidden sm:block">Recover<span className="text-violet-400">AI</span></span>
          </motion.div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
           {navItems.map(item => {
             const isActive = location.pathname === item.path;
             return (
               <Link key={item.path} to={item.path}>
                 <motion.div 
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                      isActive ? 'bg-white text-violet-600 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                 >
                   <item.icon className="w-4 h-4" />
                   {item.label}
                 </motion.div>
               </Link>
             );
           })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
           {/* Notification */}
           <motion.button 
             whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
             className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative"
           >
              <Bell className="w-5 h-5" />
              {urgentCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-pulse ring-2 ring-slate-900">{urgentCount}</span>}
           </motion.button>

           {/* Profile */}
           <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl pl-4 pr-1.5 py-1.5 ml-2">
              <div className="hidden lg:block text-right">
                <div className="text-[10px] font-black text-violet-400 uppercase tracking-tighter leading-none">{user?.role}</div>
                <div className="text-xs font-bold text-white leading-tight">{user?.name?.split(' ')[0]}</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                {getInitials(user?.name || '')}
              </div>
           </div>

           {/* Mobile Menu Toggle */}
           <button 
             onClick={() => setIsMenuOpen(!isMenuOpen)}
             className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400"
           >
              {isMenuOpen ? <X /> : <Menu />}
           </button>

           {/* Logout (Desktop) */}
           <button 
             onClick={handleLogout}
             className="hidden md:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="md:hidden mt-4 glass-card rounded-3xl p-4 border-white/10 shadow-2xl"
          >
             <div className="flex flex-col gap-2">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                      <div className={`flex items-center gap-4 p-4 rounded-2xl font-bold uppercase tracking-widest text-xs ${
                        isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5'
                      }`}>
                         <item.icon className="w-5 h-5" /> {item.label}
                      </div>
                    </Link>
                  );
                })}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-4 rounded-2xl font-bold uppercase tracking-widest text-xs text-rose-400 hover:bg-rose-500/10"
                >
                   <LogOut className="w-5 h-5" /> Logout
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
