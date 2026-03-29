import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AnimatedBackground } from '../components/AnimatedBackground';

const FLOATING_ICONS = ['💊', '🩹', '💪', '❤️', '🌡️', '🏃', '🧘', '💉', '🩺', '🔬'];

const ROLES = [
  { id: 'patient' as const, label: 'Patient', emoji: '🏥', desc: 'Track my recovery' },
  { id: 'caregiver' as const, label: 'Caregiver', emoji: '👨‍⚕️', desc: 'Monitor patients' },
];

const QUOTES = [
  'Your healing journey starts here ✨',
  'Recovery is a journey, not a destination 🌟',
  'Every day is a step toward better health 💜',
  'You are stronger than you think 💪',
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const success = await login(email, password, role);
    if (success) {
      toast.success(`Welcome back! 🎉`, {
        style: { background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: '#fff', fontWeight: 700, borderRadius: '1rem' }
      });
      navigate(role === 'caregiver' ? '/caregiver' : '/dashboard');
    } else {
      toast.error('Invalid credentials. Check your email/password or use the demo buttons.', { icon: '🔐' });
    }
    setIsLoading(false);
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      <AnimatedBackground />

      {/* Floating health icons */}
      {FLOATING_ICONS.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{ left: `${(i * 10 + 5)}%`, top: `${(i * 7 + 10) % 90}%`, opacity: 0.15 }}
          animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        >
          {icon}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass card */}
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10">

          {/* Logo */}
          <motion.div className="text-center mb-8"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3, stiffness: 200 }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 relative"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              <Activity className="w-10 h-10 text-white" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl opacity-40"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', filter: 'blur(12px)', zIndex: -1 }}
              />
            </div>
            <h1 className="text-5xl font-extrabold gradient-text leading-tight">RecoverAI</h1>
            <motion.p
              className="text-slate-400 mt-2 text-sm font-medium"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {QUOTES[quoteIdx]}
            </motion.p>
          </motion.div>

          {/* Role selector */}
          <motion.div className="flex gap-3 mb-7"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className="flex-1 py-3.5 px-3 rounded-2xl font-semibold text-sm transition-all duration-300 relative overflow-hidden"
                style={{
                  background: role === r.id ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))' : 'rgba(255,255,255,0.04)',
                  border: role === r.id ? '2px solid rgba(139,92,246,0.6)' : '2px solid rgba(255,255,255,0.08)',
                  color: role === r.id ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  boxShadow: role === r.id ? '0 0 20px rgba(139,92,246,0.3)' : 'none',
                }}
              >
                <span className="block text-xl mb-0.5">{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div className="relative group"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                className="glass-input !pl-12"
              />
            </motion.div>

            {/* Password */}
            <motion.div className="relative group"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required
                className="glass-input !pl-12 !pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-violet-400 transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.03 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="w-full py-4 mt-2 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                opacity: isLoading ? 0.8 : 1,
              }}
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <><span>Begin Recovery Journey</span><ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>


        </div>

        <motion.p className="text-center mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          New here?{' '}
          <Link to="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
            Create an account →
          </Link>
        </motion.p>

        <motion.p className="text-center mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          © 2025 RecoverAI · Built with ❤️ for your healing journey
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
