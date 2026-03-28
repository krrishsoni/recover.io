import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  AlertCircle,
  Clock,
  Phone,
  Eye,
  Send,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';

import GradientButton from '../components/ui/GradientButton';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'urgent' | 'stable' | 'overdue';

const CaregiverDashboard: React.FC = () => {
  const { user, getPatientsForCaregiver, getCheckInsForPatient, getTasksForPatient } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const patients = user?.id ? getPatientsForCaregiver(user.id) : [];

  // Calculate patient statuses
  const patientStats = useMemo(() => {
    return patients.map(patient => {
      const checkIns = getCheckInsForPatient(patient.id);
      const latestCheckIn = checkIns[0];
      const tasks = getTasksForPatient(patient.id);
      
      const today = new Date();
      const hasCheckInToday = checkIns.some(c => 
        new Date(c.date).toDateString() === today.toDateString()
      );

      let status: 'urgent' | 'monitor' | 'normal' = 'normal';
      if (latestCheckIn?.alertLevel === 'URGENT') status = 'urgent';
      else if (latestCheckIn?.alertLevel === 'MONITOR' || !hasCheckInToday) status = 'monitor';

      const dischargeDate = new Date(patient.dischargeDate);
      const daysSinceDischarge = Math.floor((today.getTime() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24));
      const recoveryProgress = Math.min(100, Math.round((daysSinceDischarge / 14) * 100));

      const completedTasks = tasks.filter(t => t.completed).length;
      const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

      // Calculate relative time
      const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
      };

      return {
        ...patient,
        status,
        latestCheckIn,
        pain: latestCheckIn?.pain ?? 0,
        taskCompletion,
        recoveryProgress,
        lastCheckInTime: latestCheckIn ? getRelativeTime(new Date(latestCheckIn.date)) : 'No check-ins',
        isOverdue: !hasCheckInToday,
        alerts: latestCheckIn?.alertLevel !== 'NORMAL' ? 1 : 0
      };
    });
  }, [patients, getCheckInsForPatient, getTasksForPatient]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patientStats.filter(patient => {
      // Search filter
      const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      if (activeFilter === 'urgent') return matchesSearch && patient.status === 'urgent';
      if (activeFilter === 'stable') return matchesSearch && patient.status === 'normal';
      if (activeFilter === 'overdue') return matchesSearch && patient.isOverdue;
      
      return matchesSearch;
    });
  }, [patientStats, searchQuery, activeFilter]);

  // Count alerts
  const alertCounts = useMemo(() => {
    return {
      urgent: patientStats.filter(p => p.status === 'urgent').length,
      monitor: patientStats.filter(p => p.status === 'monitor').length,
      normal: patientStats.filter(p => p.status === 'normal').length
    };
  }, [patientStats]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filterTabs: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Patients', icon: <Users className="w-4 h-4" /> },
    { key: 'urgent', label: 'Needs Attention', icon: <AlertCircle className="w-4 h-4" /> },
    { key: 'stable', label: 'Stable', icon: <Activity className="w-4 h-4" /> },
    { key: 'overdue', label: 'Overdue', icon: <Clock className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen pb-8">
      <AnimatedBackground variant="mesh" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0]}! 👩‍⚕️
          </h1>
          <p className="text-gray-500 mt-1">Here's your patient overview for today</p>
        </motion.div>

        {/* Alert Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {[
            { count: alertCounts.urgent, label: 'Urgent', color: 'red', emoji: '🔴' },
            { count: alertCounts.monitor, label: 'Monitor', color: 'yellow', emoji: '🟡' },
            { count: alertCounts.normal, label: 'Stable', color: 'green', emoji: '🟢' }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <GlassCard className={`text-center border-${item.color}-200`}>
                <span className="text-2xl mb-2 block">{item.emoji}</span>
                <p className="text-3xl font-bold text-gray-800">{item.count}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Urgent Alert Banner */}
        {alertCounts.urgent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-red-500/30"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">
                    ⚠️ {alertCounts.urgent} patient{alertCounts.urgent > 1 ? 's' : ''} need{alertCounts.urgent === 1 ? 's' : ''} immediate attention
                  </p>
                  <p className="text-red-100 text-sm">Click to view urgent cases</p>
                </div>
              </div>
              <button
                onClick={() => setActiveFilter('urgent')}
                className="px-6 py-2 bg-white text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                View All Alerts
              </button>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl focus:border-purple-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <GradientButton
                variant="outline"
                size="sm"
                onClick={() => toast.success('Reminders sent to all patients!')}
                icon={<Send className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Send Reminders</span>
              </GradientButton>
              <GradientButton
                variant="outline"
                size="sm"
                onClick={() => toast.success('Report exported!')}
                icon={<FileText className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Export</span>
              </GradientButton>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all
                  ${activeFilter === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/70 text-gray-600 hover:bg-purple-50'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.key === 'urgent' && alertCounts.urgent > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {alertCounts.urgent}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Patient Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className={`
                absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 -z-10
                ${patient.status === 'urgent' 
                  ? 'bg-gradient-to-br from-red-400 to-orange-400'
                  : patient.status === 'monitor'
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                  : 'bg-gradient-to-br from-green-400 to-emerald-400'
                }
              `} />

              <div className={`
                relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-6
                border-2 transition-all duration-500
                ${patient.status === 'urgent'
                  ? 'border-red-200 hover:border-red-400'
                  : patient.status === 'monitor'
                  ? 'border-yellow-200 hover:border-yellow-400'
                  : 'border-white/50 hover:border-green-200'
                }
                shadow-xl group-hover:shadow-2xl
              `}>
                {/* Status ribbon */}
                {patient.status === 'urgent' && (
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                    <div className="absolute top-6 -right-8 rotate-45 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold py-1 w-32 text-center shadow-lg">
                      URGENT
                    </div>
                  </div>
                )}

                {/* Patient info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg
                      ${patient.status === 'urgent'
                        ? 'bg-gradient-to-br from-red-400 to-orange-500'
                        : patient.status === 'monitor'
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }
                    `}>
                      {getInitials(patient.name)}
                    </div>
                    <div className={`
                      absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white
                      ${patient.status === 'urgent'
                        ? 'bg-red-500 animate-pulse'
                        : patient.status === 'monitor'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      }
                    `} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{patient.name}</h3>
                    <p className="text-sm text-gray-500">{patient.age} years</p>
                    <p className="text-sm text-purple-600 font-medium truncate">{patient.diagnosis}</p>
                  </div>
                </div>

                {/* Last check-in */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Last check-in: {patient.lastCheckInTime}</span>
                </div>

                {/* Stats mini-cards */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-purple-600">{patient.pain}</p>
                    <p className="text-xs text-gray-600">Pain</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">{patient.taskCompletion}%</p>
                    <p className="text-xs text-gray-600">Tasks</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-green-600">{patient.recoveryProgress}%</p>
                    <p className="text-xs text-gray-600">Recovery</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Recovery Progress</span>
                    <span className="font-semibold">{patient.recoveryProgress}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${patient.recoveryProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                      className={`h-full rounded-full ${
                        patient.status === 'urgent'
                          ? 'bg-gradient-to-r from-red-400 to-orange-500'
                          : patient.status === 'monitor'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                          : 'bg-gradient-to-r from-green-400 to-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Alert badge */}
                {patient.alerts > 0 && (
                  <div className={`
                    flex items-center gap-2 p-3 mb-4 rounded-xl border-2
                    ${patient.status === 'urgent'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }
                  `}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {patient.alerts} alert flagged
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link to={`/caregiver/patient/${patient.id}`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toast.success(`Calling ${patient.name}...`)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Phone className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredPatients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-semibold text-gray-600">No patients found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CaregiverDashboard;
