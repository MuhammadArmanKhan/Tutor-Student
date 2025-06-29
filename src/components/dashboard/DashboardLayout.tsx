import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Video, 
  Users, 
  Settings, 
  LogOut,
  Brain,
  Sparkles,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: 'student' | 'tutor';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const studentNavItems = [
    { icon: Home, label: 'Overview', href: '/student-dashboard' },
    { icon: BarChart3, label: 'Analytics', href: '/student-dashboard/analytics' },
    { icon: Video, label: 'Sessions', href: '/student-dashboard/sessions' },
    { icon: Users, label: 'Tutors', href: '/student-dashboard/tutors' },
    { icon: Settings, label: 'Settings', href: '/student-dashboard/settings' },
  ];

  const tutorNavItems = [
    { icon: Home, label: 'Overview', href: '/tutor-dashboard' },
    { icon: Users, label: 'Students', href: '/tutor-dashboard/students' },
    { icon: Video, label: 'Sessions', href: '/tutor-dashboard/sessions' },
    { icon: BarChart3, label: 'Analytics', href: '/tutor-dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/tutor-dashboard/settings' },
  ];

  const navItems = role === 'student' ? studentNavItems : tutorNavItems;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-dark-800 border-r border-white/10 lg:relative lg:translate-x-0 lg:block"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary-500" />
                <Sparkles className="h-4 w-4 text-accent-emerald absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-emerald bg-clip-text text-transparent">
                EduSync
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <motion.button
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-left"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-emerald rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-medium truncate">{user?.name || 'User'}</div>
                <div className="text-gray-400 text-sm capitalize">{role}</div>
              </div>
            </div>
            <motion.button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-dark-800/50 backdrop-blur-sm border-b border-white/10 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-white truncate">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;