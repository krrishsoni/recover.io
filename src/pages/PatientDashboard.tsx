import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';
import CircularProgress from '../components/ui/CircularProgress';
import StatusBadge from '../components/ui/StatusBadge';
import EmergencySOS from '../components/layout/EmergencySOS';
import VoiceAssistant from '../components/VoiceAssistant';

const PatientDashboard: React.FC = () => {
  const { user, getTasksForPatient, getCheckInsForPatient, updateTask, getPatientById } = useAuth();
  
  const patient = user?.id ? getPatientById(user.id) : null;
  const tasks = user?.id ? getTasksForPatient(user.id) : [];
  const checkIns = user?.id ? getCheckInsForPatient(user.id) : [];
  const todayCheckIn = checkIns.find(c => 
    new Date(c.date).toDateString() === new Date().toDateString()
  );

  // Calculate stats
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const dischargeDate = patient?.dischargeDate ? new Date(patient.dischargeDate) : new Date();
    const daysSinceDischarge = Math.max(0, Math.floor((Date.now() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24)));
    const recoveryProgress = Math.min(100, Math.round((daysSinceDischarge / 14) * 100));

    // Calculate streak (consecutive days with check-ins)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const hasCheckIn = checkIns.some(c => 
        new Date(c.date).toDateString() === checkDate.toDateString()
      );
      if (hasCheckIn || i === 0) streak++;
      else break;
    }

    return { completedTasks, totalTasks, taskProgress, daysSinceDischarge, recoveryProgress, streak };
  }, [tasks, checkIns, patient]);

  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    pill: Pill,
    footprints: Footprints,
    bandage: () => <span className="text-lg">🩹</span>,
    droplet: Droplets,
    dumbbell: Dumbbell
  };

  const getTaskIcon = (icon: string) => {
    const IconComponent = iconMap[icon];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Recent alerts from check-ins
  const recentAlerts = checkIns.slice(0, 3).filter(c => c.alertLevel !== 'NORMAL');

  return (
    <div className="min-h-screen pb-24">
      <AnimatedBackground variant="blobs" />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl shadow-purple-500/30">
                  {user?.name ? getInitials(user.name) : '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 font-semibold text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    Day {stats.daysSinceDischarge + 1} of recovery
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full text-orange-700 font-semibold text-sm">
                    <Award className="w-3.5 h-3.5" />
                    {stats.streak} day streak 🔥
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8"
        >
          {[
            {
              label: 'Recovery Progress',
              value: `${stats.recoveryProgress}%`,
              subtext: `${stats.daysSinceDischarge}/14 days`,
              gradient: 'from-purple-500 to-pink-500',
              icon: Target,
              color: 'purple'
            },
            {
              label: 'Tasks Today',
              value: `${stats.completedTasks}/${stats.totalTasks}`,
              subtext: `${stats.taskProgress}% complete`,
              gradient: 'from-green-500 to-emerald-500',
              icon: CheckCircle2,
              color: 'green'
            },
            {
              label: 'Next Appointment',
              value: 'In 3 days',
              subtext: 'Dr. Emily Chen',
              gradient: 'from-blue-500 to-cyan-500',
              icon: Calendar,
              color: 'blue'
            }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <GlassCard className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className={`w-4 h-4 text-${stat.color}-500`} />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <GlassCard padding="lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Tasks</h2>
                  <p className="text-gray-500 text-sm mt-1">Keep up the great work! 💪</p>
                </div>
                <CircularProgress progress={stats.taskProgress} size={70} />
              </div>

              {/* Task list */}
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="group"
                  >
                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`
                        flex items-center gap-4 p-4 rounded-2xl cursor-pointer
                        transition-all duration-300 border-2
                        ${task.completed
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                          : 'bg-white/50 hover:bg-white border-transparent hover:border-purple-200'
                        }
                      `}
                    >
                      {/* Checkbox */}
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => updateTask(task.id, !task.completed)}
                          className="sr-only"
                        />
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className={`
                            w-7 h-7 rounded-xl border-2 flex items-center justify-center
                            transition-all duration-300
                            ${task.completed
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-500'
                              : 'border-gray-300 group-hover:border-purple-400'
                            }
                          `}
                        >
                          {task.completed && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.div>
                      </div>

                      {/* Task icon */}
                      <div className={`
                        p-2.5 rounded-xl flex-shrink-0
                        ${task.completed ? 'bg-white/60' : 'bg-gradient-to-br from-purple-50 to-pink-50'}
                        transition-colors duration-300
                      `}>
                        <span className={task.completed ? 'text-green-600' : 'text-purple-600'}>
                          {getTaskIcon(task.icon)}
                        </span>
                      </div>

                      {/* Task details */}
                      <div className="flex-1 min-w-0">
                        <p className={`
                          font-semibold transition-all duration-300
                          ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}
                        `}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {task.time}
                        </p>
                      </div>

                      {/* Completion badge */}
                      {task.completed && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex-shrink-0"
                        >
                          Done! ✨
                        </motion.span>
                      )}
                    </motion.label>
                  </motion.div>
                ))}
              </div>

              {/* Mark all complete */}
              <button
                onClick={() => tasks.forEach(t => !t.completed && updateTask(t.id, true))}
                className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 font-medium hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition-all duration-300"
              >
                Mark all as complete 🎯
              </button>
            </GlassCard>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Daily Check-in Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 shadow-2xl shadow-purple-500/40"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <ClipboardCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Daily Check-in</h3>
                    <p className="text-purple-100 text-sm">
                      {todayCheckIn ? 'Completed today!' : '~2 mins to complete'}
                    </p>
                  </div>
                </div>

                <p className="text-white/90 mb-6 leading-relaxed">
                  {todayCheckIn 
                    ? 'Great job completing your check-in! Your caregiver has been updated. 💜'
                    : 'Share how you\'re feeling today. It helps us track your recovery! 💜'
                  }
                </p>

                {!todayCheckIn ? (
                  <Link to="/checkin">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 px-6 bg-white text-purple-600 rounded-2xl font-bold shadow-xl shadow-black/20 hover:shadow-2xl flex items-center justify-center gap-2"
                    >
                      Complete Check-in
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2 py-4 bg-white/20 backdrop-blur-sm rounded-2xl"
                  >
                    <CheckCircle2 className="w-6 h-6 text-white" />
                    <span className="text-white font-semibold">Completed Today! 🎉</span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Recent Alerts */}
            {recentAlerts.length > 0 && (
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-gray-800">Recent Alerts</h3>
                </div>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`
                        p-3 rounded-xl border-l-4
                        ${alert.alertLevel === 'URGENT' 
                          ? 'bg-red-50 border-red-500' 
                          : 'bg-yellow-50 border-yellow-500'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge status={alert.alertLevel} size="sm" />
                        <span className="text-xs text-gray-500">
                          {new Date(alert.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        Pain level: {alert.pain}/10
                        {alert.symptoms.length > 0 && ` • ${alert.symptoms.join(', ')}`}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Recovery Tip */}
            <GlassCard className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Recovery Tip</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Remember to take short walks throughout the day. Even 5-10 minutes of gentle movement can significantly improve your recovery! 🚶‍♂️
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </main>

      <VoiceAssistant />
      <EmergencySOS />
    </div>
  );
};

export default PatientDashboard;
