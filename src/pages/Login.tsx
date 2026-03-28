import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password, role);
    
    if (success) {
      navigate(role === 'caregiver' ? '/caregiver' : '/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = (type: 'patient' | 'caregiver') => {
    if (type === 'patient') {
      setEmail('patient@demo.com');
      setPassword('pass123');
      setRole('patient');
    } else {
      setEmail('caregiver@demo.com');
      setPassword('pass123');
      setRole('caregiver');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl bg-white/90">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">+</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RecoverAI</h1>
            <p className="text-gray-600 mt-1">Your Post-Discharge Care Companion</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                role === 'patient'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('caregiver')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                role === 'caregiver'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Caregiver
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Demo Credentials</p>
            <div className="flex space-x-2">
              <button
                onClick={() => fillDemoCredentials('patient')}
                className="flex-1 py-2 px-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                Patient Demo
              </button>
              <button
                onClick={() => fillDemoCredentials('caregiver')}
                className="flex-1 py-2 px-3 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
              >
                Caregiver Demo
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500 text-center space-y-1">
              <p>Patient: patient@demo.com / pass123</p>
              <p>Caregiver: caregiver@demo.com / pass123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
