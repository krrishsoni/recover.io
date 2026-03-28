import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(email, password, role);
    
    if (success) {
      toast.success(`Welcome back! 🎉`, {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontWeight: 600
        }
      });
      navigate(role === 'caregiver' ? '/caregiver' : '/dashboard');
    } else {
      toast.error('Invalid credentials. Please try again.', {
        icon: '🔐'
      });
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = (demoRole: 'patient' | 'caregiver') => {
    setRole(demoRole);
    setEmail(demoRole === 'patient' ? 'patient@demo.com' : 'caregiver@demo.com');
    setPassword('pass123');
    toast.success('Demo credentials filled!', {
      icon: '✨',
      duration: 2000
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-cyan-50" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Main card */}
        <div className="backdrop-blur-2xl bg-white/50 p-8 sm:p-10 rounded-[2.5rem] border border-white/50 shadow-[0_8px_64px_rgba(124,58,237,0.15)]">
          {/* Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 shadow-2xl shadow-purple-500/50 mb-4 relative">
              <Heart className="w-10 h-10 text-white" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 opacity-50 blur-lg -z-10"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              RecoverAI
            </h1>
            <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Your healing companion
              <Sparkles className="w-4 h-4 text-pink-500" />
            </p>
          </motion.div>

          {/* Role selector */}
          <motion.div 
            className="flex gap-2 p-1.5 bg-gray-100/70 rounded-2xl mb-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {(['patient', 'caregiver'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`
                  flex-1 py-3 rounded-xl font-semibold transition-all duration-300 capitalize
                  ${role === r
                    ? 'bg-white shadow-lg shadow-purple-500/20 text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                  }
                `}
              >
                {r === 'patient' ? '👤 Patient' : '🏥 Caregiver'}
              </button>
            ))}
          </motion.div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="
                  w-full pl-12 pr-4 py-4
                  bg-white/60 backdrop-blur-sm
                  border-2 border-gray-200/50
                  rounded-2xl
                  focus:border-purple-500 focus:bg-white
                  transition-all duration-300
                  placeholder:text-gray-400
                  text-gray-800 font-medium
                "
              />
            </motion.div>

            {/* Password input */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="
                  w-full pl-12 pr-12 py-4
                  bg-white/60 backdrop-blur-sm
                  border-2 border-gray-200/50
                  rounded-2xl
                  focus:border-purple-500 focus:bg-white
                  transition-all duration-300
                  placeholder:text-gray-400
                  text-gray-800 font-medium
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            {/* Remember me */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="remember" className="text-gray-600 cursor-pointer">
                Remember me
              </label>
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="
                w-full py-4 mt-2
                bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600
                bg-[length:200%_100%] bg-[position:0%_0%]
                hover:bg-[position:100%_0%]
                transition-all duration-700
                text-white font-bold text-lg rounded-2xl
                shadow-xl shadow-purple-500/40
                hover:shadow-2xl hover:shadow-purple-500/50
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
          >
            <p className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('patient')}
                className="px-4 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl text-sm font-medium text-purple-700 transition-colors"
              >
                👤 Patient Login
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('caregiver')}
                className="px-4 py-2 bg-white hover:bg-pink-50 border border-pink-200 rounded-xl text-sm font-medium text-pink-700 transition-colors"
              >
                🏥 Caregiver Login
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Password: <code className="bg-white px-2 py-0.5 rounded font-mono">pass123</code>
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p 
          className="text-center mt-6 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          By signing in, you agree to our{' '}
          <a href="#" className="text-purple-600 hover:underline">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
