import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, ArrowLeft, Mail, Lock, User, UserCheck, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    parentName: '',
    studentName: '',
    studentEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, demoLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isLogin && !formData.name && !formData.parentName) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password, formData.role);
        toast.success('Welcome back!');
        navigate(formData.role === 'tutor' ? '/tutor-dashboard' : '/student-dashboard');
      } else {
        await signUp(formData);
        toast.success('Account created successfully!');
        navigate(formData.role === 'tutor' ? '/tutor-dashboard' : '/student-dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      toast.error(errorMessage);
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'tutor' | 'student') => {
    setLoading(true);
    try {
      await demoLogin(role);
      toast.success(`Welcome to the demo ${role} account!`);
      navigate(role === 'tutor' ? '/tutor-dashboard' : '/student-dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Demo login failed';
      toast.error(errorMessage);
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-emerald/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors duration-200 p-2 rounded-lg hover:bg-white/5"
          whileHover={{ x: -5 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </motion.button>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="flex items-center justify-center space-x-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Brain className="h-8 w-8 text-primary-500" />
                <Sparkles className="h-4 w-4 text-accent-emerald absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-emerald bg-clip-text text-transparent">
                EduSync
              </span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Sign in to your account' : 'Join thousands of learners worldwide'}
            </p>
          </div>

          {/* Demo Login Buttons */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="h-4 w-4 text-accent-emerald" />
              <span className="text-sm text-gray-400">Quick Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => handleDemoLogin('tutor')}
                disabled={loading}
                className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 text-primary-400 py-3 px-4 rounded-xl font-medium hover:bg-primary-500/30 transition-all duration-200 disabled:opacity-50 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Demo Tutor
              </motion.button>
              <motion.button
                onClick={() => handleDemoLogin('student')}
                disabled={loading}
                className="bg-gradient-to-r from-accent-emerald/20 to-accent-emerald/30 border border-accent-emerald/30 text-accent-emerald py-3 px-4 rounded-xl font-medium hover:bg-accent-emerald/30 transition-all duration-200 disabled:opacity-50 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Demo Student
              </motion.button>
            </div>
            <div className="text-center mt-3">
              <span className="text-xs text-gray-500">Or use the form below</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I am a
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="student" className="bg-dark-800 text-white">Student/Parent</option>
                  <option value="tutor" className="bg-dark-800 text-white">Tutor</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Name Field (Sign Up Only) */}
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name={formData.role === 'tutor' ? 'name' : 'parentName'}
                  placeholder={formData.role === 'tutor' ? 'Full Name' : 'Parent Name'}
                  value={formData.role === 'tutor' ? formData.name : formData.parentName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  required
                />
              </div>
            )}

            {/* Student Info (Parent Sign Up Only) */}
            {!isLogin && formData.role === 'student' && (
              <>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="studentName"
                    placeholder="Student Name"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="studentEmail"
                    placeholder="Student Email (Optional)"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                required
                minLength={6}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-emerald text-white py-4 px-6 rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
            <span className="text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-500 hover:text-primary-400 font-medium transition-colors duration-200"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Demo Credentials:</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Tutor: tutor@example.com / demo123</div>
              <div>Student: student@example.com / demo123</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;