import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone,
  Stethoscope, Calendar, Activity, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth, type RegisterPatientData, type RegisterCaregiverData } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AnimatedBackground } from '../components/AnimatedBackground';

const ROLES = [
  { id: 'patient' as const, label: 'Patient', emoji: '🏥', desc: 'Track my recovery' },
  { id: 'caregiver' as const, label: 'Caregiver', emoji: '👨‍⚕️', desc: 'Monitor patients' },
];

const RegisterPage: React.FC = () => {
  const { registerPatient, registerCaregiver } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient-only fields
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (role === 'patient') {
        const data: RegisterPatientData = {
          name, email, password, age: parseInt(age),
          diagnosis, dischargeDate, doctorName, phone, emergencyContact,
        };
        await registerPatient(data);
        toast.success('Welcome to RecoverAI! 🎉', {
          style: { background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: '#fff', fontWeight: 700, borderRadius: '1rem' }
        });
        navigate('/dashboard');
      } else {
        const data: RegisterCaregiverData = { name, email, password, phone };
        await registerCaregiver(data);
        toast.success('Your caregiver account is ready! 🎉', {
          style: { background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: '#fff', fontWeight: 700, borderRadius: '1rem' }
        });
        navigate('/caregiver');
      }
    } catch (err: any) {
      const msg = err?.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Try logging in.'
        : err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "glass-input";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 relative"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold gradient-text">Create Account</h1>
            <p className="text-slate-400 mt-1 text-sm">Join RecoverAI and start your healing journey</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-3 mb-7">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className="flex-1 py-3.5 px-3 rounded-2xl font-semibold text-sm transition-all duration-300"
                style={{
                  background: role === r.id ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))' : 'rgba(255,255,255,0.04)',
                  border: role === r.id ? '2px solid rgba(139,92,246,0.6)' : '2px solid rgba(255,255,255,0.08)',
                  color: role === r.id ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  boxShadow: role === r.id ? '0 0 20px rgba(139,92,246,0.3)' : 'none',
                }}
              >
                <span className="block text-xl mb-0.5">{r.emoji}</span>
                <span>{r.label}</span>
                <span className="block text-[10px] mt-0.5 opacity-60">{r.desc}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-2 p-4 rounded-2xl mb-5 bg-rose-500/10 border border-rose-500/20"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className={labelClass}>Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your full name" required className={`${inputClass} !pl-11`} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required className={`${inputClass} !pl-11`} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000" required className={`${inputClass} !pl-11`} />
              </div>
            </div>

            {/* Patient-only fields */}
            <AnimatePresence>
              {role === 'patient' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden"
                >
                  {/* Age + Discharge Date (2-col) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Age</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="number" value={age} onChange={e => setAge(e.target.value)} min="1" max="120"
                          placeholder="45" required className={`${inputClass} !pl-11`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Discharge Date</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="date" value={dischargeDate} onChange={e => setDischargeDate(e.target.value)}
                          required className={`${inputClass} !pl-11`} />
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <label className={labelClass}>Diagnosis / Surgery</label>
                    <div className="relative group">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                        placeholder="e.g. Knee Replacement Surgery" required className={`${inputClass} !pl-11`} />
                    </div>
                  </div>

                  {/* Doctor Name */}
                  <div>
                    <label className={labelClass}>Doctor's Name</label>
                    <div className="relative group">
                      <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)}
                        placeholder="Dr. Jane Smith" required className={`${inputClass} !pl-11`} />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className={labelClass}>Emergency Contact</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="tel" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)}
                        placeholder="+1 (555) 000-0000" required className={`${inputClass} !pl-11`} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required className={`${inputClass} !pl-11 !pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                <input type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password" required className={`${inputClass} !pl-11`} />
                {confirmPassword && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 mt-2 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)', opacity: isLoading ? 0.8 : 1 }}
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <><span>Create Account</span><ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          {/* Login link */}
          <p className="text-center mt-6 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
