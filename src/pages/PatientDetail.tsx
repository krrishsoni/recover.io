import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Mail,
  AlertTriangle,
  Calendar,
  Clock,
  Activity,
  FileText,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Plus,
  X,
  User,
  Stethoscope
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import GradientButton from '../components/ui/GradientButton';
import toast from 'react-hot-toast';

type TabType = 'overview' | 'symptoms' | 'tasks' | 'trends' | 'notes';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getPatientById, 
    getCheckInsForPatient, 
    getTasksForPatient, 
    getNotesForPatient,
    addCaregiverNote,
    user 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);

  const patientId = parseInt(id || '0');
  const patient = getPatientById(patientId);
  const checkIns = getCheckInsForPatient(patientId);
  const tasks = getTasksForPatient(patientId);
  const notes = getNotesForPatient(patientId);

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-xl font-semibold text-gray-600">Patient not found</p>
          <button
            onClick={() => navigate('/caregiver')}
            className="mt-4 text-purple-600 font-medium hover:underline"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const latestCheckIn = checkIns[0];
  const status = latestCheckIn?.alertLevel?.toLowerCase() as 'urgent' | 'monitor' | 'normal' || 'normal';

  // Prepare chart data
  const chartData = useMemo(() => {
    return checkIns.slice(0, 7).reverse().map(checkIn => ({
      date: new Date(checkIn.date).toLocaleDateString('en-US', { weekday: 'short' }),
      pain: checkIn.pain,
      temp: checkIn.temperature,
      symptoms: checkIn.symptoms.length
    }));
  }, [checkIns]);

  const completedTasks = tasks.filter(t => t.completed).length;
  const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const dischargeDate = new Date(patient.dischargeDate);
  const daysSinceDischarge = Math.floor((Date.now() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    addCaregiverNote({
      patientId,
      caregiverId: user?.id || 1,
      date: new Date().toISOString(),
      content: newNote,
      tags: noteTags
    });

    setNewNote('');
    setNoteTags([]);
    setShowNoteModal(false);
    toast.success('Note added successfully!');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50">
        <p className="text-sm font-semibold text-gray-800 mb-2">
          {payload[0]?.payload?.date}
        </p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'symptoms', label: 'Symptoms', icon: TrendingUp },
    { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { key: 'trends', label: 'Trends', icon: TrendingUp },
    { key: 'notes', label: 'Notes', icon: MessageSquare }
  ];

  const tagOptions = ['concern', 'improvement', 'follow-up', 'medication', 'wound', 'pain'];

  return (
    <div className="min-h-screen pb-8">
      <AnimatedBackground variant="mesh" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/caregiver')}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Patient Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard padding="lg" className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg
                  ${status === 'urgent'
                    ? 'bg-gradient-to-br from-red-400 to-orange-500'
                    : status === 'monitor'
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }
                `}>
                  {getInitials(patient.name)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
                    <StatusBadge status={latestCheckIn?.alertLevel || 'NORMAL'} />
                  </div>
                  <p className="text-gray-500 mt-1">
                    {patient.age} years old • {patient.diagnosis}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" />
                      {patient.doctorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Day {daysSinceDischarge + 1} of recovery
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <GradientButton
                  variant="outline"
                  onClick={() => toast.success(`Calling ${patient.name}...`)}
                  icon={<Phone className="w-4 h-4" />}
                >
                  Call
                </GradientButton>
                <GradientButton
                  variant="outline"
                  onClick={() => toast.success('Email opened!')}
                  icon={<Mail className="w-4 h-4" />}
                >
                  Email
                </GradientButton>
                <GradientButton
                  variant="danger"
                  onClick={() => toast.error('Doctor alerted!')}
                  icon={<AlertTriangle className="w-4 h-4" />}
                >
                  Alert Doctor
                </GradientButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all
                ${activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/70 text-gray-600 hover:bg-purple-50'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Status */}
              <GlassCard className="lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Current Status</h3>
                {latestCheckIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Last Check-in</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(latestCheckIn.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-purple-600">{latestCheckIn.pain}/10</p>
                        <p className="text-sm text-gray-600">Pain Level</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-orange-600">{latestCheckIn.temperature}°F</p>
                        <p className="text-sm text-gray-600">Temperature</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-blue-600 capitalize">{latestCheckIn.woundStatus}</p>
                        <p className="text-sm text-gray-600">Wound</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-green-600 capitalize">{latestCheckIn.mood}</p>
                        <p className="text-sm text-gray-600">Mood</p>
                      </div>
                    </div>
                    {latestCheckIn.symptoms.length > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-xl">
                        <p className="font-semibold text-yellow-800 mb-2">Reported Symptoms</p>
                        <div className="flex flex-wrap gap-2">
                          {latestCheckIn.symptoms.map((symptom, i) => (
                            <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full capitalize">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No check-ins recorded yet</p>
                )}
              </GlassCard>

              {/* Quick Stats */}
              <div className="space-y-6">
                <GlassCard>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Tasks</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-bold text-purple-600">{completedTasks}/{tasks.length}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${taskCompletion}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">7-Day Trend</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="pain"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fill="url(#painGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === 'symptoms' && (
            <GlassCard>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Symptom Timeline</h3>
              <div className="space-y-4">
                {checkIns.map((checkIn, index) => (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-4 h-4 rounded-full
                        ${checkIn.alertLevel === 'URGENT'
                          ? 'bg-red-500'
                          : checkIn.alertLevel === 'MONITOR'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        }
                      `} />
                      {index < checkIns.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-800">
                          {new Date(checkIn.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <StatusBadge status={checkIn.alertLevel} size="sm" />
                      </div>
                      <div className="bg-white/50 rounded-xl p-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Pain:</span> {checkIn.pain}/10
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Temperature:</span> {checkIn.temperature}°{checkIn.temperatureUnit}
                        </p>
                        {checkIn.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {checkIn.symptoms.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {checkIn.notes && (
                          <p className="text-sm text-gray-500 italic">"{checkIn.notes}"</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'tasks' && (
            <GlassCard>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Recovery Tasks</h3>
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                      ${task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white/50 border-gray-200'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${task.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">{task.time}</p>
                    </div>
                    {task.completed && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'trends' && (
            <GlassCard>
              <h3 className="text-lg font-bold text-gray-800 mb-6">7-Day Recovery Trends</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="pain"
                    name="Pain Level"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="symptoms"
                    name="Symptoms Count"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Caregiver Notes</h3>
                <GradientButton
                  onClick={() => setShowNoteModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Note
                </GradientButton>
              </div>

              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {new Date(note.date).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{note.content}</p>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {note.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No notes yet. Add your first note!</p>
                </GlassCard>
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add Note</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-purple-500 focus:bg-white transition-all resize-none mb-4"
            />

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Tags (optional)</p>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setNoteTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-all
                      ${noteTags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                      }
                    `}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <GradientButton
                variant="outline"
                fullWidth
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </GradientButton>
              <GradientButton
                fullWidth
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                Save Note
              </GradientButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
