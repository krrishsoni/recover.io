import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  LogOut, 
  Heart,
  Home,
  ClipboardList,
  Users,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, checkIns } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Count urgent alerts for caregiver
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
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/checkin', icon: ClipboardList, label: 'Check-in' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const caregiverNavItems = [
    { path: '/caregiver', icon: Home, label: 'Dashboard' },
    { path: '/caregiver/patients', icon: Users, label: 'Patients' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const navItems = user?.role === 'caregiver' ? caregiverNavItems : patientNavItems;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/30 shadow-lg shadow-purple-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={user?.role === 'caregiver' ? '/caregiver' : '/dashboard'}>
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                RecoverAI
              </span>
            </motion.div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 backdrop-blur-sm p-1.5 rounded-2xl">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300
                      ${isActive 
                        ? 'bg-white shadow-md text-purple-600' 
                        : 'text-gray-600 hover:text-purple-600'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 hover:bg-gray-100/50 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {urgentCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white"
                >
                  {urgentCount}
                </motion.span>
              )}
            </motion.button>

            {/* User profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-purple-500/30"
              >
                {user?.name ? getInitials(user.name) : <User className="w-5 h-5" />}
              </motion.div>
            </div>

            {/* Logout button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center gap-1 mt-3 bg-gray-100/50 backdrop-blur-sm p-1.5 rounded-2xl">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-2 rounded-xl font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-white shadow-md text-purple-600' 
                      : 'text-gray-600'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
