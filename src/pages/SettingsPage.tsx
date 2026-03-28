import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user, logout, getPatientById } = useAuth();
  const navigate = useNavigate();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [painThreshold, setPainThreshold] = useState(7);

  const patient = user?.role === 'patient' && user?.id ? getPatientById(user.id) : null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!', {
      icon: '✅',
      duration: 3000
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully!');
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-14 h-8 rounded-full transition-colors duration-300
        ${enabled ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'}
      `}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
      />
    </button>
  );

  return (
    <div className="min-h-screen pb-8">
      <AnimatedBackground variant="mesh" />
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Profile
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {user?.name ? getInitials(user.name) : '?'}
                  </div>
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                  {patient && (
                    <p className="text-purple-600 text-sm mt-1">{patient.diagnosis}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full pl-12 pr-4 py-3 bg-white/60 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      defaultValue={patient?.phone || '+1 (555) 123-4567'}
                      className="w-full pl-12 pr-4 py-3 bg-white/60 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notifications
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive daily summaries and alerts</p>
                  </div>
                  <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">SMS Alerts</p>
                    <p className="text-sm text-gray-500">Get urgent alerts via text message</p>
                  </div>
                  <Toggle enabled={smsAlerts} onChange={setSmsAlerts} />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-800">Quiet Hours</p>
                        <p className="text-sm text-gray-500">Pause non-urgent notifications</p>
                      </div>
                    </div>
                    <Toggle enabled={quietHoursEnabled} onChange={setQuietHoursEnabled} />
                  </div>

                  {quietHoursEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex gap-4 ml-8"
                    >
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Start</label>
                        <input
                          type="time"
                          value={quietHoursStart}
                          onChange={(e) => setQuietHoursStart(e.target.value)}
                          className="w-full px-3 py-2 bg-white/60 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">End</label>
                        <input
                          type="time"
                          value={quietHoursEnd}
                          onChange={(e) => setQuietHoursEnd(e.target.value)}
                          className="w-full px-3 py-2 bg-white/60 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Alert Thresholds (for caregivers/patients) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Alert Thresholds
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-gray-800">Pain Alert Threshold</p>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded-full">
                      {painThreshold}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Trigger urgent alert when pain exceeds this level
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={painThreshold}
                    onChange={(e) => setPainThreshold(Number(e.target.value))}
                    className="pain-slider w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Additional Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard padding="sm">
              <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-800">Download Recovery Plan</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </button>

              <div className="border-t border-gray-100" />

              <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-800">Privacy & Security</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </button>

              <div className="border-t border-gray-100" />

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-600">Log Out</span>
                </div>
                <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-colors" />
              </button>
            </GlassCard>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GradientButton
              fullWidth
              size="lg"
              onClick={handleSave}
              icon={<Save className="w-5 h-5" />}
            >
              Save Changes
            </GradientButton>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
